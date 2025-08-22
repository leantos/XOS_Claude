// ===== XOS SERVICE COMPLETE PATTERNS =====
// This file contains EVERY backend service pattern for XOS Framework
// Follow the GetValue<T> and transaction patterns EXACTLY

using CVS.Transaction.Core;
using CVS.Transaction.Domain;
using CVS.Transaction.Interfaces;
using Microsoft.Extensions.Logging;
using System.Text;
using XOS.Data;

namespace CVS.Transaction.Services
{
    // ⚠️ CRITICAL: Always extend XOSServiceBase and implement interface
    public class [EntityName]Service : XOSServiceBase, I[EntityName]Service
    {
        #region Elements
        
        private const string FORMID = "[FORM_ID]";  // Replace with your form ID
        
        #endregion
        
        #region Constructor
        
        // ⚠️ CRITICAL: Constructor pattern - NEVER change this
        public [EntityName]Service(IServiceProvider serviceProvider, ILogger<[EntityName]Service> logger) 
            : base(serviceProvider, logger)
        {
        }
        
        #endregion
        
        #region Public Methods
        
        // ===== SECTION 1: CRUD OPERATIONS =====
        // Lines 30-300: Create, Read, Update, Delete operations
        
        /// <summary>
        /// ⚠️ CRITICAL: Save operation with transaction pattern
        /// Handles both INSERT and UPDATE operations
        /// </summary>
        public async Task<string> SaveAsync([EntityName] input, InputInfo loginInfo)
        {
            string rtnVal = "F";  // XOS convention: "S" = Success, "F" = Failure
            
            if (input.UserID <= 0)
                input.UserID = loginInfo.UserID;
            
            DBParameters dbParams = new DBParameters();
            string query = string.Empty;
            
            // Load existing data for comparison (audit trail)
            var existingData = input.IsEdit ? await this.GetByIdAsync(input.ID, loginInfo.ClientID) : null;
            
            // ⚠️ CRITICAL: Transaction pattern with proper disposal
            using (var dbService = this.GetDBService(loginInfo.ClientID.ToString(), false))
            {
                using (var tran = dbService.BeginTransaction())
                {
                    try
                    {
                        // Build and execute save query
                        query = this.BuildSaveQuery(input, dbParams, loginInfo);
                        
                        if (input.IsEdit)
                        {
                            await dbService.ExecuteSqlCommandAsync(query, dbParams);
                        }
                        else
                        {
                            // For INSERT, get the new ID
                            var result = await dbService.GetEntityDataAsync<int>(query + " RETURNING id;", dbParams, (row) =>
                            {
                                return row.GetValue<int>("id");
                            });
                            input.ID = result;
                        }
                        
                        dbParams.Clear();
                        
                        // Generate audit trail
                        string auditText = this.GenerateAuditText(input, existingData);
                        if (!string.IsNullOrWhiteSpace(auditText))
                        {
                            // Save audit record
                            await this.SaveAuditAsync(dbService, new AuditInfo
                            {
                                ClientID = loginInfo.ClientID,
                                FormID = FORMID,
                                RecordID = input.ID.ToString(),
                                UserID = input.UserID,
                                Action = input.IsEdit ? "UPDATE" : "INSERT",
                                Details = auditText,
                                Timestamp = DateTime.UtcNow
                            });
                        }
                        
                        // ⚠️ CRITICAL: Commit BEFORE SignalR notifications
                        tran.Commit();
                        rtnVal = "S";
                        
                        // SignalR notifications AFTER successful commit
                        try
                        {
                            await this.NotifyClientsAsync(loginInfo.ClientID, "[EntityName]Updated", new
                            {
                                ID = input.ID,
                                Action = input.IsEdit ? "Updated" : "Created",
                                Data = input
                            });
                        }
                        catch (Exception signalREx)
                        {
                            // Log SignalR errors but don't fail the transaction
                            this.Logger.LogWarning(signalREx, "SignalR notification failed for [EntityName] {ID}", input.ID);
                        }
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        this.Logger.LogError(ex, "Save failed for [EntityName]. Query: {Query}, Params: {Params}", 
                            query, dbParams?.ToJsonText());
                        throw;  // Re-throw to be handled by controller
                    }
                }
            }
            
            return rtnVal;
        }
        
        /// <summary>
        /// ⚠️ CRITICAL: GetByIdAsync with proper data mapping
        /// </summary>
        public async Task<[EntityName]> GetByIdAsync(int id, short clientID)
        {
            DBParameters dbParams = new DBParameters();
            [EntityName] entity = null;
            
            StringBuilder query = new StringBuilder();
            query.Append(@"
                SELECT 
                    e.id,
                    e.name,
                    e.email,
                    e.phone,
                    e.address,
                    e.description,
                    e.category_id,
                    c.category_name,
                    e.status_id,
                    s.status_name,
                    e.role_id,
                    r.role_name,
                    e.is_active,
                    e.is_enabled,
                    e.created_date,
                    e.created_by,
                    e.modified_date,
                    e.modified_by
                FROM [entity_table] e
                LEFT JOIN categories c ON e.category_id = c.id
                LEFT JOIN statuses s ON e.status_id = s.id  
                LEFT JOIN roles r ON e.role_id = r.id
                WHERE e.id = @id 
                  AND e.client_id = @client_id
                  AND e.is_deleted = false
            ");
            
            dbParams.Add("id", id);
            dbParams.Add("client_id", clientID);
            
            try
            {
                // ⚠️ CRITICAL: GetEntityDataAsync pattern with GetValue<T>
                await this.DBUtils(clientID.ToString(), false).GetEntityDataAsync<bool>(query.ToString(), dbParams, (row) =>
                {
                    entity = new [EntityName]
                    {
                        ID = row.GetValue<int>("id"),
                        Name = row.GetValue<string>("name", ""),
                        Email = row.GetValue<string>("email", ""),
                        Phone = row.GetValue<string>("phone", ""),
                        Address = row.GetValue<string>("address", ""),
                        Description = row.GetValue<string>("description", ""),
                        
                        // ✅ CORRECT: Nested object pattern
                        Category = new BaseObject<int>
                        {
                            ID = row.GetValue<int>("category_id"),
                            Text = row.GetValue<string>("category_name", "")
                        },
                        
                        Status = new BaseObject<int>
                        {
                            ID = row.GetValue<int>("status_id"),
                            Text = row.GetValue<string>("status_name", "")
                        },
                        
                        Role = new BaseObject<int>
                        {
                            ID = row.GetValue<int>("role_id"),
                            Text = row.GetValue<string>("role_name", "")
                        },
                        
                        // ✅ CORRECT: Boolean with default values
                        IsActive = row.GetValue<bool>("is_active", false),
                        IsEnabled = row.GetValue<bool>("is_enabled", true),
                        
                        // ✅ CORRECT: DateTime handling
                        CreatedDate = row.GetValue<DateTime?>("created_date"),
                        CreatedBy = row.GetValue<int>("created_by"),
                        ModifiedDate = row.GetValue<DateTime?>("modified_date"),
                        ModifiedBy = row.GetValue<int?>("modified_by"),
                        
                        IsEdit = true
                    };
                    
                    return true;
                });
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, "GetByIdAsync failed for [EntityName] {ID}. Query: {Query}", 
                    id, query.ToString());
                throw;
            }
            
            return entity;
        }
        
        /// <summary>
        /// ⚠️ CRITICAL: GetListAsync with pagination and filtering
        /// </summary>
        public async Task<List<[EntityName]>> GetListAsync(SearchParams searchParams, InputInfo loginInfo)
        {
            DBParameters dbParams = new DBParameters();
            List<[EntityName]> entities = new List<[EntityName]>();
            
            StringBuilder query = new StringBuilder();
            query.Append(@"
                SELECT 
                    e.id,
                    e.name,
                    e.email,
                    e.phone,
                    e.is_active,
                    e.is_enabled,
                    c.category_name,
                    s.status_name,
                    r.role_name,
                    e.created_date
                FROM [entity_table] e
                LEFT JOIN categories c ON e.category_id = c.id
                LEFT JOIN statuses s ON e.status_id = s.id
                LEFT JOIN roles r ON e.role_id = r.id
                WHERE e.client_id = @client_id
                  AND e.is_deleted = false
            ");
            
            dbParams.Add("client_id", loginInfo.ClientID);
            
            // ✅ CORRECT: Dynamic WHERE clause building
            if (!string.IsNullOrEmpty(searchParams.SearchTerm))
            {
                query.Append(@" 
                    AND (e.name ILIKE @search_term 
                         OR e.email ILIKE @search_term
                         OR e.phone ILIKE @search_term)
                ");
                dbParams.Add("search_term", $"%{searchParams.SearchTerm}%");
            }
            
            if (searchParams.CategoryId.HasValue)
            {
                query.Append(" AND e.category_id = @category_id");
                dbParams.Add("category_id", searchParams.CategoryId.Value);
            }
            
            if (searchParams.StatusId.HasValue)
            {
                query.Append(" AND e.status_id = @status_id");
                dbParams.Add("status_id", searchParams.StatusId.Value);
            }
            
            if (searchParams.IsActive.HasValue)
            {
                query.Append(" AND e.is_active = @is_active");
                dbParams.Add("is_active", searchParams.IsActive.Value);
            }
            
            // ✅ CORRECT: Sorting
            if (!string.IsNullOrEmpty(searchParams.SortField))
            {
                string sortDirection = searchParams.SortDirection?.ToUpper() == "DESC" ? "DESC" : "ASC";
                query.Append($" ORDER BY e.{searchParams.SortField} {sortDirection}");
            }
            else
            {
                query.Append(" ORDER BY e.name ASC");
            }
            
            // ✅ CORRECT: Pagination
            if (searchParams.PageSize > 0)
            {
                query.Append(" LIMIT @page_size OFFSET @offset");
                dbParams.Add("page_size", searchParams.PageSize);
                dbParams.Add("offset", (searchParams.Page - 1) * searchParams.PageSize);
            }
            
            try
            {
                // ⚠️ CRITICAL: GetEntityDataListAsync pattern
                entities = await this.DBUtils(loginInfo.ClientID.ToString(), false)
                    .GetEntityDataListAsync<[EntityName]>(query.ToString(), dbParams, (row) =>
                    {
                        return new [EntityName]
                        {
                            ID = row.GetValue<int>("id"),
                            Name = row.GetValue<string>("name", ""),
                            Email = row.GetValue<string>("email", ""),
                            Phone = row.GetValue<string>("phone", ""),
                            IsActive = row.GetValue<bool>("is_active", false),
                            IsEnabled = row.GetValue<bool>("is_enabled", true),
                            CategoryName = row.GetValue<string>("category_name", ""),
                            StatusName = row.GetValue<string>("status_name", ""),
                            RoleName = row.GetValue<string>("role_name", ""),
                            CreatedDate = row.GetValue<DateTime?>("created_date")
                        };
                    });
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, "GetListAsync failed for [EntityName]. Query: {Query}, Params: {Params}", 
                    query.ToString(), dbParams?.ToJsonText());
                throw;
            }
            
            return entities;
        }
        
        /// <summary>
        /// ⚠️ CRITICAL: Delete operation with soft delete
        /// </summary>
        public async Task<bool> DeleteAsync(int id, InputInfo loginInfo)
        {
            DBParameters dbParams = new DBParameters();
            string query = string.Empty;
            bool success = false;
            
            // Load existing data for audit
            var existingData = await this.GetByIdAsync(id, loginInfo.ClientID);
            if (existingData == null)
            {
                throw new ArgumentException($"[EntityName] with ID {id} not found");
            }
            
            using (var dbService = this.GetDBService(loginInfo.ClientID.ToString(), false))
            {
                using (var tran = dbService.BeginTransaction())
                {
                    try
                    {
                        // ✅ CORRECT: Soft delete pattern
                        query = @"
                            UPDATE [entity_table] 
                            SET is_deleted = true,
                                deleted_date = @deleted_date,
                                deleted_by = @deleted_by
                            WHERE id = @id 
                              AND client_id = @client_id
                        ";
                        
                        dbParams.Add("id", id);
                        dbParams.Add("client_id", loginInfo.ClientID);
                        dbParams.Add("deleted_date", DateTime.UtcNow);
                        dbParams.Add("deleted_by", loginInfo.UserID);
                        
                        await dbService.ExecuteSqlCommandAsync(query, dbParams);
                        
                        // Save audit record
                        await this.SaveAuditAsync(dbService, new AuditInfo
                        {
                            ClientID = loginInfo.ClientID,
                            FormID = FORMID,
                            RecordID = id.ToString(),
                            UserID = loginInfo.UserID,
                            Action = "DELETE",
                            Details = $"Deleted {existingData.Name}",
                            Timestamp = DateTime.UtcNow
                        });
                        
                        tran.Commit();
                        success = true;
                        
                        // SignalR notification after commit
                        await this.NotifyClientsAsync(loginInfo.ClientID, "[EntityName]Deleted", new { ID = id });
                        
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        this.Logger.LogError(ex, "Delete failed for [EntityName] {ID}. Query: {Query}", 
                            id, query);
                        throw;
                    }
                }
            }
            
            return success;
        }
        
        // ===== SECTION 2: LOOKUP DATA METHODS =====
        // Lines 300-500: Loading dropdown data and reference lists
        
        /// <summary>
        /// Load data for form dropdowns and filters
        /// </summary>
        public async Task<[EntityName].LoadData> LoadDataAsync(short clientID)
        {
            var data = new [EntityName].LoadData
            {
                Categories = new List<BaseObject<int>>(),
                Statuses = new List<BaseObject<int>>(),
                Roles = new List<BaseObject<int>>(),
                Users = new List<BaseObject<int>>()
            };
            
            DBParameters dbParams = new DBParameters();
            StringBuilder query = new StringBuilder();
            
            // ✅ CORRECT: Multiple result sets in single query for efficiency
            query.Append(@"
                -- Categories
                SELECT id, category_name as name, is_active
                FROM categories 
                WHERE client_id = @client_id 
                  AND is_deleted = false
                ORDER BY category_name;
                
                -- Statuses  
                SELECT id, status_name as name, is_active
                FROM statuses
                WHERE client_id = @client_id
                  AND is_deleted = false
                ORDER BY display_order, status_name;
                
                -- Roles
                SELECT id, role_name as name, is_active
                FROM roles
                WHERE client_id = @client_id
                  AND is_deleted = false
                ORDER BY role_name;
                
                -- Users
                SELECT id, first_name || ' ' || last_name as name, is_active
                FROM users
                WHERE client_id = @client_id
                  AND is_deleted = false
                  AND is_active = true
                ORDER BY first_name, last_name;
            ");
            
            dbParams.Add("client_id", clientID);
            
            try
            {
                // ⚠️ CRITICAL: Multiple result set handling
                await this.DBUtils(clientID.ToString(), false).GetEntityDataAsync<bool>(query.ToString(), dbParams, (reader) =>
                {
                    // First result set - Categories
                    while (reader.Read())
                    {
                        data.Categories.Add(new BaseObject<int>
                        {
                            ID = reader.GetValue<int>("id"),
                            Text = reader.GetValue<string>("name", ""),
                            IsActive = reader.GetValue<bool>("is_active", true)
                        });
                    }
                    
                    // Move to next result set - Statuses
                    reader.NextResult();
                    while (reader.Read())
                    {
                        data.Statuses.Add(new BaseObject<int>
                        {
                            ID = reader.GetValue<int>("id"),
                            Text = reader.GetValue<string>("name", ""),
                            IsActive = reader.GetValue<bool>("is_active", true)
                        });
                    }
                    
                    // Move to next result set - Roles
                    reader.NextResult();
                    while (reader.Read())
                    {
                        data.Roles.Add(new BaseObject<int>
                        {
                            ID = reader.GetValue<int>("id"),
                            Text = reader.GetValue<string>("name", ""),
                            IsActive = reader.GetValue<bool>("is_active", true)
                        });
                    }
                    
                    // Move to next result set - Users
                    reader.NextResult();
                    while (reader.Read())
                    {
                        data.Users.Add(new BaseObject<int>
                        {
                            ID = reader.GetValue<int>("id"),
                            Text = reader.GetValue<string>("name", ""),
                            IsActive = reader.GetValue<bool>("is_active", true)
                        });
                    }
                    
                    return true;
                });
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, "LoadDataAsync failed for [EntityName]. Query: {Query}", query.ToString());
                throw;
            }
            
            return data;
        }
        
        // ===== SECTION 3: ADVANCED QUERY PATTERNS =====
        // Lines 500-700: Complex queries, aggregations, reports
        
        /// <summary>
        /// ⚠️ CRITICAL: Complex query with JOINs and aggregations
        /// </summary>
        public async Task<List<[EntityName]Report>> GetReportDataAsync(ReportParams reportParams, InputInfo loginInfo)
        {
            DBParameters dbParams = new DBParameters();
            List<[EntityName]Report> reportData = new List<[EntityName]Report>();
            
            StringBuilder query = new StringBuilder();
            query.Append(@"
                SELECT 
                    e.id,
                    e.name,
                    c.category_name,
                    s.status_name,
                    COUNT(DISTINCT rel.related_id) as related_count,
                    SUM(CASE WHEN e.is_active THEN 1 ELSE 0 END) as active_count,
                    AVG(CASE WHEN score.value IS NOT NULL THEN score.value ELSE 0 END) as avg_score,
                    MIN(e.created_date) as first_created,
                    MAX(e.modified_date) as last_modified
                FROM [entity_table] e
                LEFT JOIN categories c ON e.category_id = c.id
                LEFT JOIN statuses s ON e.status_id = s.id
                LEFT JOIN related_entities rel ON e.id = rel.entity_id AND rel.is_deleted = false
                LEFT JOIN entity_scores score ON e.id = score.entity_id
                WHERE e.client_id = @client_id
                  AND e.is_deleted = false
            ");
            
            dbParams.Add("client_id", loginInfo.ClientID);
            
            // Dynamic filtering
            if (reportParams.DateFrom.HasValue)
            {
                query.Append(" AND e.created_date >= @date_from");
                dbParams.Add("date_from", reportParams.DateFrom.Value);
            }
            
            if (reportParams.DateTo.HasValue)
            {
                query.Append(" AND e.created_date <= @date_to");
                dbParams.Add("date_to", reportParams.DateTo.Value);
            }
            
            if (reportParams.CategoryIds?.Any() == true)
            {
                query.Append(" AND e.category_id = ANY(@category_ids)");
                dbParams.Add("category_ids", reportParams.CategoryIds.ToArray());
            }
            
            query.Append(@"
                GROUP BY e.id, e.name, c.category_name, s.status_name
                ORDER BY e.name
            ");
            
            try
            {
                reportData = await this.DBUtils(loginInfo.ClientID.ToString(), false)
                    .GetEntityDataListAsync<[EntityName]Report>(query.ToString(), dbParams, (row) =>
                    {
                        return new [EntityName]Report
                        {
                            ID = row.GetValue<int>("id"),
                            Name = row.GetValue<string>("name", ""),
                            CategoryName = row.GetValue<string>("category_name", ""),
                            StatusName = row.GetValue<string>("status_name", ""),
                            RelatedCount = row.GetValue<int>("related_count"),
                            ActiveCount = row.GetValue<int>("active_count"),
                            AverageScore = row.GetValue<decimal>("avg_score"),
                            FirstCreated = row.GetValue<DateTime?>("first_created"),
                            LastModified = row.GetValue<DateTime?>("last_modified")
                        };
                    });
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, "GetReportDataAsync failed. Query: {Query}, Params: {Params}", 
                    query.ToString(), dbParams?.ToJsonText());
                throw;
            }
            
            return reportData;
        }
        
        /// <summary>
        /// ⚠️ CRITICAL: Bulk operations for performance
        /// </summary>
        public async Task<bool> BulkUpdateStatusAsync(List<int> entityIds, int newStatusId, InputInfo loginInfo)
        {
            if (!entityIds?.Any() == true)
                return false;
            
            DBParameters dbParams = new DBParameters();
            string query = string.Empty;
            bool success = false;
            
            using (var dbService = this.GetDBService(loginInfo.ClientID.ToString(), false))
            {
                using (var tran = dbService.BeginTransaction())
                {
                    try
                    {
                        // ✅ CORRECT: Bulk update using ANY operator
                        query = @"
                            UPDATE [entity_table]
                            SET status_id = @new_status_id,
                                modified_date = @modified_date,
                                modified_by = @modified_by
                            WHERE id = ANY(@entity_ids)
                              AND client_id = @client_id
                              AND is_deleted = false
                        ";
                        
                        dbParams.Add("new_status_id", newStatusId);
                        dbParams.Add("entity_ids", entityIds.ToArray());
                        dbParams.Add("client_id", loginInfo.ClientID);
                        dbParams.Add("modified_date", DateTime.UtcNow);
                        dbParams.Add("modified_by", loginInfo.UserID);
                        
                        await dbService.ExecuteSqlCommandAsync(query, dbParams);
                        
                        // Audit for bulk operation
                        await this.SaveAuditAsync(dbService, new AuditInfo
                        {
                            ClientID = loginInfo.ClientID,
                            FormID = FORMID,
                            RecordID = string.Join(",", entityIds),
                            UserID = loginInfo.UserID,
                            Action = "BULK_UPDATE",
                            Details = $"Updated status to {newStatusId} for {entityIds.Count} records",
                            Timestamp = DateTime.UtcNow
                        });
                        
                        tran.Commit();
                        success = true;
                        
                        // SignalR notification
                        await this.NotifyClientsAsync(loginInfo.ClientID, "[EntityName]BulkUpdated", new 
                        { 
                            EntityIds = entityIds, 
                            NewStatusId = newStatusId 
                        });
                        
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        this.Logger.LogError(ex, "BulkUpdateStatusAsync failed. Query: {Query}, IDs: {IDs}", 
                            query, string.Join(",", entityIds));
                        throw;
                    }
                }
            }
            
            return success;
        }
        
        #endregion
        
        #region Private Methods
        
        // ===== SECTION 4: PRIVATE HELPER METHODS =====
        // Lines 700-1000: Query builders and utility methods
        
        /// <summary>
        /// ⚠️ CRITICAL: Dynamic query builder for save operations
        /// </summary>
        private string BuildSaveQuery([EntityName] input, DBParameters dbParams, InputInfo loginInfo)
        {
            StringBuilder query = new StringBuilder();
            
            if (input.IsEdit)
            {
                // UPDATE query
                query.Append(@"
                    UPDATE [entity_table] 
                    SET name = @name,
                        email = @email,
                        phone = @phone,
                        address = @address,
                        description = @description,
                        category_id = @category_id,
                        status_id = @status_id,
                        role_id = @role_id,
                        is_active = @is_active,
                        is_enabled = @is_enabled,
                        modified_date = @modified_date,
                        modified_by = @modified_by
                    WHERE id = @id 
                      AND client_id = @client_id
                ");
                
                dbParams.Add("id", input.ID);
            }
            else
            {
                // INSERT query
                query.Append(@"
                    INSERT INTO [entity_table] (
                        client_id, name, email, phone, address, description,
                        category_id, status_id, role_id, is_active, is_enabled,
                        created_date, created_by, modified_date, modified_by
                    ) VALUES (
                        @client_id, @name, @email, @phone, @address, @description,
                        @category_id, @status_id, @role_id, @is_active, @is_enabled,
                        @created_date, @created_by, @modified_date, @modified_by
                    )
                ");
                
                dbParams.Add("client_id", loginInfo.ClientID);
                dbParams.Add("created_date", DateTime.UtcNow);
                dbParams.Add("created_by", loginInfo.UserID);
            }
            
            // Common parameters
            dbParams.Add("name", input.Name ?? string.Empty);
            dbParams.Add("email", input.Email ?? string.Empty);
            dbParams.Add("phone", input.Phone ?? string.Empty);
            dbParams.Add("address", input.Address ?? string.Empty);
            dbParams.Add("description", input.Description ?? string.Empty);
            dbParams.Add("category_id", input.CategoryId > 0 ? input.CategoryId : DBNull.Value);
            dbParams.Add("status_id", input.StatusId > 0 ? input.StatusId : DBNull.Value);
            dbParams.Add("role_id", input.RoleId > 0 ? input.RoleId : DBNull.Value);
            dbParams.Add("is_active", input.IsActive);
            dbParams.Add("is_enabled", input.IsEnabled);
            dbParams.Add("modified_date", DateTime.UtcNow);
            dbParams.Add("modified_by", loginInfo.UserID);
            
            return query.ToString();
        }
        
        /// <summary>
        /// Generate audit trail text
        /// </summary>
        private string GenerateAuditText([EntityName] newData, [EntityName] oldData)
        {
            if (oldData == null)
                return $"Created: {newData.Name}";
            
            List<string> changes = new List<string>();
            
            if (newData.Name != oldData.Name)
                changes.Add($"Name: '{oldData.Name}' → '{newData.Name}'");
                
            if (newData.Email != oldData.Email)
                changes.Add($"Email: '{oldData.Email}' → '{newData.Email}'");
                
            if (newData.IsActive != oldData.IsActive)
                changes.Add($"Active: {oldData.IsActive} → {newData.IsActive}");
            
            return changes.Any() ? string.Join(", ", changes) : string.Empty;
        }
        
        /// <summary>
        /// Save audit record
        /// </summary>
        private async Task SaveAuditAsync(IDBService dbService, AuditInfo auditInfo)
        {
            try
            {
                string auditQuery = @"
                    INSERT INTO audit_log (
                        client_id, form_id, record_id, user_id, action, 
                        details, timestamp, ip_address, user_agent
                    ) VALUES (
                        @client_id, @form_id, @record_id, @user_id, @action,
                        @details, @timestamp, @ip_address, @user_agent
                    )
                ";
                
                DBParameters auditParams = new DBParameters();
                auditParams.Add("client_id", auditInfo.ClientID);
                auditParams.Add("form_id", auditInfo.FormID);
                auditParams.Add("record_id", auditInfo.RecordID);
                auditParams.Add("user_id", auditInfo.UserID);
                auditParams.Add("action", auditInfo.Action);
                auditParams.Add("details", auditInfo.Details);
                auditParams.Add("timestamp", auditInfo.Timestamp);
                auditParams.Add("ip_address", auditInfo.IPAddress ?? "");
                auditParams.Add("user_agent", auditInfo.UserAgent ?? "");
                
                await dbService.ExecuteSqlCommandAsync(auditQuery, auditParams);
            }
            catch (Exception ex)
            {
                this.Logger.LogWarning(ex, "Failed to save audit record for {FormID}:{RecordID}", 
                    auditInfo.FormID, auditInfo.RecordID);
                // Don't throw - audit failure shouldn't break main operation
            }
        }
        
        /// <summary>
        /// Send SignalR notifications
        /// </summary>
        private async Task NotifyClientsAsync(short clientId, string method, object data)
        {
            try
            {
                // Implementation depends on your SignalR setup
                // Example pattern:
                // await this.HubContext.Clients.Group($"Client_{clientId}")
                //     .SendAsync(method, data);
            }
            catch (Exception ex)
            {
                this.Logger.LogWarning(ex, "SignalR notification failed: {Method}", method);
                // Don't throw - notification failure shouldn't break main operation
            }
        }
        
        #endregion
        
        #region IDisposable
        
        protected override void OnDispose()
        {
            // Cleanup resources if needed
            // Base class handles standard disposal
        }
        
        #endregion
    }
    
    // ===== SUPPORTING CLASSES =====
    
    public class SearchParams
    {
        public string SearchTerm { get; set; }
        public int? CategoryId { get; set; }
        public int? StatusId { get; set; }
        public bool? IsActive { get; set; }
        public string SortField { get; set; }
        public string SortDirection { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
    
    public class ReportParams
    {
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public List<int> CategoryIds { get; set; }
        public List<int> StatusIds { get; set; }
    }
    
    public class AuditInfo
    {
        public short ClientID { get; set; }
        public string FormID { get; set; }
        public string RecordID { get; set; }
        public int UserID { get; set; }
        public string Action { get; set; }
        public string Details { get; set; }
        public DateTime Timestamp { get; set; }
        public string IPAddress { get; set; }
        public string UserAgent { get; set; }
    }
}

// ===== USAGE NOTES =====
/*
⚠️ CRITICAL PATTERNS TO NEVER CHANGE:
1. Always extend XOSServiceBase
2. Always use GetDBService() for database connections
3. Always use GetValue<T>() for reading database values
4. Always commit transactions before SignalR notifications
5. Always use parameterized queries (DBParameters)
6. Always handle exceptions and log errors

✅ CUSTOMIZATION POINTS:
1. Replace [EntityName] with your entity name
2. Replace [entity_table] with your table name
3. Replace [FORM_ID] with your form identifier
4. Modify field mappings in BuildSaveQuery()
5. Add custom business logic methods
6. Customize audit trail generation
7. Add custom validation rules

💡 PERFORMANCE TIPS:
1. Use multiple result sets for loading related data
2. Implement bulk operations for multiple records
3. Use proper indexing on filtered columns
4. Use pagination for large datasets
5. Cache lookup data when appropriate

🛡️ SECURITY CONSIDERATIONS:
1. Always use parameterized queries
2. Validate input data before processing
3. Implement proper authorization checks
4. Log all data modifications
5. Use soft deletes instead of hard deletes

🔥 OPTIMIZATION NOTES:
1. Use StringBuilder for dynamic query building
2. Dispose resources properly with using statements
3. Handle SignalR failures gracefully
4. Use async/await throughout
5. Log performance-critical operations

📊 DATABASE PATTERNS:
1. Use consistent naming: snake_case for columns
2. Always include client_id for multi-tenancy
3. Include audit fields: created_date, created_by, modified_date, modified_by
4. Use is_deleted for soft deletes
5. Use proper foreign key relationships
*/