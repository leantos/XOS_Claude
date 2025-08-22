// ===== XOS DATA FRAMEWORK COMPLETE PATTERNS =====
// This file contains EVERY data access pattern for XOS Framework
// Follow GetValue<T> and DBService patterns EXACTLY

using CVS.Transaction.Core;
using Microsoft.Extensions.Logging;
using System.Data;
using System.Text;
using XOS.Data;
using Npgsql;

namespace CVS.Transaction.Infrastructure
{
    // ===== SECTION 1: BASIC DATA ACCESS PATTERNS =====
    
    /// <summary>
    /// ⚠️ CRITICAL: DBService usage patterns
    /// Always use within using statements for proper disposal
    /// Always use transactions for multi-step operations
    /// Always use GetValue<T> for data extraction
    /// </summary>
    public class DataAccessExamples
    {
        #region Basic DBService Patterns
        
        /// <summary>
        /// ✅ CORRECT: Single query execution
        /// </summary>
        public async Task<List<T>> ExecuteQueryAsync<T>(string query, DBParameters parameters, 
            string clientId, Func<IDataReader, T> mapper)
        {
            var results = new List<T>();
            
            using (var dbService = new DBService(clientId, false))
            {
                results = await dbService.GetEntityDataAsync(query, parameters, mapper);
            }
            
            return results;
        }
        
        /// <summary>
        /// ✅ CORRECT: Single value extraction with GetValue<T>
        /// </summary>
        public async Task<int> GetCountAsync(string tableName, string whereClause, 
            DBParameters parameters, string clientId)
        {
            string query = $"SELECT COUNT(*) FROM {tableName}";
            if (!string.IsNullOrWhiteSpace(whereClause))
            {
                query += $" WHERE {whereClause}";
            }
            
            using (var dbService = new DBService(clientId, false))
            {
                var result = await dbService.GetEntityDataAsync<int>(query, parameters, (row) =>
                {
                    return row.GetValue<int>("count");
                });
                
                return result;
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: Insert with RETURNING clause
        /// </summary>
        public async Task<int> InsertWithReturnIdAsync(string tableName, DBParameters parameters, string clientId)
        {
            var columns = string.Join(", ", parameters.Keys);
            var values = string.Join(", ", parameters.Keys.Select(k => $"@{k}"));
            
            string query = $"INSERT INTO {tableName} ({columns}) VALUES ({values}) RETURNING id";
            
            using (var dbService = new DBService(clientId, false))
            {
                using (var tran = dbService.BeginTransaction())
                {
                    try
                    {
                        var newId = await dbService.GetEntityDataAsync<int>(query, parameters, (row) =>
                        {
                            return row.GetValue<int>("id");
                        });
                        
                        tran.Commit();
                        return newId;
                    }
                    catch
                    {
                        tran.Rollback();
                        throw;
                    }
                }
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: Update operation
        /// </summary>
        public async Task<int> UpdateRecordAsync(string tableName, int id, DBParameters parameters, string clientId)
        {
            var setClause = string.Join(", ", parameters.Keys.Select(k => $"{k} = @{k}"));
            string query = $"UPDATE {tableName} SET {setClause} WHERE id = @id";
            
            parameters.Add("@id", id);
            
            using (var dbService = new DBService(clientId, false))
            {
                using (var tran = dbService.BeginTransaction())
                {
                    try
                    {
                        var rowsAffected = await dbService.ExecuteSqlCommandAsync(query, parameters);
                        tran.Commit();
                        return rowsAffected;
                    }
                    catch
                    {
                        tran.Rollback();
                        throw;
                    }
                }
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: Delete operation (soft delete recommended)
        /// </summary>
        public async Task<int> SoftDeleteAsync(string tableName, int id, int userId, string clientId)
        {
            string query = $@"UPDATE {tableName} 
                             SET is_deleted = true, 
                                 deleted_at = @deleted_at, 
                                 deleted_by = @deleted_by 
                             WHERE id = @id";
            
            var parameters = new DBParameters();
            parameters.Add("@id", id);
            parameters.Add("@deleted_at", DateTime.UtcNow);
            parameters.Add("@deleted_by", userId);
            
            using (var dbService = new DBService(clientId, false))
            {
                using (var tran = dbService.BeginTransaction())
                {
                    try
                    {
                        var rowsAffected = await dbService.ExecuteSqlCommandAsync(query, parameters);
                        tran.Commit();
                        return rowsAffected;
                    }
                    catch
                    {
                        tran.Rollback();
                        throw;
                    }
                }
            }
        }
        
        #endregion
        
        #region GetValue<T> Patterns for All Data Types
        
        /// <summary>
        /// ✅ CORRECT: All GetValue<T> patterns
        /// Use these patterns for data extraction from IDataReader
        /// </summary>
        public void GetValueExamples(IDataReader row)
        {
            // Basic types
            var intValue = row.GetValue<int>("id");
            var longValue = row.GetValue<long>("big_number");
            var stringValue = row.GetValue<string>("name");
            var boolValue = row.GetValue<bool>("is_active");
            var decimalValue = row.GetValue<decimal>("price");
            var doubleValue = row.GetValue<double>("rate");
            var floatValue = row.GetValue<float>("percentage");
            
            // Date/Time types
            var dateTimeValue = row.GetValue<DateTime>("created_at");
            var dateOnlyValue = row.GetValue<DateOnly>("birth_date");
            var timeOnlyValue = row.GetValue<TimeOnly>("start_time");
            
            // Nullable types
            var nullableIntValue = row.GetValue<int?>("optional_id");
            var nullableDateTimeValue = row.GetValue<DateTime?>("updated_at");
            var nullableDecimalValue = row.GetValue<decimal?>("discount");
            var nullableBoolValue = row.GetValue<bool?>("is_verified");
            
            // Guid types
            var guidValue = row.GetValue<Guid>("uuid");
            var nullableGuidValue = row.GetValue<Guid?>("optional_uuid");
            
            // Array types (PostgreSQL specific)
            var intArrayValue = row.GetValue<int[]>("tag_ids");
            var stringArrayValue = row.GetValue<string[]>("categories");
            
            // JSON types (PostgreSQL specific)
            var jsonValue = row.GetValue<string>("metadata_json");
            
            // Byte array
            var byteArrayValue = row.GetValue<byte[]>("file_data");
        }
        
        /// <summary>
        /// ✅ CORRECT: Safe GetValue with default values
        /// </summary>
        public T SafeGetValue<T>(IDataReader row, string columnName, T defaultValue = default(T))
        {
            try
            {
                if (row.IsDBNull(columnName))
                {
                    return defaultValue;
                }
                return row.GetValue<T>(columnName);
            }
            catch
            {
                return defaultValue;
            }
        }
        
        #endregion
        
        #region Complex Query Patterns
        
        /// <summary>
        /// ✅ CORRECT: JOIN queries with complex mapping
        /// </summary>
        public async Task<List<ComplexEntity>> GetComplexDataAsync(int clientId, string searchText)
        {
            string query = @"
                SELECT 
                    e.id,
                    e.name,
                    e.description,
                    e.created_at,
                    e.is_active,
                    c.name as category_name,
                    c.description as category_description,
                    u.first_name || ' ' || u.last_name as created_by_name,
                    COUNT(r.id) as related_count
                FROM entities e
                LEFT JOIN categories c ON e.category_id = c.id
                LEFT JOIN users u ON e.created_by = u.id
                LEFT JOIN related_items r ON e.id = r.entity_id
                WHERE e.client_id = @client_id
                    AND e.is_deleted = false
                    AND (@search_text IS NULL OR e.name ILIKE @search_text_pattern)
                GROUP BY e.id, e.name, e.description, e.created_at, e.is_active, 
                         c.name, c.description, u.first_name, u.last_name
                ORDER BY e.created_at DESC";
            
            var parameters = new DBParameters();
            parameters.Add("@client_id", clientId);
            parameters.Add("@search_text", searchText);
            parameters.Add("@search_text_pattern", string.IsNullOrWhiteSpace(searchText) ? null : $"%{searchText}%");
            
            using (var dbService = new DBService(clientId.ToString(), false))
            {
                var results = await dbService.GetEntityDataAsync(query, parameters, (row) =>
                {
                    return new ComplexEntity
                    {
                        Id = row.GetValue<int>("id"),
                        Name = row.GetValue<string>("name"),
                        Description = row.GetValue<string>("description"),
                        CreatedAt = row.GetValue<DateTime>("created_at"),
                        IsActive = row.GetValue<bool>("is_active"),
                        CategoryName = row.GetValue<string>("category_name"),
                        CategoryDescription = row.GetValue<string>("category_description"),
                        CreatedByName = row.GetValue<string>("created_by_name"),
                        RelatedCount = row.GetValue<long>("related_count")
                    };
                });
                
                return results;
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: Pagination query pattern
        /// </summary>
        public async Task<PagedResult<T>> GetPagedDataAsync<T>(string baseQuery, DBParameters parameters,
            int page, int pageSize, string clientId, Func<IDataReader, T> mapper)
        {
            // Count query
            string countQuery = $"SELECT COUNT(*) as total FROM ({baseQuery}) as count_query";
            
            // Paged query
            var offset = (page - 1) * pageSize;
            string pagedQuery = $"{baseQuery} LIMIT @page_size OFFSET @offset";
            
            parameters.Add("@page_size", pageSize);
            parameters.Add("@offset", offset);
            
            using (var dbService = new DBService(clientId, false))
            {
                // Get total count
                var totalCount = await dbService.GetEntityDataAsync<long>(countQuery, parameters, (row) =>
                {
                    return row.GetValue<long>("total");
                });
                
                // Get paged data
                var items = await dbService.GetEntityDataAsync(pagedQuery, parameters, mapper);
                
                return new PagedResult<T>
                {
                    Items = items,
                    TotalCount = (int)totalCount,
                    Page = page,
                    PageSize = pageSize
                };
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: Bulk insert pattern
        /// </summary>
        public async Task<string> BulkInsertAsync<T>(List<T> items, string tableName, 
            Func<T, DBParameters> parameterMapper, string clientId)
        {
            if (!items.Any()) return "S";
            
            using (var dbService = new DBService(clientId, false))
            {
                using (var tran = dbService.BeginTransaction())
                {
                    try
                    {
                        foreach (var item in items)
                        {
                            var parameters = parameterMapper(item);
                            var columns = string.Join(", ", parameters.Keys);
                            var values = string.Join(", ", parameters.Keys.Select(k => $"@{k}"));
                            
                            string query = $"INSERT INTO {tableName} ({columns}) VALUES ({values})";
                            await dbService.ExecuteSqlCommandAsync(query, parameters);
                        }
                        
                        tran.Commit();
                        return "S";
                    }
                    catch
                    {
                        tran.Rollback();
                        return "F";
                    }
                }
            }
        }
        
        #endregion
        
        // ===== SECTION 2: ADVANCED DATA PATTERNS =====
        
        #region Stored Procedure Patterns
        
        /// <summary>
        /// ✅ CORRECT: Stored procedure execution
        /// </summary>
        public async Task<List<T>> ExecuteStoredProcedureAsync<T>(string procedureName, 
            DBParameters parameters, string clientId, Func<IDataReader, T> mapper)
        {
            using (var dbService = new DBService(clientId, false))
            {
                var results = await dbService.GetEntityDataAsync(procedureName, parameters, mapper, 
                    CommandType.StoredProcedure);
                return results;
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: Stored procedure with output parameters
        /// </summary>
        public async Task<(List<T> Results, Dictionary<string, object> OutputParams)> 
            ExecuteStoredProcedureWithOutputAsync<T>(string procedureName, DBParameters parameters, 
            List<string> outputParameterNames, string clientId, Func<IDataReader, T> mapper)
        {
            using (var dbService = new DBService(clientId, false))
            {
                var results = await dbService.GetEntityDataAsync(procedureName, parameters, mapper, 
                    CommandType.StoredProcedure);
                
                var outputParams = new Dictionary<string, object>();
                foreach (var paramName in outputParameterNames)
                {
                    outputParams[paramName] = parameters[paramName];
                }
                
                return (results, outputParams);
            }
        }
        
        #endregion
        
        #region Transaction Patterns
        
        /// <summary>
        /// ✅ CORRECT: Complex multi-step transaction
        /// </summary>
        public async Task<string> ComplexTransactionAsync(ComplexOperationData data, string clientId)
        {
            using (var dbService = new DBService(clientId, false))
            {
                using (var tran = dbService.BeginTransaction())
                {
                    try
                    {
                        // Step 1: Insert main record
                        var mainId = await InsertMainRecordAsync(dbService, data.MainRecord);
                        
                        // Step 2: Insert related records
                        foreach (var relatedItem in data.RelatedItems)
                        {
                            relatedItem.MainId = mainId;
                            await InsertRelatedRecordAsync(dbService, relatedItem);
                        }
                        
                        // Step 3: Update aggregates
                        await UpdateAggregatesAsync(dbService, mainId);
                        
                        // Step 4: Log audit trail
                        await InsertAuditLogAsync(dbService, new AuditLog
                        {
                            TableName = "main_records",
                            RecordId = mainId,
                            Action = "INSERT",
                            UserId = data.UserId,
                            Timestamp = DateTime.UtcNow
                        });
                        
                        tran.Commit();
                        return "S";
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        throw; // Re-throw to let service layer handle logging
                    }
                }
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: Savepoint pattern for nested transactions
        /// </summary>
        public async Task<string> NestedTransactionAsync(List<BatchOperation> operations, string clientId)
        {
            using (var dbService = new DBService(clientId, false))
            {
                using (var mainTran = dbService.BeginTransaction())
                {
                    try
                    {
                        for (int i = 0; i < operations.Count; i++)
                        {
                            var savepoint = $"sp_{i}";
                            await dbService.ExecuteSqlCommandAsync($"SAVEPOINT {savepoint}");
                            
                            try
                            {
                                await ExecuteOperationAsync(dbService, operations[i]);
                            }
                            catch
                            {
                                await dbService.ExecuteSqlCommandAsync($"ROLLBACK TO SAVEPOINT {savepoint}");
                                if (operations[i].IsRequired)
                                {
                                    throw; // Required operation failed, abort entire transaction
                                }
                                // Optional operation failed, continue with next
                            }
                        }
                        
                        mainTran.Commit();
                        return "S";
                    }
                    catch
                    {
                        mainTran.Rollback();
                        return "F";
                    }
                }
            }
        }
        
        #endregion
        
        #region Connection Pool Patterns
        
        /// <summary>
        /// ✅ CORRECT: Multiple database connections
        /// </summary>
        public async Task<string> MultiDatabaseOperationAsync(CrossDbOperationData data)
        {
            // Use different client IDs for different databases
            using (var db1Service = new DBService(data.ClientId1, false))
            using (var db2Service = new DBService(data.ClientId2, false))
            {
                using (var tran1 = db1Service.BeginTransaction())
                using (var tran2 = db2Service.BeginTransaction())
                {
                    try
                    {
                        // Operation on database 1
                        await ExecuteDb1OperationAsync(db1Service, data.Db1Data);
                        
                        // Operation on database 2
                        await ExecuteDb2OperationAsync(db2Service, data.Db2Data);
                        
                        // Commit both transactions
                        tran1.Commit();
                        tran2.Commit();
                        
                        return "S";
                    }
                    catch
                    {
                        // Rollback both transactions
                        tran1.Rollback();
                        tran2.Rollback();
                        return "F";
                    }
                }
            }
        }
        
        #endregion
        
        #region Performance Patterns
        
        /// <summary>
        /// ✅ CORRECT: Batch processing pattern
        /// </summary>
        public async Task<string> BatchProcessAsync<T>(List<T> items, int batchSize, 
            Func<List<T>, Task<string>> processor)
        {
            for (int i = 0; i < items.Count; i += batchSize)
            {
                var batch = items.Skip(i).Take(batchSize).ToList();
                var result = await processor(batch);
                
                if (result != "S")
                {
                    return $"Batch processing failed at item {i}";
                }
            }
            
            return "S";
        }
        
        /// <summary>
        /// ✅ CORRECT: Async enumerable for large datasets
        /// </summary>
        public async IAsyncEnumerable<T> StreamLargeDatasetAsync<T>(string query, 
            DBParameters parameters, string clientId, Func<IDataReader, T> mapper)
        {
            using (var dbService = new DBService(clientId, false))
            {
                using (var command = dbService.CreateCommand(query))
                {
                    dbService.AddParameters(command, parameters);
                    
                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            yield return mapper(reader);
                        }
                    }
                }
            }
        }
        
        #endregion
        
        // ===== SECTION 3: EDGE CASES & SPECIAL PATTERNS =====
        
        #region JSON Operations (PostgreSQL)
        
        /// <summary>
        /// ✅ CORRECT: JSON column operations
        /// </summary>
        public async Task<List<T>> QueryJsonColumnAsync<T>(string tableName, string jsonColumn, 
            string jsonPath, object jsonValue, string clientId, Func<IDataReader, T> mapper)
        {
            string query = $@"
                SELECT * FROM {tableName}
                WHERE {jsonColumn}->'{jsonPath}' = @json_value::jsonb
                AND client_id = @client_id";
            
            var parameters = new DBParameters();
            parameters.Add("@json_value", jsonValue?.ToString());
            parameters.Add("@client_id", clientId);
            
            using (var dbService = new DBService(clientId, false))
            {
                return await dbService.GetEntityDataAsync(query, parameters, mapper);
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: Update JSON column
        /// </summary>
        public async Task<string> UpdateJsonColumnAsync(string tableName, int id, 
            string jsonColumn, Dictionary<string, object> jsonUpdates, string clientId)
        {
            var setClauses = new List<string>();
            var parameters = new DBParameters();
            parameters.Add("@id", id);
            
            foreach (var update in jsonUpdates)
            {
                var paramName = $"@json_{update.Key}";
                setClauses.Add($"{jsonColumn} = jsonb_set({jsonColumn}, '{{{update.Key}}}', {paramName}::jsonb)");
                parameters.Add(paramName, update.Value?.ToString());
            }
            
            string query = $"UPDATE {tableName} SET {string.Join(", ", setClauses)} WHERE id = @id";
            
            using (var dbService = new DBService(clientId, false))
            {
                using (var tran = dbService.BeginTransaction())
                {
                    try
                    {
                        await dbService.ExecuteSqlCommandAsync(query, parameters);
                        tran.Commit();
                        return "S";
                    }
                    catch
                    {
                        tran.Rollback();
                        return "F";
                    }
                }
            }
        }
        
        #endregion
        
        #region Array Operations (PostgreSQL)
        
        /// <summary>
        /// ✅ CORRECT: Array column operations
        /// </summary>
        public async Task<List<T>> QueryArrayColumnAsync<T>(string tableName, string arrayColumn, 
            int[] searchValues, string clientId, Func<IDataReader, T> mapper)
        {
            string query = $@"
                SELECT * FROM {tableName}
                WHERE {arrayColumn} && @search_array
                AND client_id = @client_id";
            
            var parameters = new DBParameters();
            parameters.Add("@search_array", searchValues);
            parameters.Add("@client_id", clientId);
            
            using (var dbService = new DBService(clientId, false))
            {
                return await dbService.GetEntityDataAsync(query, parameters, mapper);
            }
        }
        
        #endregion
        
        #region Full-Text Search
        
        /// <summary>
        /// ✅ CORRECT: PostgreSQL full-text search
        /// </summary>
        public async Task<List<T>> FullTextSearchAsync<T>(string tableName, string[] searchColumns, 
            string searchText, string clientId, Func<IDataReader, T> mapper)
        {
            var vectorColumns = string.Join(" || ' ' || ", searchColumns);
            
            string query = $@"
                SELECT *, 
                       ts_rank(to_tsvector('english', {vectorColumns}), plainto_tsquery('english', @search_text)) as rank
                FROM {tableName}
                WHERE to_tsvector('english', {vectorColumns}) @@ plainto_tsquery('english', @search_text)
                  AND client_id = @client_id
                ORDER BY rank DESC";
            
            var parameters = new DBParameters();
            parameters.Add("@search_text", searchText);
            parameters.Add("@client_id", clientId);
            
            using (var dbService = new DBService(clientId, false))
            {
                return await dbService.GetEntityDataAsync(query, parameters, mapper);
            }
        }
        
        #endregion
        
        // ===== SECTION 4: ERROR HANDLING & DEBUGGING =====
        
        #region Error Handling Patterns
        
        /// <summary>
        /// ✅ CORRECT: Comprehensive error handling
        /// </summary>
        public async Task<(string Result, string ErrorMessage)> SafeExecuteAsync(
            Func<Task<string>> operation, ILogger logger)
        {
            try
            {
                var result = await operation();
                return (result, null);
            }
            catch (NpgsqlException ex) when (ex.SqlState == "23505") // Unique constraint violation
            {
                logger.LogWarning("Unique constraint violation: {Message}", ex.Message);
                return ("F", "A record with this information already exists.");
            }
            catch (NpgsqlException ex) when (ex.SqlState == "23503") // Foreign key violation
            {
                logger.LogWarning("Foreign key violation: {Message}", ex.Message);
                return ("F", "This operation would violate data relationships.");
            }
            catch (NpgsqlException ex) when (ex.SqlState == "23514") // Check constraint violation
            {
                logger.LogWarning("Check constraint violation: {Message}", ex.Message);
                return ("F", "The data provided does not meet validation requirements.");
            }
            catch (NpgsqlException ex)
            {
                logger.LogError(ex, "Database error occurred: {SqlState} - {Message}", ex.SqlState, ex.Message);
                return ("F", "A database error occurred. Please try again.");
            }
            catch (TimeoutException ex)
            {
                logger.LogError(ex, "Database timeout occurred");
                return ("F", "The operation took too long to complete. Please try again.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Unexpected error occurred");
                return ("F", "An unexpected error occurred. Please contact support.");
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: Connection state validation
        /// </summary>
        public bool ValidateConnection(DBService dbService, ILogger logger)
        {
            try
            {
                return dbService.TestConnection();
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Connection validation failed");
                return false;
            }
        }
        
        #endregion
        
        #region Query Debugging Patterns
        
        /// <summary>
        /// ✅ CORRECT: Query logging and debugging
        /// </summary>
        public async Task<List<T>> ExecuteWithLoggingAsync<T>(string query, DBParameters parameters,
            string clientId, Func<IDataReader, T> mapper, ILogger logger)
        {
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();
            
            try
            {
                logger.LogDebug("Executing query: {Query}", query);
                logger.LogDebug("Parameters: {Parameters}", 
                    string.Join(", ", parameters.Select(p => $"{p.Key}={p.Value}")));
                
                using (var dbService = new DBService(clientId, false))
                {
                    var results = await dbService.GetEntityDataAsync(query, parameters, mapper);
                    
                    stopwatch.Stop();
                    logger.LogDebug("Query executed successfully in {ElapsedMs}ms, returned {Count} rows", 
                        stopwatch.ElapsedMilliseconds, results.Count);
                    
                    return results;
                }
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                logger.LogError(ex, "Query failed after {ElapsedMs}ms: {Query}", 
                    stopwatch.ElapsedMilliseconds, query);
                throw;
            }
        }
        
        #endregion
        
        // ===== SECTION 5: COMPLETE WORKING EXAMPLES =====
        
        /// <summary>
        /// ✅ COMPLETE EXAMPLE: Full data access layer for an entity
        /// </summary>
        public class UserDataAccess
        {
            private readonly ILogger<UserDataAccess> _logger;
            
            public UserDataAccess(ILogger<UserDataAccess> logger)
            {
                _logger = logger;
            }
            
            public async Task<List<User>> GetAllUsersAsync(int clientId, string searchText = null)
            {
                string query = @"
                    SELECT 
                        u.id,
                        u.first_name,
                        u.last_name,
                        u.email,
                        u.is_active,
                        u.created_at,
                        u.updated_at,
                        r.name as role_name,
                        d.name as department_name
                    FROM users u
                    LEFT JOIN roles r ON u.role_id = r.id
                    LEFT JOIN departments d ON u.department_id = d.id
                    WHERE u.client_id = @client_id
                      AND u.is_deleted = false
                      AND (@search_text IS NULL OR 
                           u.first_name ILIKE @search_pattern OR 
                           u.last_name ILIKE @search_pattern OR 
                           u.email ILIKE @search_pattern)
                    ORDER BY u.last_name, u.first_name";
                
                var parameters = new DBParameters();
                parameters.Add("@client_id", clientId);
                parameters.Add("@search_text", searchText);
                parameters.Add("@search_pattern", string.IsNullOrWhiteSpace(searchText) ? null : $"%{searchText}%");
                
                return await ExecuteWithLoggingAsync(query, parameters, clientId.ToString(), MapUser, _logger);
            }
            
            public async Task<User> GetUserByIdAsync(int id, int clientId)
            {
                string query = @"
                    SELECT 
                        u.id,
                        u.first_name,
                        u.last_name,
                        u.email,
                        u.phone,
                        u.is_active,
                        u.role_id,
                        u.department_id,
                        u.created_at,
                        u.updated_at,
                        r.name as role_name,
                        d.name as department_name
                    FROM users u
                    LEFT JOIN roles r ON u.role_id = r.id
                    LEFT JOIN departments d ON u.department_id = d.id
                    WHERE u.id = @id 
                      AND u.client_id = @client_id
                      AND u.is_deleted = false";
                
                var parameters = new DBParameters();
                parameters.Add("@id", id);
                parameters.Add("@client_id", clientId);
                
                var results = await ExecuteWithLoggingAsync(query, parameters, clientId.ToString(), MapUser, _logger);
                return results.FirstOrDefault();
            }
            
            public async Task<string> SaveUserAsync(User user, int clientId)
            {
                if (user.IsEdit)
                {
                    return await UpdateUserAsync(user, clientId);
                }
                else
                {
                    return await InsertUserAsync(user, clientId);
                }
            }
            
            private async Task<string> InsertUserAsync(User user, int clientId)
            {
                string query = @"
                    INSERT INTO users 
                    (client_id, first_name, last_name, email, phone, role_id, department_id, is_active, created_at, created_by)
                    VALUES 
                    (@client_id, @first_name, @last_name, @email, @phone, @role_id, @department_id, @is_active, @created_at, @created_by)
                    RETURNING id";
                
                var parameters = new DBParameters();
                parameters.Add("@client_id", clientId);
                parameters.Add("@first_name", user.FirstName);
                parameters.Add("@last_name", user.LastName);
                parameters.Add("@email", user.Email);
                parameters.Add("@phone", user.Phone);
                parameters.Add("@role_id", user.RoleId);
                parameters.Add("@department_id", user.DepartmentId);
                parameters.Add("@is_active", user.IsActive);
                parameters.Add("@created_at", DateTime.UtcNow);
                parameters.Add("@created_by", user.UserId);
                
                using (var dbService = new DBService(clientId.ToString(), false))
                {
                    using (var tran = dbService.BeginTransaction())
                    {
                        try
                        {
                            var newId = await dbService.GetEntityDataAsync<int>(query, parameters, (row) =>
                            {
                                return row.GetValue<int>("id");
                            });
                            
                            user.ID = newId;
                            tran.Commit();
                            
                            _logger.LogInformation("User created successfully with ID: {UserId}", newId);
                            return "S";
                        }
                        catch (Exception ex)
                        {
                            tran.Rollback();
                            _logger.LogError(ex, "Failed to insert user");
                            return "F";
                        }
                    }
                }
            }
            
            private async Task<string> UpdateUserAsync(User user, int clientId)
            {
                string query = @"
                    UPDATE users 
                    SET first_name = @first_name,
                        last_name = @last_name,
                        email = @email,
                        phone = @phone,
                        role_id = @role_id,
                        department_id = @department_id,
                        is_active = @is_active,
                        updated_at = @updated_at,
                        updated_by = @updated_by
                    WHERE id = @id AND client_id = @client_id";
                
                var parameters = new DBParameters();
                parameters.Add("@id", user.ID);
                parameters.Add("@client_id", clientId);
                parameters.Add("@first_name", user.FirstName);
                parameters.Add("@last_name", user.LastName);
                parameters.Add("@email", user.Email);
                parameters.Add("@phone", user.Phone);
                parameters.Add("@role_id", user.RoleId);
                parameters.Add("@department_id", user.DepartmentId);
                parameters.Add("@is_active", user.IsActive);
                parameters.Add("@updated_at", DateTime.UtcNow);
                parameters.Add("@updated_by", user.UserId);
                
                using (var dbService = new DBService(clientId.ToString(), false))
                {
                    using (var tran = dbService.BeginTransaction())
                    {
                        try
                        {
                            var rowsAffected = await dbService.ExecuteSqlCommandAsync(query, parameters);
                            tran.Commit();
                            
                            _logger.LogInformation("User updated successfully: {UserId}", user.ID);
                            return rowsAffected > 0 ? "S" : "F";
                        }
                        catch (Exception ex)
                        {
                            tran.Rollback();
                            _logger.LogError(ex, "Failed to update user: {UserId}", user.ID);
                            return "F";
                        }
                    }
                }
            }
            
            private User MapUser(IDataReader row)
            {
                return new User
                {
                    ID = row.GetValue<int>("id"),
                    FirstName = row.GetValue<string>("first_name"),
                    LastName = row.GetValue<string>("last_name"),
                    Email = row.GetValue<string>("email"),
                    Phone = row.GetValue<string>("phone"),
                    IsActive = row.GetValue<bool>("is_active"),
                    RoleId = row.GetValue<int?>("role_id"),
                    DepartmentId = row.GetValue<int?>("department_id"),
                    CreatedAt = row.GetValue<DateTime>("created_at"),
                    UpdatedAt = row.GetValue<DateTime?>("updated_at"),
                    RoleName = row.GetValue<string>("role_name"),
                    DepartmentName = row.GetValue<string>("department_name")
                };
            }
        }
    }
    
    // ===== SUPPORTING CLASSES =====
    
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }
    
    public class ComplexEntity
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public string CategoryName { get; set; }
        public string CategoryDescription { get; set; }
        public string CreatedByName { get; set; }
        public long RelatedCount { get; set; }
    }
    
    public class ComplexOperationData
    {
        public object MainRecord { get; set; }
        public List<object> RelatedItems { get; set; }
        public int UserId { get; set; }
    }
    
    public class BatchOperation
    {
        public string Operation { get; set; }
        public object Data { get; set; }
        public bool IsRequired { get; set; }
    }
    
    public class CrossDbOperationData
    {
        public string ClientId1 { get; set; }
        public string ClientId2 { get; set; }
        public object Db1Data { get; set; }
        public object Db2Data { get; set; }
    }
    
    public class AuditLog
    {
        public string TableName { get; set; }
        public int RecordId { get; set; }
        public string Action { get; set; }
        public int UserId { get; set; }
        public DateTime Timestamp { get; set; }
    }
    
    public class User
    {
        public int ID { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Phone { get; set; }
        public bool IsActive { get; set; }
        public int? RoleId { get; set; }
        public int? DepartmentId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public string RoleName { get; set; }
        public string DepartmentName { get; set; }
        public bool IsEdit { get; set; }
        public int UserId { get; set; }
    }
}

// ❌ COMMON MISTAKES TO AVOID:
// 1. Not disposing DBService properly (always use 'using' statements)
// 2. Not using transactions for multi-step operations
// 3. Not using GetValue<T> for data extraction
// 4. Forgetting to handle DBNull values
// 5. Not parameterizing queries (SQL injection risk)
// 6. Not logging errors and performance metrics
// 7. Not handling specific database exceptions
// 8. Using string concatenation instead of parameters
// 9. Not validating connection state
// 10. Forgetting to commit transactions