// XOS Multi-Tenant Architecture Complete Patterns
// Comprehensive examples for multi-tenant data isolation and management

using XOS.Data;
using XOS.Security;
using System.Data;
using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace XOS.Patterns.Database.MultiTenant
{
    // ============================================================================
    // BASIC MULTI-TENANT PATTERNS
    // ============================================================================

    public class BasicMultiTenantService : XOSServiceBase
    {
        // ✅ CORRECT: Always include client_id in queries
        public async Task<List<User>> GetUsers()
        {
            return await DBService.GetListAsync<User>(
                "SELECT * FROM users WHERE client_id = @client_id ORDER BY name",
                new { client_id = ClientId }
            );
        }

        // ❌ WRONG: Missing client_id filter - data leak vulnerability
        public async Task<List<User>> GetUsers_Wrong()
        {
            // This will return users from ALL tenants!
            return await DBService.GetListAsync<User>(
                "SELECT * FROM users ORDER BY name"
            );
        }

        // ✅ CORRECT: Insert with client_id
        public async Task<int> CreateUser(CreateUserRequest request)
        {
            return await DBService.GetValueAsync<int>(
                "INSERT INTO users (name, email, client_id, created_at) VALUES (@name, @email, @client_id, CURRENT_TIMESTAMP) RETURNING id",
                new { name = request.Name, email = request.Email, client_id = ClientId }
            );
        }

        // ✅ CORRECT: Update with client_id verification
        public async Task<bool> UpdateUser(int userId, UpdateUserRequest request)
        {
            var affected = await DBService.ExecuteAsync(
                "UPDATE users SET name = @name, email = @email, updated_at = CURRENT_TIMESTAMP WHERE id = @id AND client_id = @client_id",
                new { name = request.Name, email = request.Email, id = userId, client_id = ClientId }
            );

            return affected > 0;
        }

        // ✅ CORRECT: Delete with client_id verification
        public async Task<bool> DeleteUser(int userId)
        {
            var affected = await DBService.ExecuteAsync(
                "DELETE FROM users WHERE id = @id AND client_id = @client_id",
                new { id = userId, client_id = ClientId }
            );

            return affected > 0;
        }

        // ✅ CORRECT: Complex queries with proper tenant isolation
        public async Task<List<UserWithProjects>> GetUsersWithProjects()
        {
            return await DBService.GetListAsync<UserWithProjects>(@"
                SELECT u.id, u.name, u.email,
                       COUNT(p.id) as project_count,
                       COALESCE(ARRAY_AGG(p.name) FILTER (WHERE p.name IS NOT NULL), '{}') as project_names
                FROM users u
                LEFT JOIN project_members pm ON u.id = pm.user_id AND pm.client_id = @client_id
                LEFT JOIN projects p ON pm.project_id = p.id AND p.client_id = @client_id
                WHERE u.client_id = @client_id
                GROUP BY u.id, u.name, u.email
                ORDER BY u.name",
                new { client_id = ClientId }
            );
        }
    }

    // ============================================================================
    // ADVANCED TENANT ISOLATION PATTERNS
    // ============================================================================

    public class AdvancedMultiTenantService : XOSServiceBase
    {
        // ✅ CORRECT: Row Level Security (RLS) setup
        public async Task SetupRowLevelSecurity()
        {
            // Enable RLS on tables
            await DBService.ExecuteAsync("ALTER TABLE users ENABLE ROW LEVEL SECURITY");
            await DBService.ExecuteAsync("ALTER TABLE projects ENABLE ROW LEVEL SECURITY");
            await DBService.ExecuteAsync("ALTER TABLE documents ENABLE ROW LEVEL SECURITY");

            // Create policies for tenant isolation
            await DBService.ExecuteAsync(@"
                CREATE POLICY tenant_isolation_users ON users
                USING (client_id = current_setting('app.current_client_id')::int)
                WITH CHECK (client_id = current_setting('app.current_client_id')::int)");

            await DBService.ExecuteAsync(@"
                CREATE POLICY tenant_isolation_projects ON projects
                USING (client_id = current_setting('app.current_client_id')::int)
                WITH CHECK (client_id = current_setting('app.current_client_id')::int)");

            await DBService.ExecuteAsync(@"
                CREATE POLICY tenant_isolation_documents ON documents
                USING (client_id = current_setting('app.current_client_id')::int)
                WITH CHECK (client_id = current_setting('app.current_client_id')::int)");
        }

        // ✅ CORRECT: Set session context for RLS
        public async Task<T> ExecuteWithTenantContext<T>(Func<Task<T>> operation)
        {
            // Set the tenant context for this session
            await DBService.ExecuteAsync(
                "SELECT set_config('app.current_client_id', @client_id::text, true)",
                new { client_id = ClientId }
            );

            try
            {
                return await operation();
            }
            finally
            {
                // Clear the context
                await DBService.ExecuteAsync("SELECT set_config('app.current_client_id', NULL, true)");
            }
        }

        // ✅ CORRECT: Tenant-aware bulk operations
        public async Task<bool> BulkCreateUsers(List<CreateUserRequest> requests)
        {
            using var transaction = await DBService.BeginTransactionAsync();
            try
            {
                // Prepare bulk data with client_id
                var bulkData = requests.Select(r => new
                {
                    name = r.Name,
                    email = r.Email,
                    client_id = ClientId,
                    created_at = DateTime.UtcNow
                }).ToArray();

                // Use parameterized bulk insert
                await DBService.BulkInsertAsync("users", bulkData, transaction);

                // Log bulk operation
                await DBService.ExecuteAsync(
                    "INSERT INTO audit_log (action, table_name, record_count, client_id, created_at) VALUES (@action, @table_name, @record_count, @client_id, CURRENT_TIMESTAMP)",
                    new { action = "bulk_insert", table_name = "users", record_count = requests.Count, client_id = ClientId },
                    transaction: transaction
                );

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ✅ CORRECT: Cross-tenant operations (admin only)
        public async Task<List<TenantSummary>> GetTenantSummaries()
        {
            // Verify admin permissions
            if (!IsSystemAdmin())
            {
                throw new UnauthorizedAccessException("Admin access required");
            }

            return await DBService.GetListAsync<TenantSummary>(@"
                SELECT 
                    c.id as client_id,
                    c.name as client_name,
                    COUNT(DISTINCT u.id) as user_count,
                    COUNT(DISTINCT p.id) as project_count,
                    COUNT(DISTINCT d.id) as document_count,
                    c.created_at,
                    c.subscription_tier
                FROM clients c
                LEFT JOIN users u ON c.id = u.client_id
                LEFT JOIN projects p ON c.id = p.client_id
                LEFT JOIN documents d ON c.id = d.client_id
                GROUP BY c.id, c.name, c.created_at, c.subscription_tier
                ORDER BY c.name"
            );
        }

        // ✅ CORRECT: Tenant data export with isolation
        public async Task<TenantDataExport> ExportTenantData()
        {
            var export = new TenantDataExport { ClientId = ClientId };

            // Export users
            export.Users = await DBService.GetListAsync<UserExportData>(
                "SELECT id, name, email, created_at FROM users WHERE client_id = @client_id ORDER BY id",
                new { client_id = ClientId }
            );

            // Export projects
            export.Projects = await DBService.GetListAsync<ProjectExportData>(
                "SELECT id, name, description, created_at FROM projects WHERE client_id = @client_id ORDER BY id",
                new { client_id = ClientId }
            );

            // Export documents
            export.Documents = await DBService.GetListAsync<DocumentExportData>(@"
                SELECT d.id, d.title, d.content, d.project_id, d.created_at,
                       u.name as created_by_name
                FROM documents d
                JOIN users u ON d.created_by = u.id AND u.client_id = @client_id
                WHERE d.client_id = @client_id
                ORDER BY d.id",
                new { client_id = ClientId }
            );

            export.ExportedAt = DateTime.UtcNow;
            return export;
        }

        // ✅ CORRECT: Tenant data import with validation
        public async Task<ImportResult> ImportTenantData(TenantDataImport import)
        {
            using var transaction = await DBService.BeginTransactionAsync();
            var result = new ImportResult();

            try
            {
                // Validate import doesn't conflict with existing data
                var existingUserEmails = await DBService.GetListAsync<string>(
                    "SELECT email FROM users WHERE client_id = @client_id",
                    new { client_id = ClientId },
                    transaction: transaction
                );

                var conflictingEmails = import.Users
                    .Where(u => existingUserEmails.Contains(u.Email))
                    .Select(u => u.Email)
                    .ToList();

                if (conflictingEmails.Any())
                {
                    result.Errors.Add($"Email conflicts: {string.Join(", ", conflictingEmails)}");
                    await transaction.RollbackAsync();
                    return result;
                }

                // Import users with ID mapping
                var userIdMap = new Dictionary<int, int>();
                foreach (var user in import.Users)
                {
                    var newUserId = await DBService.GetValueAsync<int>(
                        "INSERT INTO users (name, email, client_id, created_at) VALUES (@name, @email, @client_id, @created_at) RETURNING id",
                        new { name = user.Name, email = user.Email, client_id = ClientId, created_at = user.CreatedAt },
                        transaction: transaction
                    );
                    userIdMap[user.Id] = newUserId;
                }

                // Import projects with ID mapping
                var projectIdMap = new Dictionary<int, int>();
                foreach (var project in import.Projects)
                {
                    var newProjectId = await DBService.GetValueAsync<int>(
                        "INSERT INTO projects (name, description, client_id, created_at) VALUES (@name, @description, @client_id, @created_at) RETURNING id",
                        new { name = project.Name, description = project.Description, client_id = ClientId, created_at = project.CreatedAt },
                        transaction: transaction
                    );
                    projectIdMap[project.Id] = newProjectId;
                }

                // Import documents with mapped IDs
                foreach (var document in import.Documents)
                {
                    if (userIdMap.TryGetValue(document.CreatedBy, out var mappedUserId) &&
                        projectIdMap.TryGetValue(document.ProjectId, out var mappedProjectId))
                    {
                        await DBService.ExecuteAsync(
                            "INSERT INTO documents (title, content, project_id, created_by, client_id, created_at) VALUES (@title, @content, @project_id, @created_by, @client_id, @created_at)",
                            new { 
                                title = document.Title, 
                                content = document.Content, 
                                project_id = mappedProjectId, 
                                created_by = mappedUserId, 
                                client_id = ClientId, 
                                created_at = document.CreatedAt 
                            },
                            transaction: transaction
                        );
                    }
                }

                await transaction.CommitAsync();
                result.Success = true;
                result.ImportedUsers = import.Users.Count;
                result.ImportedProjects = import.Projects.Count;
                result.ImportedDocuments = import.Documents.Count;

                return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                result.Errors.Add($"Import failed: {ex.Message}");
                return result;
            }
        }
    }

    // ============================================================================
    // TENANT SECURITY PATTERNS
    // ============================================================================

    public class TenantSecurityService : XOSServiceBase
    {
        // ✅ CORRECT: Verify tenant access for sensitive operations
        public async Task<bool> VerifyTenantAccess(int resourceId, string resourceType)
        {
            var query = resourceType.ToLower() switch
            {
                "user" => "SELECT client_id FROM users WHERE id = @id",
                "project" => "SELECT client_id FROM projects WHERE id = @id",
                "document" => "SELECT client_id FROM documents WHERE id = @id",
                _ => throw new ArgumentException($"Unknown resource type: {resourceType}")
            };

            var resourceClientId = await DBService.GetValueAsync<int?>(query, new { id = resourceId });
            return resourceClientId == ClientId;
        }

        // ✅ CORRECT: Audit tenant access
        public async Task LogTenantAccess(string action, string resourceType, int? resourceId = null)
        {
            await DBService.ExecuteAsync(@"
                INSERT INTO tenant_access_log (
                    client_id, user_id, action, resource_type, resource_id, 
                    ip_address, user_agent, created_at
                ) VALUES (
                    @client_id, @user_id, @action, @resource_type, @resource_id,
                    @ip_address, @user_agent, CURRENT_TIMESTAMP
                )",
                new {
                    client_id = ClientId,
                    user_id = UserId,
                    action = action,
                    resource_type = resourceType,
                    resource_id = resourceId,
                    ip_address = GetClientIpAddress(),
                    user_agent = GetUserAgent()
                }
            );
        }

        // ✅ CORRECT: Rate limiting per tenant
        public async Task<bool> CheckRateLimit(string operation, int maxRequests, TimeSpan window)
        {
            var windowStart = DateTime.UtcNow.Subtract(window);
            
            var requestCount = await DBService.GetValueAsync<int>(@"
                SELECT COUNT(*) FROM rate_limit_log 
                WHERE client_id = @client_id 
                  AND operation = @operation 
                  AND created_at >= @window_start",
                new { client_id = ClientId, operation = operation, window_start = windowStart }
            );

            if (requestCount >= maxRequests)
            {
                await LogTenantAccess($"rate_limit_exceeded_{operation}", "system");
                return false;
            }

            // Log this request
            await DBService.ExecuteAsync(@"
                INSERT INTO rate_limit_log (client_id, user_id, operation, created_at)
                VALUES (@client_id, @user_id, @operation, CURRENT_TIMESTAMP)",
                new { client_id = ClientId, user_id = UserId, operation = operation }
            );

            return true;
        }

        // ✅ CORRECT: Tenant data encryption at rest
        public async Task<string> EncryptSensitiveData(string data)
        {
            // Get tenant-specific encryption key
            var encryptionKey = await GetTenantEncryptionKey();
            
            // Encrypt data using tenant key
            var encryptedData = await EncryptWithKey(data, encryptionKey);
            
            // Log encryption operation
            await LogTenantAccess("data_encrypted", "security");
            
            return encryptedData;
        }

        public async Task<string> DecryptSensitiveData(string encryptedData)
        {
            // Get tenant-specific encryption key
            var encryptionKey = await GetTenantEncryptionKey();
            
            // Decrypt data using tenant key
            var decryptedData = await DecryptWithKey(encryptedData, encryptionKey);
            
            // Log decryption operation
            await LogTenantAccess("data_decrypted", "security");
            
            return decryptedData;
        }

        // ✅ CORRECT: Tenant permission verification
        public async Task<bool> HasTenantPermission(string permission)
        {
            return await DBService.GetValueAsync<bool>(@"
                SELECT EXISTS(
                    SELECT 1 FROM user_permissions up
                    JOIN permissions p ON up.permission_id = p.id
                    WHERE up.user_id = @user_id 
                      AND up.client_id = @client_id
                      AND p.name = @permission
                      AND up.is_active = true
                )",
                new { user_id = UserId, client_id = ClientId, permission = permission }
            );
        }
    }

    // ============================================================================
    // TENANT MIGRATION PATTERNS
    // ============================================================================

    public class TenantMigrationService : XOSServiceBase
    {
        // ✅ CORRECT: Tenant data migration between environments
        public async Task<MigrationResult> MigrateTenantToNewEnvironment(int sourceClientId, string targetEnvironment)
        {
            if (!IsSystemAdmin())
            {
                throw new UnauthorizedAccessException("Admin access required for tenant migration");
            }

            var result = new MigrationResult();
            using var transaction = await DBService.BeginTransactionAsync();

            try
            {
                // 1. Create migration record
                var migrationId = await DBService.GetValueAsync<int>(@"
                    INSERT INTO tenant_migrations (
                        source_client_id, target_environment, status, started_at, started_by
                    ) VALUES (@source_client_id, @target_environment, 'in_progress', CURRENT_TIMESTAMP, @started_by)
                    RETURNING id",
                    new { 
                        source_client_id = sourceClientId, 
                        target_environment = targetEnvironment, 
                        started_by = UserId 
                    },
                    transaction: transaction
                );

                // 2. Export tenant data
                var exportData = await ExportTenantDataForMigration(sourceClientId, transaction);
                
                // 3. Validate data integrity
                var validationResult = await ValidateMigrationData(exportData);
                if (!validationResult.IsValid)
                {
                    await transaction.RollbackAsync();
                    result.Errors.AddRange(validationResult.Errors);
                    return result;
                }

                // 4. Create migration package
                var migrationPackage = await CreateMigrationPackage(exportData, migrationId);
                
                // 5. Update migration record
                await DBService.ExecuteAsync(@"
                    UPDATE tenant_migrations 
                    SET status = 'package_created', 
                        package_path = @package_path,
                        data_size_bytes = @data_size
                    WHERE id = @id",
                    new { 
                        package_path = migrationPackage.Path, 
                        data_size = migrationPackage.SizeBytes,
                        id = migrationId 
                    },
                    transaction: transaction
                );

                await transaction.CommitAsync();
                
                result.Success = true;
                result.MigrationId = migrationId;
                result.PackagePath = migrationPackage.Path;
                
                return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                result.Errors.Add($"Migration failed: {ex.Message}");
                return result;
            }
        }

        // ✅ CORRECT: Tenant schema migration
        public async Task<bool> MigrateTenantSchema(int clientId, string fromVersion, string toVersion)
        {
            using var transaction = await DBService.BeginTransactionAsync();
            try
            {
                // Get migration scripts for version upgrade
                var migrationScripts = await GetMigrationScripts(fromVersion, toVersion);
                
                foreach (var script in migrationScripts)
                {
                    // Execute migration script with tenant context
                    await DBService.ExecuteAsync(
                        "SELECT set_config('app.current_client_id', @client_id::text, true)",
                        new { client_id = clientId },
                        transaction: transaction
                    );

                    await DBService.ExecuteAsync(script.Sql, transaction: transaction);
                    
                    // Log migration step
                    await DBService.ExecuteAsync(@"
                        INSERT INTO schema_migration_log (
                            client_id, from_version, to_version, script_name, 
                            executed_at, executed_by
                        ) VALUES (
                            @client_id, @from_version, @to_version, @script_name,
                            CURRENT_TIMESTAMP, @executed_by
                        )",
                        new {
                            client_id = clientId,
                            from_version = fromVersion,
                            to_version = toVersion,
                            script_name = script.Name,
                            executed_by = UserId
                        },
                        transaction: transaction
                    );
                }

                // Update tenant schema version
                await DBService.ExecuteAsync(@"
                    UPDATE clients 
                    SET schema_version = @to_version, 
                        schema_updated_at = CURRENT_TIMESTAMP
                    WHERE id = @client_id",
                    new { to_version = toVersion, client_id = clientId },
                    transaction: transaction
                );

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        // ✅ CORRECT: Tenant cleanup and archival
        public async Task<bool> ArchiveTenant(int clientId, string reason)
        {
            if (!IsSystemAdmin())
            {
                throw new UnauthorizedAccessException("Admin access required for tenant archival");
            }

            using var transaction = await DBService.BeginTransactionAsync();
            try
            {
                // 1. Create archive record
                var archiveId = await DBService.GetValueAsync<int>(@"
                    INSERT INTO tenant_archives (
                        client_id, reason, archived_by, archive_started_at, status
                    ) VALUES (@client_id, @reason, @archived_by, CURRENT_TIMESTAMP, 'in_progress')
                    RETURNING id",
                    new { client_id = clientId, reason = reason, archived_by = UserId },
                    transaction: transaction
                );

                // 2. Export all tenant data
                var archiveData = await ExportTenantDataForArchive(clientId, transaction);
                
                // 3. Store archive data
                var archivePath = await StoreTenantArchive(archiveData, archiveId);
                
                // 4. Mark tenant as archived (soft delete)
                await DBService.ExecuteAsync(@"
                    UPDATE clients 
                    SET status = 'archived',
                        archived_at = CURRENT_TIMESTAMP,
                        archived_by = @archived_by
                    WHERE id = @client_id",
                    new { archived_by = UserId, client_id = clientId },
                    transaction: transaction
                );

                // 5. Disable all user accounts for this tenant
                await DBService.ExecuteAsync(@"
                    UPDATE users 
                    SET is_active = false,
                        deactivated_at = CURRENT_TIMESTAMP
                    WHERE client_id = @client_id",
                    new { client_id = clientId },
                    transaction: transaction
                );

                // 6. Update archive record
                await DBService.ExecuteAsync(@"
                    UPDATE tenant_archives 
                    SET status = 'completed',
                        archive_path = @archive_path,
                        archive_completed_at = CURRENT_TIMESTAMP
                    WHERE id = @id",
                    new { archive_path = archivePath, id = archiveId },
                    transaction: transaction
                );

                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }
    }

    // ============================================================================
    // TENANT PERFORMANCE PATTERNS
    // ============================================================================

    public class TenantPerformanceService : XOSServiceBase
    {
        // ✅ CORRECT: Tenant-specific query optimization
        public async Task<List<T>> GetPagedResults<T>(string baseQuery, int page, int pageSize, object parameters = null)
        {
            // Add tenant isolation and pagination
            var query = $@"
                WITH tenant_filtered AS ({baseQuery} AND client_id = @client_id)
                SELECT * FROM tenant_filtered
                ORDER BY id
                LIMIT @page_size OFFSET @offset";

            var queryParams = new DynamicParameters(parameters ?? new { });
            queryParams.Add("client_id", ClientId);
            queryParams.Add("page_size", pageSize);
            queryParams.Add("offset", (page - 1) * pageSize);

            return await DBService.GetListAsync<T>(query, queryParams);
        }

        // ✅ CORRECT: Tenant data partitioning awareness
        public async Task<bool> OptimizePartitionedQuery(DateTime startDate, DateTime endDate)
        {
            // Query uses partition pruning with tenant and date filters
            var results = await DBService.GetListAsync<ActivityLog>(@"
                SELECT * FROM activity_logs 
                WHERE client_id = @client_id 
                  AND created_at >= @start_date 
                  AND created_at < @end_date
                ORDER BY created_at DESC",
                new { 
                    client_id = ClientId, 
                    start_date = startDate, 
                    end_date = endDate 
                }
            );

            return results.Any();
        }

        // ✅ CORRECT: Tenant-aware caching strategy
        public async Task<T> GetCachedTenantData<T>(string cacheKey, Func<Task<T>> dataLoader, TimeSpan? expiry = null)
        {
            // Include tenant ID in cache key for isolation
            var tenantCacheKey = $"tenant:{ClientId}:{cacheKey}";
            
            var cachedData = await CacheService.GetAsync<T>(tenantCacheKey);
            if (cachedData != null)
            {
                return cachedData;
            }

            var data = await dataLoader();
            await CacheService.SetAsync(tenantCacheKey, data, expiry ?? TimeSpan.FromMinutes(15));
            
            return data;
        }

        // ✅ CORRECT: Bulk operations with tenant batching
        public async Task<bool> BulkProcessTenantData(List<ProcessRequest> requests)
        {
            // Group by tenant for efficient processing
            var tenantGroups = requests.GroupBy(r => r.ClientId);
            
            foreach (var tenantGroup in tenantGroups)
            {
                using var transaction = await DBService.BeginTransactionAsync();
                try
                {
                    // Set tenant context
                    await DBService.ExecuteAsync(
                        "SELECT set_config('app.current_client_id', @client_id::text, true)",
                        new { client_id = tenantGroup.Key },
                        transaction: transaction
                    );

                    // Process batch for this tenant
                    foreach (var batch in tenantGroup.Chunk(1000))
                    {
                        await ProcessBatch(batch, transaction);
                    }

                    await transaction.CommitAsync();
                }
                catch
                {
                    await transaction.RollbackAsync();
                    throw;
                }
            }

            return true;
        }
    }

    // ============================================================================
    // COMPLETE MULTI-TENANT EXAMPLES
    // ============================================================================

    public class CompleteTenantService : XOSServiceBase
    {
        // ✅ COMPLETE EXAMPLE: Full tenant onboarding
        public async Task<TenantOnboardingResult> OnboardNewTenant(TenantOnboardingRequest request)
        {
            using var transaction = await DBService.BeginTransactionAsync();
            var result = new TenantOnboardingResult();

            try
            {
                // 1. Create tenant record
                var clientId = await DBService.GetValueAsync<int>(@"
                    INSERT INTO clients (
                        name, domain, subscription_tier, contact_email,
                        status, created_at, created_by
                    ) VALUES (
                        @name, @domain, @subscription_tier, @contact_email,
                        'active', CURRENT_TIMESTAMP, @created_by
                    ) RETURNING id",
                    new {
                        name = request.TenantName,
                        domain = request.Domain,
                        subscription_tier = request.SubscriptionTier,
                        contact_email = request.ContactEmail,
                        created_by = UserId
                    },
                    transaction: transaction
                );

                result.ClientId = clientId;

                // 2. Create default admin user
                var adminUserId = await DBService.GetValueAsync<int>(@"
                    INSERT INTO users (
                        name, email, password_hash, is_admin, client_id, 
                        created_at, email_verified_at
                    ) VALUES (
                        @name, @email, @password_hash, true, @client_id,
                        CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
                    ) RETURNING id",
                    new {
                        name = request.AdminName,
                        email = request.AdminEmail,
                        password_hash = HashPassword(request.AdminPassword),
                        client_id = clientId
                    },
                    transaction: transaction
                );

                // 3. Set up tenant-specific configuration
                await DBService.ExecuteAsync(@"
                    INSERT INTO tenant_settings (
                        client_id, setting_key, setting_value, created_at
                    ) VALUES 
                        (@client_id, 'theme', @theme, CURRENT_TIMESTAMP),
                        (@client_id, 'timezone', @timezone, CURRENT_TIMESTAMP),
                        (@client_id, 'max_users', @max_users, CURRENT_TIMESTAMP),
                        (@client_id, 'max_storage_gb', @max_storage, CURRENT_TIMESTAMP)",
                    new {
                        client_id = clientId,
                        theme = request.Theme ?? "default",
                        timezone = request.Timezone ?? "UTC",
                        max_users = GetMaxUsers(request.SubscriptionTier),
                        max_storage = GetMaxStorage(request.SubscriptionTier)
                    },
                    transaction: transaction
                );

                // 4. Create default permissions
                await SetupDefaultPermissions(clientId, adminUserId, transaction);

                // 5. Initialize tenant database objects
                await InitializeTenantSchema(clientId, transaction);

                // 6. Create onboarding tasks
                await CreateOnboardingTasks(clientId, adminUserId, transaction);

                // 7. Set up tenant-specific indexes
                await CreateTenantIndexes(clientId, transaction);

                // 8. Log successful onboarding
                await DBService.ExecuteAsync(@"
                    INSERT INTO tenant_onboarding_log (
                        client_id, admin_user_id, subscription_tier, 
                        onboarded_by, onboarded_at, status
                    ) VALUES (
                        @client_id, @admin_user_id, @subscription_tier,
                        @onboarded_by, CURRENT_TIMESTAMP, 'completed'
                    )",
                    new {
                        client_id = clientId,
                        admin_user_id = adminUserId,
                        subscription_tier = request.SubscriptionTier,
                        onboarded_by = UserId
                    },
                    transaction: transaction
                );

                await transaction.CommitAsync();

                result.Success = true;
                result.AdminUserId = adminUserId;
                result.SetupTasks = await GetOnboardingTasks(clientId);

                // Send welcome email (outside transaction)
                _ = Task.Run(() => SendTenantWelcomeEmail(clientId, request.AdminEmail));

                return result;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                LogError(ex, "Tenant onboarding failed", request);
                result.Success = false;
                result.ErrorMessage = "Failed to onboard tenant";
                return result;
            }
        }

        // ✅ COMPLETE EXAMPLE: Tenant health monitoring
        public async Task<TenantHealthReport> GenerateTenantHealthReport(int clientId)
        {
            var report = new TenantHealthReport { ClientId = clientId };

            // Resource usage metrics
            report.UserCount = await DBService.GetValueAsync<int>(
                "SELECT COUNT(*) FROM users WHERE client_id = @client_id AND is_active = true",
                new { client_id = clientId }
            );

            report.StorageUsedMB = await DBService.GetValueAsync<decimal>(@"
                SELECT COALESCE(SUM(file_size_bytes), 0) / 1024.0 / 1024.0
                FROM file_uploads WHERE client_id = @client_id",
                new { client_id = clientId }
            );

            report.DatabaseSize = await DBService.GetValueAsync<string>(@"
                SELECT pg_size_pretty(
                    SUM(pg_total_relation_size(schemaname||'.'||tablename::text))
                ) FROM pg_tables 
                WHERE schemaname = 'public'
                  AND tablename IN (
                      SELECT table_name FROM information_schema.tables 
                      WHERE table_schema = 'public' 
                        AND table_name LIKE '%' || @client_id || '%'
                  )",
                new { client_id = clientId }
            );

            // Performance metrics
            report.AvgResponseTimeMs = await DBService.GetValueAsync<decimal>(@"
                SELECT AVG(response_time_ms) 
                FROM request_logs 
                WHERE client_id = @client_id 
                  AND created_at >= CURRENT_DATE - INTERVAL '7 days'",
                new { client_id = clientId }
            );

            report.ErrorRate = await DBService.GetValueAsync<decimal>(@"
                SELECT 
                    CASE WHEN total_requests > 0 
                         THEN (error_requests::decimal / total_requests) * 100 
                         ELSE 0 
                    END
                FROM (
                    SELECT 
                        COUNT(*) as total_requests,
                        COUNT(*) FILTER (WHERE status_code >= 400) as error_requests
                    FROM request_logs 
                    WHERE client_id = @client_id 
                      AND created_at >= CURRENT_DATE - INTERVAL '7 days'
                ) stats",
                new { client_id = clientId }
            );

            // Security metrics
            report.FailedLoginAttempts = await DBService.GetValueAsync<int>(@"
                SELECT COUNT(*) FROM security_events 
                WHERE client_id = @client_id 
                  AND event_type = 'failed_login'
                  AND created_at >= CURRENT_DATE - INTERVAL '7 days'",
                new { client_id = clientId }
            );

            // Subscription compliance
            var subscription = await DBService.GetAsync<SubscriptionDetails>(
                "SELECT * FROM client_subscriptions WHERE client_id = @client_id",
                new { client_id = clientId }
            );

            report.IsOverUserLimit = report.UserCount > subscription.MaxUsers;
            report.IsOverStorageLimit = report.StorageUsedMB > (subscription.MaxStorageGB * 1024);

            // Health score calculation
            report.HealthScore = CalculateHealthScore(report);
            report.GeneratedAt = DateTime.UtcNow;

            return report;
        }

        // Helper methods
        private async Task SetupDefaultPermissions(int clientId, int adminUserId, IDbTransaction transaction)
        {
            var defaultPermissions = new[]
            {
                "users.create", "users.read", "users.update", "users.delete",
                "projects.create", "projects.read", "projects.update", "projects.delete",
                "documents.create", "documents.read", "documents.update", "documents.delete",
                "settings.read", "settings.update", "reports.read"
            };

            foreach (var permission in defaultPermissions)
            {
                var permissionId = await DBService.GetValueAsync<int>(
                    "SELECT id FROM permissions WHERE name = @name",
                    new { name = permission },
                    transaction: transaction
                );

                await DBService.ExecuteAsync(@"
                    INSERT INTO user_permissions (user_id, permission_id, client_id, granted_by, granted_at)
                    VALUES (@user_id, @permission_id, @client_id, @granted_by, CURRENT_TIMESTAMP)",
                    new { 
                        user_id = adminUserId, 
                        permission_id = permissionId, 
                        client_id = clientId, 
                        granted_by = UserId 
                    },
                    transaction: transaction
                );
            }
        }

        private int CalculateHealthScore(TenantHealthReport report)
        {
            var score = 100;
            
            if (report.IsOverUserLimit) score -= 20;
            if (report.IsOverStorageLimit) score -= 20;
            if (report.ErrorRate > 5) score -= 15;
            if (report.AvgResponseTimeMs > 1000) score -= 10;
            if (report.FailedLoginAttempts > 50) score -= 15;
            
            return Math.Max(0, score);
        }
    }

    // Supporting classes and enums
    public class CreateUserRequest
    {
        public string Name { get; set; }
        public string Email { get; set; }
    }

    public class UpdateUserRequest
    {
        public string Name { get; set; }
        public string Email { get; set; }
    }

    public class TenantOnboardingRequest
    {
        public string TenantName { get; set; }
        public string Domain { get; set; }
        public string SubscriptionTier { get; set; }
        public string ContactEmail { get; set; }
        public string AdminName { get; set; }
        public string AdminEmail { get; set; }
        public string AdminPassword { get; set; }
        public string Theme { get; set; }
        public string Timezone { get; set; }
    }

    public class TenantOnboardingResult
    {
        public bool Success { get; set; }
        public int ClientId { get; set; }
        public int AdminUserId { get; set; }
        public string ErrorMessage { get; set; }
        public List<OnboardingTask> SetupTasks { get; set; } = new();
    }

    public class TenantHealthReport
    {
        public int ClientId { get; set; }
        public int UserCount { get; set; }
        public decimal StorageUsedMB { get; set; }
        public string DatabaseSize { get; set; }
        public decimal AvgResponseTimeMs { get; set; }
        public decimal ErrorRate { get; set; }
        public int FailedLoginAttempts { get; set; }
        public bool IsOverUserLimit { get; set; }
        public bool IsOverStorageLimit { get; set; }
        public int HealthScore { get; set; }
        public DateTime GeneratedAt { get; set; }
    }
}