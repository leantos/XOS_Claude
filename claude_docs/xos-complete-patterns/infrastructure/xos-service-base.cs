// ===== XOS SERVICE BASE COMPLETE PATTERNS =====
// This file shows ALL patterns for using XOSServiceBase infrastructure
// Every service MUST extend XOSServiceBase for XOS framework functionality

using CVS.Transaction.Core;
using Microsoft.Extensions.Logging;
using XOS.Data;
using System.Text;

namespace CVS.Transaction.Services
{
    // ===== SECTION 1: SERVICE BASE USAGE PATTERNS =====
    
    /// <summary>
    /// ⚠️ CRITICAL: Every service MUST follow this pattern
    /// - Always extend XOSServiceBase
    /// - Always inject IServiceProvider and ILogger
    /// - Always call base constructor
    /// - Use GetDBService() for database access
    /// - Use DBUtils() for direct operations
    /// </summary>
    public class ExampleService : XOSServiceBase, IExampleService
    {
        #region Constructor Pattern
        
        /// <summary>
        /// ⚠️ CRITICAL: Constructor pattern - NEVER change this
        /// </summary>
        public ExampleService(IServiceProvider serviceProvider, ILogger<ExampleService> logger) 
            : base(serviceProvider, logger)
        {
            // Additional initialization if needed
        }
        
        #endregion
        
        #region Database Service Patterns
        
        /// <summary>
        /// ⚠️ CRITICAL: Single database operation pattern
        /// Use this for simple operations within one database
        /// </summary>
        public async Task<string> SingleDatabaseOperationAsync(InputData input, InputInfo loginInfo)
        {
            string result = "F";
            
            // ✅ CORRECT: GetDBService pattern
            using (var dbService = this.GetDBService(loginInfo.ClientID.ToString(), false))
            {
                using (var tran = dbService.BeginTransaction())
                {
                    try
                    {
                        // Your database operations here
                        DBParameters dbParams = new DBParameters();
                        string query = "UPDATE table_name SET field = @value WHERE id = @id";
                        dbParams.Add("value", input.Value);
                        dbParams.Add("id", input.ID);
                        
                        await dbService.ExecuteSqlCommandAsync(query, dbParams);
                        
                        tran.Commit();
                        result = "S";
                    }
                    catch (Exception ex)
                    {
                        tran.Rollback();
                        this.Logger.LogError(ex, "SingleDatabaseOperation failed");
                        throw;
                    }
                }
            }
            
            return result;
        }
        
        /// <summary>
        /// ⚠️ CRITICAL: Multi-database operation pattern
        /// Use this when you need transactions across multiple databases
        /// </summary>
        public async Task<string> MultiDatabaseOperationAsync(InputData input, InputInfo loginInfo)
        {
            string result = "F";
            
            // ✅ CORRECT: Multi-database with shared transaction owner
            using (var transactionOwner = new object())
            using (var db1 = this.GetDBService("Database1", transactionOwner))
            using (var db2 = this.GetDBService("Database2", transactionOwner))
            {
                using (var tran1 = db1.BeginTransaction())
                using (var tran2 = db2.BeginTransaction())
                {
                    try
                    {
                        // Operations on database 1
                        await db1.ExecuteSqlCommandAsync("UPDATE table1 SET field = @value", 
                            new DBParameters { { "value", input.Value } });
                        
                        // Operations on database 2
                        await db2.ExecuteSqlCommandAsync("INSERT INTO table2 (data) VALUES (@data)", 
                            new DBParameters { { "data", input.Data } });
                        
                        // Commit both transactions
                        tran1.Commit();
                        tran2.Commit();
                        result = "S";
                    }
                    catch (Exception ex)
                    {
                        tran1.Rollback();
                        tran2.Rollback();
                        this.Logger.LogError(ex, "MultiDatabaseOperation failed");
                        throw;
                    }
                }
            }
            
            return result;
        }
        
        /// <summary>
        /// ⚠️ CRITICAL: DBUtils direct access pattern
        /// Use this for read-only operations or when you don't need transactions
        /// </summary>
        public async Task<List<DataItem>> DirectDBUtilsOperationAsync(short clientID)
        {
            List<DataItem> items = new List<DataItem>();
            
            try
            {
                // ✅ CORRECT: Direct DBUtils usage
                items = await this.DBUtils(clientID.ToString(), false)
                    .GetEntityDataListAsync<DataItem>("SELECT id, name FROM table WHERE client_id = @client_id", 
                    new DBParameters { { "client_id", clientID } }, 
                    (row) => 
                    {
                        return new DataItem
                        {
                            ID = row.GetValue<int>("id"),
                            Name = row.GetValue<string>("name", "")
                        };
                    });
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, "DirectDBUtilsOperation failed");
                throw;
            }
            
            return items;
        }
        
        #endregion
        
        #region Data Access Patterns
        
        /// <summary>
        /// ⚠️ CRITICAL: GetEntityDataAsync pattern for single record
        /// </summary>
        public async Task<EntityData> GetSingleRecordAsync(int id, short clientID)
        {
            EntityData entity = null;
            DBParameters dbParams = new DBParameters();
            
            string query = @"
                SELECT 
                    e.id,
                    e.name,
                    e.email,
                    e.is_active,
                    e.created_date,
                    c.category_name
                FROM entities e
                LEFT JOIN categories c ON e.category_id = c.id
                WHERE e.id = @id 
                  AND e.client_id = @client_id
                  AND e.is_deleted = false
            ";
            
            dbParams.Add("id", id);
            dbParams.Add("client_id", clientID);
            
            try
            {
                // ✅ CORRECT: GetEntityDataAsync for single record
                await this.DBUtils(clientID.ToString(), false).GetEntityDataAsync<bool>(query, dbParams, (row) =>
                {
                    entity = new EntityData
                    {
                        ID = row.GetValue<int>("id"),
                        Name = row.GetValue<string>("name", ""),
                        Email = row.GetValue<string>("email", ""),
                        IsActive = row.GetValue<bool>("is_active", false),
                        CreatedDate = row.GetValue<DateTime?>("created_date"),
                        CategoryName = row.GetValue<string>("category_name", "")
                    };
                    return true;
                });
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, "GetSingleRecord failed for ID {ID}", id);
                throw;
            }
            
            return entity;
        }
        
        /// <summary>
        /// ⚠️ CRITICAL: GetEntityDataListAsync pattern for multiple records
        /// </summary>
        public async Task<List<EntityData>> GetMultipleRecordsAsync(SearchCriteria criteria, short clientID)
        {
            List<EntityData> entities = new List<EntityData>();
            DBParameters dbParams = new DBParameters();
            StringBuilder query = new StringBuilder();
            
            query.Append(@"
                SELECT 
                    e.id,
                    e.name,
                    e.email,
                    e.is_active,
                    c.category_name
                FROM entities e
                LEFT JOIN categories c ON e.category_id = c.id
                WHERE e.client_id = @client_id
                  AND e.is_deleted = false
            ");
            
            dbParams.Add("client_id", clientID);
            
            // Dynamic WHERE clauses
            if (!string.IsNullOrEmpty(criteria.SearchTerm))
            {
                query.Append(" AND (e.name ILIKE @search OR e.email ILIKE @search)");
                dbParams.Add("search", $"%{criteria.SearchTerm}%");
            }
            
            if (criteria.CategoryId.HasValue)
            {
                query.Append(" AND e.category_id = @category_id");
                dbParams.Add("category_id", criteria.CategoryId.Value);
            }
            
            query.Append(" ORDER BY e.name LIMIT @limit OFFSET @offset");
            dbParams.Add("limit", criteria.PageSize);
            dbParams.Add("offset", (criteria.Page - 1) * criteria.PageSize);
            
            try
            {
                // ✅ CORRECT: GetEntityDataListAsync for multiple records
                entities = await this.DBUtils(clientID.ToString(), false)
                    .GetEntityDataListAsync<EntityData>(query.ToString(), dbParams, (row) =>
                    {
                        return new EntityData
                        {
                            ID = row.GetValue<int>("id"),
                            Name = row.GetValue<string>("name", ""),
                            Email = row.GetValue<string>("email", ""),
                            IsActive = row.GetValue<bool>("is_active", false),
                            CategoryName = row.GetValue<string>("category_name", "")
                        };
                    });
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, "GetMultipleRecords failed");
                throw;
            }
            
            return entities;
        }
        
        /// <summary>
        /// ⚠️ CRITICAL: Multiple result sets pattern
        /// Use when you need to load related data in one query
        /// </summary>
        public async Task<ComplexData> GetComplexDataAsync(short clientID)
        {
            var data = new ComplexData
            {
                Entities = new List<EntityData>(),
                Categories = new List<CategoryData>(),
                Statistics = new StatisticsData()
            };
            
            DBParameters dbParams = new DBParameters();
            string query = @"
                -- First result set: Entities
                SELECT id, name, email, is_active FROM entities 
                WHERE client_id = @client_id AND is_deleted = false
                ORDER BY name;
                
                -- Second result set: Categories
                SELECT id, name, is_active FROM categories 
                WHERE client_id = @client_id AND is_deleted = false
                ORDER BY name;
                
                -- Third result set: Statistics
                SELECT 
                    COUNT(*) as total_entities,
                    COUNT(CASE WHEN is_active THEN 1 END) as active_entities,
                    MAX(created_date) as last_created
                FROM entities 
                WHERE client_id = @client_id AND is_deleted = false;
            ";
            
            dbParams.Add("client_id", clientID);
            
            try
            {
                // ✅ CORRECT: Multiple result sets handling
                await this.DBUtils(clientID.ToString(), false).GetEntityDataAsync<bool>(query, dbParams, (reader) =>
                {
                    // First result set - Entities
                    while (reader.Read())
                    {
                        data.Entities.Add(new EntityData
                        {
                            ID = reader.GetValue<int>("id"),
                            Name = reader.GetValue<string>("name", ""),
                            Email = reader.GetValue<string>("email", ""),
                            IsActive = reader.GetValue<bool>("is_active", false)
                        });
                    }
                    
                    // Move to next result set - Categories
                    reader.NextResult();
                    while (reader.Read())
                    {
                        data.Categories.Add(new CategoryData
                        {
                            ID = reader.GetValue<int>("id"),
                            Name = reader.GetValue<string>("name", ""),
                            IsActive = reader.GetValue<bool>("is_active", false)
                        });
                    }
                    
                    // Move to next result set - Statistics
                    reader.NextResult();
                    if (reader.Read())
                    {
                        data.Statistics = new StatisticsData
                        {
                            TotalEntities = reader.GetValue<int>("total_entities"),
                            ActiveEntities = reader.GetValue<int>("active_entities"),
                            LastCreated = reader.GetValue<DateTime?>("last_created")
                        };
                    }
                    
                    return true;
                });
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, "GetComplexData failed");
                throw;
            }
            
            return data;
        }
        
        #endregion
        
        #region XOS Specific Patterns
        
        /// <summary>
        /// ⚠️ CRITICAL: Audit trail pattern
        /// Use this to maintain audit logs for all operations
        /// </summary>
        private async Task SaveAuditAsync(IDBService dbService, AuditInfo auditInfo)
        {
            try
            {
                string auditQuery = @"
                    INSERT INTO audit_trail (
                        client_id, user_id, form_id, record_id, action, 
                        old_values, new_values, timestamp, ip_address
                    ) VALUES (
                        @client_id, @user_id, @form_id, @record_id, @action,
                        @old_values, @new_values, @timestamp, @ip_address
                    )
                ";
                
                DBParameters auditParams = new DBParameters();
                auditParams.Add("client_id", auditInfo.ClientID);
                auditParams.Add("user_id", auditInfo.UserID);
                auditParams.Add("form_id", auditInfo.FormID);
                auditParams.Add("record_id", auditInfo.RecordID);
                auditParams.Add("action", auditInfo.Action);
                auditParams.Add("old_values", auditInfo.OldValues ?? "");
                auditParams.Add("new_values", auditInfo.NewValues ?? "");
                auditParams.Add("timestamp", DateTime.UtcNow);
                auditParams.Add("ip_address", auditInfo.IPAddress ?? "");
                
                await dbService.ExecuteSqlCommandAsync(auditQuery, auditParams);
            }
            catch (Exception ex)
            {
                // Audit failures should not break main operations
                this.Logger.LogWarning(ex, "Audit save failed for {FormID}:{RecordID}", 
                    auditInfo.FormID, auditInfo.RecordID);
            }
        }
        
        /// <summary>
        /// ⚠️ CRITICAL: SignalR notification pattern
        /// Always call AFTER transaction commit
        /// </summary>
        private async Task NotifyClientsAsync(short clientId, string method, object data)
        {
            try
            {
                // Implementation depends on your SignalR hub setup
                // Example:
                // await this.HubContext.Clients.Group($"Client_{clientId}")
                //     .SendAsync(method, data);
                
                this.Logger.LogInformation("SignalR notification sent: {Method} for client {ClientId}", 
                    method, clientId);
            }
            catch (Exception ex)
            {
                // SignalR failures should not break main operations
                this.Logger.LogWarning(ex, "SignalR notification failed: {Method}", method);
            }
        }
        
        /// <summary>
        /// ⚠️ CRITICAL: Multi-tenant connection string pattern
        /// XOS automatically routes to correct database based on ClientID
        /// </summary>
        public async Task<string> GetConnectionStringExampleAsync(short clientID)
        {
            // ✅ CORRECT: XOS handles connection string routing automatically
            // You just provide the clientID and XOS finds the right database
            
            // For reference, connection strings are configured like:
            // {
            //   "CrystalDB": {
            //     "ConnectionString": "Host=localhost;Database=client1_db;",
            //     "Keys": ["1", "MG"]
            //   },
            //   "CrystalDB2": {
            //     "ConnectionString": "Host=localhost;Database=client2_db;",
            //     "Keys": ["2", "WB"]
            //   }
            // }
            
            using (var dbService = this.GetDBService(clientID.ToString(), false))
            {
                // This automatically uses the correct database for the client
                var result = await dbService.ExecuteScalarAsync<string>(
                    "SELECT current_database()", 
                    new DBParameters()
                );
                return result;
            }
        }
        
        #endregion
        
        #region Error Handling Patterns
        
        /// <summary>
        /// ⚠️ CRITICAL: Consistent error handling pattern
        /// </summary>
        public async Task<OperationResult> SafeOperationAsync(InputData input, InputInfo loginInfo)
        {
            var result = new OperationResult { Success = false };
            
            try
            {
                // Validate input
                if (input == null)
                {
                    result.Message = "Input data is required";
                    return result;
                }
                
                if (string.IsNullOrEmpty(input.Name))
                {
                    result.Message = "Name is required";
                    return result;
                }
                
                // Perform operation
                using (var dbService = this.GetDBService(loginInfo.ClientID.ToString(), false))
                {
                    using (var tran = dbService.BeginTransaction())
                    {
                        try
                        {
                            // Your business logic here
                            var saveResult = await this.SaveDataAsync(dbService, input);
                            
                            if (saveResult == "S")
                            {
                                tran.Commit();
                                result.Success = true;
                                result.Message = "Operation completed successfully";
                                result.Data = input;
                            }
                            else
                            {
                                tran.Rollback();
                                result.Message = "Save operation failed";
                            }
                        }
                        catch (Exception ex)
                        {
                            tran.Rollback();
                            this.Logger.LogError(ex, "SafeOperation failed for input {InputName}", input.Name);
                            result.Message = "Operation failed: " + ex.Message;
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                this.Logger.LogError(ex, "SafeOperation outer exception");
                result.Message = "Unexpected error occurred";
            }
            
            return result;
        }
        
        private async Task<string> SaveDataAsync(IDBService dbService, InputData input)
        {
            // Implementation here
            return "S";
        }
        
        #endregion
        
        #region Disposal Pattern
        
        /// <summary>
        /// ⚠️ CRITICAL: Proper disposal pattern
        /// Override OnDispose for custom cleanup
        /// </summary>
        protected override void OnDispose()
        {
            // Custom cleanup code here
            // Base class handles standard XOS cleanup
        }
        
        #endregion
    }
    
    // ===== SUPPORTING CLASSES =====
    
    public class InputData
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public string Value { get; set; }
        public string Data { get; set; }
    }
    
    public class EntityData
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public bool IsActive { get; set; }
        public DateTime? CreatedDate { get; set; }
        public string CategoryName { get; set; }
    }
    
    public class CategoryData
    {
        public int ID { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
    }
    
    public class StatisticsData
    {
        public int TotalEntities { get; set; }
        public int ActiveEntities { get; set; }
        public DateTime? LastCreated { get; set; }
    }
    
    public class ComplexData
    {
        public List<EntityData> Entities { get; set; }
        public List<CategoryData> Categories { get; set; }
        public StatisticsData Statistics { get; set; }
    }
    
    public class SearchCriteria
    {
        public string SearchTerm { get; set; }
        public int? CategoryId { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
    }
    
    public class AuditInfo
    {
        public short ClientID { get; set; }
        public int UserID { get; set; }
        public string FormID { get; set; }
        public string RecordID { get; set; }
        public string Action { get; set; }
        public string OldValues { get; set; }
        public string NewValues { get; set; }
        public string IPAddress { get; set; }
    }
    
    public class OperationResult
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public object Data { get; set; }
    }
    
    public interface IExampleService : IDisposable
    {
        Task<string> SingleDatabaseOperationAsync(InputData input, InputInfo loginInfo);
        Task<List<EntityData>> GetMultipleRecordsAsync(SearchCriteria criteria, short clientID);
    }
}

// ===== USAGE NOTES =====
/*
⚠️ CRITICAL PATTERNS TO NEVER CHANGE:
1. Always extend XOSServiceBase with correct constructor
2. Always use GetDBService() for database connections
3. Always use transactions for data modifications
4. Always use GetValue<T>() for reading data
5. Always commit transactions before SignalR notifications
6. Always handle exceptions properly

✅ CUSTOMIZATION POINTS:
1. Replace ExampleService with your service name
2. Implement IYourService interface
3. Add your specific business logic methods
4. Customize audit trail information
5. Add your SignalR hub integration
6. Implement your validation rules

💡 PERFORMANCE TIPS:
1. Use multi-database patterns only when necessary
2. Prefer GetEntityDataListAsync for multiple records
3. Use multiple result sets to reduce round trips
4. Implement proper connection disposal
5. Use parameterized queries always

🛡️ SECURITY CONSIDERATIONS:
1. Always validate input parameters
2. Use proper SQL parameterization
3. Implement audit trails for sensitive operations
4. Handle exceptions without exposing internals
5. Use proper logging for security events

🔥 OPTIMIZATION NOTES:
1. XOSServiceBase provides connection pooling
2. Use async/await throughout
3. Dispose resources properly
4. Log performance-critical operations
5. Use structured logging
*/