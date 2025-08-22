// ===== XOS CONTROLLER COMPLETE PATTERNS =====
// This file contains EVERY controller pattern for XOS Framework
// 95% of endpoints should be POST - this is XOS convention

using CVS.Transaction.Domain;
using CVS.Transaction.Interfaces;
using CVS.WebApi.Controllers;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

namespace CVS.WebApi.Controllers
{
    /// <summary>
    /// ⚠️ CRITICAL: Controller structure that MUST be followed
    /// - Always extend XOSBaseController (provides ClientID, SiteID, GetRequestInfo())
    /// - Always use [HttpPost] for 95% of endpoints
    /// - Always return domain types directly (not IActionResult)
    /// - Always use [FromBody] for complex parameters
    /// </summary>
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]  // ⚠️ CRITICAL: Always require authorization unless specifically public
    public class [EntityName]Controller : XOSBaseController
    {
        #region Service Dependencies
        
        private I[EntityName]Service serviceManager;
        
        #endregion
        
        #region Constructor
        
        /// <summary>
        /// ⚠️ CRITICAL: Constructor pattern - inject service dependency
        /// </summary>
        public [EntityName]Controller(I[EntityName]Service serviceManager)
        {
            this.serviceManager = serviceManager;
        }
        
        #endregion
        
        #region CRUD Endpoints
        
        // ===== SECTION 1: BASIC CRUD OPERATIONS =====
        // Lines 30-200: Standard Create, Read, Update, Delete operations
        
        /// <summary>
        /// ⚠️ CRITICAL: GET operation using POST method (XOS convention)
        /// Returns single entity by ID
        /// </summary>
        [HttpPost("Get")]
        public async Task<[EntityName]> GetAsync([FromBody] GetByIdRequest request)
        {
            return await this.serviceManager.GetByIdAsync(request.Id, this.ClientID);
        }
        
        /// <summary>
        /// ⚠️ CRITICAL: GET LIST operation using POST method
        /// Returns paginated list with filtering
        /// </summary>
        [HttpPost("GetList")]
        public async Task<PagedResult<[EntityName]>> GetListAsync([FromBody] SearchRequest request)
        {
            var items = await this.serviceManager.GetListAsync(new SearchParams
            {
                SearchTerm = request.SearchTerm,
                CategoryId = request.CategoryId,
                StatusId = request.StatusId,
                IsActive = request.IsActive,
                SortField = request.SortField,
                SortDirection = request.SortDirection,
                Page = request.Page,
                PageSize = request.PageSize
            }, this.GetRequestInfo());
            
            // Get total count for pagination
            var totalCount = await this.serviceManager.GetCountAsync(new SearchParams
            {
                SearchTerm = request.SearchTerm,
                CategoryId = request.CategoryId,
                StatusId = request.StatusId,
                IsActive = request.IsActive
            }, this.GetRequestInfo());
            
            return new PagedResult<[EntityName]>
            {
                Data = items,
                TotalRecords = totalCount,
                Page = request.Page,
                PageSize = request.PageSize,
                TotalPages = (int)Math.Ceiling((double)totalCount / request.PageSize)
            };
        }
        
        /// <summary>
        /// ⚠️ CRITICAL: SAVE operation (handles both INSERT and UPDATE)
        /// Returns success indicator ("S" or "F")
        /// </summary>
        [HttpPost("Save")]
        public async Task<SaveResult> SaveAsync([FromBody] [EntityName] input)
        {
            try
            {
                var result = await this.serviceManager.SaveAsync(input, this.GetRequestInfo());
                
                return new SaveResult
                {
                    Success = result == "S",
                    Message = result == "S" ? "Saved successfully" : "Save failed",
                    Data = result == "S" ? input : null
                };
            }
            catch (Exception ex)
            {
                this.Logger?.LogError(ex, "Save failed for [EntityName] {ID}", input.ID);
                
                return new SaveResult
                {
                    Success = false,
                    Message = ex.Message,
                    Data = null
                };
            }
        }
        
        /// <summary>
        /// ⚠️ CRITICAL: DELETE operation using POST method
        /// Returns success indicator
        /// </summary>
        [HttpPost("Delete")]
        public async Task<DeleteResult> DeleteAsync([FromBody] DeleteRequest request)
        {
            try
            {
                var success = await this.serviceManager.DeleteAsync(request.Id, this.GetRequestInfo());
                
                return new DeleteResult
                {
                    Success = success,
                    Message = success ? "Deleted successfully" : "Delete failed"
                };
            }
            catch (Exception ex)
            {
                this.Logger?.LogError(ex, "Delete failed for [EntityName] {ID}", request.Id);
                
                return new DeleteResult
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }
        
        // ===== SECTION 2: LOOKUP DATA ENDPOINTS =====
        // Lines 200-300: Loading dropdown data and reference information
        
        /// <summary>
        /// Load all dropdown data for forms
        /// </summary>
        [HttpPost("LoadData")]
        public async Task<[EntityName].LoadData> LoadDataAsync()
        {
            return await this.serviceManager.LoadDataAsync(this.ClientID);
        }
        
        /// <summary>
        /// Get categories for dropdown
        /// </summary>
        [HttpPost("GetCategories")]
        public async Task<List<LookupItem>> GetCategoriesAsync([FromBody] LookupRequest request)
        {
            return await this.serviceManager.GetCategoriesAsync(this.ClientID, request.ActiveOnly);
        }
        
        /// <summary>
        /// Get statuses for dropdown
        /// </summary>
        [HttpPost("GetStatuses")]
        public async Task<List<LookupItem>> GetStatusesAsync([FromBody] LookupRequest request)
        {
            return await this.serviceManager.GetStatusesAsync(this.ClientID, request.ActiveOnly);
        }
        
        /// <summary>
        /// Get roles for dropdown
        /// </summary>
        [HttpPost("GetRoles")]
        public async Task<List<LookupItem>> GetRolesAsync([FromBody] LookupRequest request)
        {
            return await this.serviceManager.GetRolesAsync(this.ClientID, request.ActiveOnly);
        }
        
        // ===== SECTION 3: SEARCH AND FILTER ENDPOINTS =====
        // Lines 300-400: Advanced search and filtering operations
        
        /// <summary>
        /// Advanced search with multiple criteria
        /// </summary>
        [HttpPost("Search")]
        public async Task<SearchResult<[EntityName]>> SearchAsync([FromBody] AdvancedSearchRequest request)
        {
            var items = await this.serviceManager.SearchAsync(new AdvancedSearchParams
            {
                SearchTerm = request.SearchTerm,
                CategoryIds = request.CategoryIds,
                StatusIds = request.StatusIds,
                DateFrom = request.DateFrom,
                DateTo = request.DateTo,
                IsActive = request.IsActive,
                CustomFilters = request.CustomFilters,
                SortField = request.SortField,
                SortDirection = request.SortDirection,
                Page = request.Page,
                PageSize = request.PageSize
            }, this.GetRequestInfo());
            
            var totalCount = await this.serviceManager.GetSearchCountAsync(new AdvancedSearchParams
            {
                SearchTerm = request.SearchTerm,
                CategoryIds = request.CategoryIds,
                StatusIds = request.StatusIds,
                DateFrom = request.DateFrom,
                DateTo = request.DateTo,
                IsActive = request.IsActive,
                CustomFilters = request.CustomFilters
            }, this.GetRequestInfo());
            
            return new SearchResult<[EntityName]>
            {
                Results = items,
                TotalCount = totalCount,
                SearchTerm = request.SearchTerm,
                Page = request.Page,
                PageSize = request.PageSize
            };
        }
        
        /// <summary>
        /// Quick search for autocomplete
        /// </summary>
        [HttpPost("QuickSearch")]
        public async Task<List<QuickSearchResult>> QuickSearchAsync([FromBody] QuickSearchRequest request)
        {
            return await this.serviceManager.QuickSearchAsync(request.Term, request.MaxResults, this.ClientID);
        }
        
        // ===== SECTION 4: BULK OPERATIONS =====
        // Lines 400-500: Batch operations for multiple records
        
        /// <summary>
        /// Bulk update status for multiple entities
        /// </summary>
        [HttpPost("BulkUpdateStatus")]
        public async Task<BulkOperationResult> BulkUpdateStatusAsync([FromBody] BulkUpdateStatusRequest request)
        {
            try
            {
                var success = await this.serviceManager.BulkUpdateStatusAsync(
                    request.EntityIds, 
                    request.NewStatusId, 
                    this.GetRequestInfo()
                );
                
                return new BulkOperationResult
                {
                    Success = success,
                    Message = success ? $"Updated {request.EntityIds.Count} records" : "Bulk update failed",
                    ProcessedCount = success ? request.EntityIds.Count : 0
                };
            }
            catch (Exception ex)
            {
                this.Logger?.LogError(ex, "Bulk update status failed");
                
                return new BulkOperationResult
                {
                    Success = false,
                    Message = ex.Message,
                    ProcessedCount = 0
                };
            }
        }
        
        /// <summary>
        /// Bulk delete multiple entities
        /// </summary>
        [HttpPost("BulkDelete")]
        public async Task<BulkOperationResult> BulkDeleteAsync([FromBody] BulkDeleteRequest request)
        {
            try
            {
                var result = await this.serviceManager.BulkDeleteAsync(request.EntityIds, this.GetRequestInfo());
                
                return new BulkOperationResult
                {
                    Success = result.Success,
                    Message = result.Message,
                    ProcessedCount = result.ProcessedCount,
                    FailedIds = result.FailedIds
                };
            }
            catch (Exception ex)
            {
                this.Logger?.LogError(ex, "Bulk delete failed");
                
                return new BulkOperationResult
                {
                    Success = false,
                    Message = ex.Message,
                    ProcessedCount = 0
                };
            }
        }
        
        // ===== SECTION 5: FILE OPERATIONS =====
        // Lines 500-600: File upload and download operations
        
        /// <summary>
        /// ⚠️ CRITICAL: File upload endpoint pattern
        /// Handles multiple files with validation
        /// </summary>
        [HttpPost("UploadFiles")]
        [DisableRequestSizeLimit]  // For large file uploads
        public async Task<FileUploadResult> UploadFilesAsync([FromForm] FileUploadRequest request)
        {
            try
            {
                // Validate files
                if (request.Files == null || !request.Files.Any())
                {
                    return new FileUploadResult
                    {
                        Success = false,
                        Message = "No files provided"
                    };
                }
                
                // Validate file types and sizes
                var allowedTypes = new[] { ".pdf", ".doc", ".docx", ".jpg", ".png", ".gif" };
                var maxFileSize = 10 * 1024 * 1024; // 10MB
                
                foreach (var file in request.Files)
                {
                    var extension = Path.GetExtension(file.FileName).ToLower();
                    if (!allowedTypes.Contains(extension))
                    {
                        return new FileUploadResult
                        {
                            Success = false,
                            Message = $"File type {extension} is not allowed"
                        };
                    }
                    
                    if (file.Length > maxFileSize)
                    {
                        return new FileUploadResult
                        {
                            Success = false,
                            Message = $"File {file.FileName} is too large (max 10MB)"
                        };
                    }
                }
                
                var result = await this.serviceManager.SaveFilesAsync(
                    request.EntityId, 
                    request.Files, 
                    this.GetRequestInfo()
                );
                
                return new FileUploadResult
                {
                    Success = result.Success,
                    Message = result.Message,
                    UploadedFiles = result.FileDetails
                };
            }
            catch (Exception ex)
            {
                this.Logger?.LogError(ex, "File upload failed for entity {EntityId}", request.EntityId);
                
                return new FileUploadResult
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }
        
        /// <summary>
        /// Download file by ID
        /// </summary>
        [HttpPost("DownloadFile")]
        public async Task<IActionResult> DownloadFileAsync([FromBody] DownloadFileRequest request)
        {
            try
            {
                var fileInfo = await this.serviceManager.GetFileInfoAsync(request.FileId, this.ClientID);
                
                if (fileInfo == null)
                {
                    return NotFound("File not found");
                }
                
                var fileBytes = await this.serviceManager.GetFileContentAsync(request.FileId);
                
                return File(fileBytes, fileInfo.ContentType, fileInfo.FileName);
            }
            catch (Exception ex)
            {
                this.Logger?.LogError(ex, "File download failed for file {FileId}", request.FileId);
                return BadRequest(ex.Message);
            }
        }
        
        // ===== SECTION 6: REPORTING ENDPOINTS =====
        // Lines 600-700: Report generation and data export
        
        /// <summary>
        /// Generate report data
        /// </summary>
        [HttpPost("GetReportData")]
        public async Task<List<[EntityName]Report>> GetReportDataAsync([FromBody] ReportRequest request)
        {
            return await this.serviceManager.GetReportDataAsync(new ReportParams
            {
                DateFrom = request.DateFrom,
                DateTo = request.DateTo,
                CategoryIds = request.CategoryIds,
                StatusIds = request.StatusIds,
                IncludeInactive = request.IncludeInactive
            }, this.GetRequestInfo());
        }
        
        /// <summary>
        /// Export data to Excel
        /// </summary>
        [HttpPost("ExportToExcel")]
        public async Task<IActionResult> ExportToExcelAsync([FromBody] ExportRequest request)
        {
            try
            {
                var excelData = await this.serviceManager.ExportToExcelAsync(request.ExportParams, this.GetRequestInfo());
                
                return File(
                    excelData, 
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    $"[EntityName]_Export_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx"
                );
            }
            catch (Exception ex)
            {
                this.Logger?.LogError(ex, "Excel export failed");
                return BadRequest(ex.Message);
            }
        }
        
        /// <summary>
        /// Export data to PDF
        /// </summary>
        [HttpPost("ExportToPdf")]
        public async Task<IActionResult> ExportToPdfAsync([FromBody] ExportRequest request)
        {
            try
            {
                var pdfData = await this.serviceManager.ExportToPdfAsync(request.ExportParams, this.GetRequestInfo());
                
                return File(
                    pdfData, 
                    "application/pdf",
                    $"[EntityName]_Report_{DateTime.Now:yyyyMMdd_HHmmss}.pdf"
                );
            }
            catch (Exception ex)
            {
                this.Logger?.LogError(ex, "PDF export failed");
                return BadRequest(ex.Message);
            }
        }
        
        // ===== SECTION 7: VALIDATION ENDPOINTS =====
        // Lines 700-800: Data validation and business rule checking
        
        /// <summary>
        /// Validate entity data before save
        /// </summary>
        [HttpPost("Validate")]
        public async Task<ValidationResult> ValidateAsync([FromBody] [EntityName] input)
        {
            return await this.serviceManager.ValidateAsync(input, this.GetRequestInfo());
        }
        
        /// <summary>
        /// Check if name is unique
        /// </summary>
        [HttpPost("CheckNameUnique")]
        public async Task<UniqueCheckResult> CheckNameUniqueAsync([FromBody] UniqueCheckRequest request)
        {
            var isUnique = await this.serviceManager.IsNameUniqueAsync(
                request.Name, 
                request.ExcludeId, 
                this.ClientID
            );
            
            return new UniqueCheckResult
            {
                IsUnique = isUnique,
                Message = isUnique ? "Name is available" : "Name is already in use"
            };
        }
        
        /// <summary>
        /// Check if email is unique
        /// </summary>
        [HttpPost("CheckEmailUnique")]
        public async Task<UniqueCheckResult> CheckEmailUniqueAsync([FromBody] UniqueCheckRequest request)
        {
            var isUnique = await this.serviceManager.IsEmailUniqueAsync(
                request.Value, 
                request.ExcludeId, 
                this.ClientID
            );
            
            return new UniqueCheckResult
            {
                IsUnique = isUnique,
                Message = isUnique ? "Email is available" : "Email is already in use"
            };
        }
        
        // ===== SECTION 8: SPECIAL OPERATIONS =====
        // Lines 800-900: Custom business operations
        
        /// <summary>
        /// Clone entity with new name
        /// </summary>
        [HttpPost("Clone")]
        public async Task<SaveResult> CloneAsync([FromBody] CloneRequest request)
        {
            try
            {
                var clonedEntity = await this.serviceManager.CloneAsync(
                    request.SourceId, 
                    request.NewName, 
                    this.GetRequestInfo()
                );
                
                return new SaveResult
                {
                    Success = clonedEntity != null,
                    Message = clonedEntity != null ? "Cloned successfully" : "Clone failed",
                    Data = clonedEntity
                };
            }
            catch (Exception ex)
            {
                this.Logger?.LogError(ex, "Clone failed for [EntityName] {ID}", request.SourceId);
                
                return new SaveResult
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }
        
        /// <summary>
        /// Toggle active status
        /// </summary>
        [HttpPost("ToggleActive")]
        public async Task<ToggleResult> ToggleActiveAsync([FromBody] ToggleActiveRequest request)
        {
            try
            {
                var result = await this.serviceManager.ToggleActiveAsync(request.Id, this.GetRequestInfo());
                
                return new ToggleResult
                {
                    Success = result.Success,
                    NewStatus = result.NewStatus,
                    Message = result.Message
                };
            }
            catch (Exception ex)
            {
                this.Logger?.LogError(ex, "Toggle active failed for [EntityName] {ID}", request.Id);
                
                return new ToggleResult
                {
                    Success = false,
                    Message = ex.Message
                };
            }
        }
        
        #endregion
        
        #region Public Endpoints (No Authorization)
        
        // ===== SECTION 9: PUBLIC ENDPOINTS =====
        // Lines 900-950: Endpoints that don't require authentication
        
        /// <summary>
        /// Get public list (no authorization required)
        /// </summary>
        [HttpPost("GetPublicList")]
        [AllowAnonymous]
        public async Task<List<PublicEntityInfo>> GetPublicListAsync([FromBody] PublicListRequest request)
        {
            return await this.serviceManager.GetPublicListAsync(request.CategoryId);
        }
        
        #endregion
        
        #region Cleanup
        
        /// <summary>
        /// ⚠️ CRITICAL: Dispose pattern for proper resource cleanup
        /// </summary>
        protected override void OnDispose()
        {
            if (this.serviceManager != null)
            {
                this.serviceManager.Dispose();
                this.serviceManager = null;
            }
        }
        
        #endregion
    }
}

// ===== REQUEST/RESPONSE MODELS =====

#region Request Models

public class GetByIdRequest
{
    public int Id { get; set; }
}

public class SearchRequest
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

public class DeleteRequest
{
    public int Id { get; set; }
    public string Reason { get; set; }
}

public class LookupRequest
{
    public bool ActiveOnly { get; set; } = true;
}

public class AdvancedSearchRequest
{
    public string SearchTerm { get; set; }
    public List<int> CategoryIds { get; set; }
    public List<int> StatusIds { get; set; }
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public bool? IsActive { get; set; }
    public Dictionary<string, object> CustomFilters { get; set; }
    public string SortField { get; set; }
    public string SortDirection { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 10;
}

public class QuickSearchRequest
{
    public string Term { get; set; }
    public int MaxResults { get; set; } = 10;
}

public class BulkUpdateStatusRequest
{
    public List<int> EntityIds { get; set; }
    public int NewStatusId { get; set; }
}

public class BulkDeleteRequest
{
    public List<int> EntityIds { get; set; }
    public string Reason { get; set; }
}

public class FileUploadRequest
{
    public int EntityId { get; set; }
    public List<IFormFile> Files { get; set; }
    public string Category { get; set; }
}

public class DownloadFileRequest
{
    public int FileId { get; set; }
}

public class ReportRequest
{
    public DateTime? DateFrom { get; set; }
    public DateTime? DateTo { get; set; }
    public List<int> CategoryIds { get; set; }
    public List<int> StatusIds { get; set; }
    public bool IncludeInactive { get; set; }
}

public class ExportRequest
{
    public ExportParams ExportParams { get; set; }
}

public class UniqueCheckRequest
{
    public string Name { get; set; }
    public string Value { get; set; }
    public int? ExcludeId { get; set; }
}

public class CloneRequest
{
    public int SourceId { get; set; }
    public string NewName { get; set; }
}

public class ToggleActiveRequest
{
    public int Id { get; set; }
}

public class PublicListRequest
{
    public int? CategoryId { get; set; }
}

#endregion

#region Response Models

public class PagedResult<T>
{
    public List<T> Data { get; set; }
    public int TotalRecords { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
    public int TotalPages { get; set; }
}

public class SaveResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public object Data { get; set; }
}

public class DeleteResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
}

public class SearchResult<T>
{
    public List<T> Results { get; set; }
    public int TotalCount { get; set; }
    public string SearchTerm { get; set; }
    public int Page { get; set; }
    public int PageSize { get; set; }
}

public class QuickSearchResult
{
    public int Id { get; set; }
    public string Text { get; set; }
    public string Category { get; set; }
}

public class BulkOperationResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public int ProcessedCount { get; set; }
    public List<int> FailedIds { get; set; }
}

public class FileUploadResult
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public List<FileDetail> UploadedFiles { get; set; }
}

public class ValidationResult
{
    public bool IsValid { get; set; }
    public Dictionary<string, string> Errors { get; set; }
}

public class UniqueCheckResult
{
    public bool IsUnique { get; set; }
    public string Message { get; set; }
}

public class ToggleResult
{
    public bool Success { get; set; }
    public bool NewStatus { get; set; }
    public string Message { get; set; }
}

#endregion

// ===== USAGE NOTES =====
/*
⚠️ CRITICAL PATTERNS TO NEVER CHANGE:
1. Always extend XOSBaseController
2. Always use [HttpPost] for 95% of endpoints  
3. Always use [FromBody] for complex parameters
4. Always return domain types directly (not IActionResult)
5. Always require authorization unless specifically public
6. Always dispose service in OnDispose()

✅ CUSTOMIZATION POINTS:
1. Replace [EntityName] with your entity name
2. Add custom endpoints for business operations
3. Modify request/response models for your data
4. Add custom validation endpoints
5. Implement file operations if needed
6. Add reporting endpoints

💡 PERFORMANCE TIPS:
1. Use pagination for large datasets
2. Implement caching for lookup data
3. Use bulk operations for multiple records
4. Validate file uploads before processing
5. Use async/await throughout

🛡️ SECURITY CONSIDERATIONS:
1. Always validate input parameters
2. Use proper authorization attributes
3. Validate file uploads thoroughly
4. Log all operations for audit
5. Handle exceptions gracefully

🔥 OPTIMIZATION NOTES:
1. Return only necessary data in responses
2. Use compression for large responses
3. Implement proper error handling
4. Use structured logging
5. Monitor endpoint performance
*/