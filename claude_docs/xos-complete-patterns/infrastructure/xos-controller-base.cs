// ===== XOS CONTROLLER BASE COMPLETE PATTERNS =====
// This file contains EVERY controller pattern for XOS Framework
// Follow XOSControllerBase inheritance and action patterns EXACTLY

using CVS.Transaction.Core;
using CVS.Transaction.Domain;
using CVS.Transaction.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System.Text;
using XOS.Data;

namespace CVS.Transaction.Controllers
{
    // ===== SECTION 1: BASIC CONTROLLER PATTERNS =====
    
    /// <summary>
    /// ⚠️ CRITICAL: Every controller MUST follow this pattern
    /// - Always extend XOSControllerBase
    /// - Always inject IServiceProvider and ILogger
    /// - Always call base constructor
    /// - Use GetService<T> for dependency injection
    /// - Return proper ActionResult types
    /// </summary>
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class [EntityName]Controller : XOSControllerBase
    {
        #region Fields
        
        private readonly I[EntityName]Service _service;
        
        #endregion
        
        #region Constructor
        
        /// <summary>
        /// ⚠️ CRITICAL: Constructor pattern - NEVER change this
        /// </summary>
        public [EntityName]Controller(IServiceProvider serviceProvider, ILogger<[EntityName]Controller> logger) 
            : base(serviceProvider, logger)
        {
            _service = GetService<I[EntityName]Service>();
        }
        
        #endregion
        
        #region GET Endpoints
        
        /// <summary>
        /// ✅ CORRECT: GET all records with pagination
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<PagedResult<[EntityName]>>> GetAllAsync([FromQuery] SearchParameters searchParams)
        {
            try
            {
                var loginInfo = GetLoginInfo();
                var result = await _service.GetAllAsync(searchParams, loginInfo);
                
                return Ok(new ApiResponse<PagedResult<[EntityName]>>
                {
                    Success = true,
                    Data = result,
                    Message = "Records retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in GetAllAsync");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving records"
                });
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: GET single record by ID
        /// </summary>
        [HttpGet("{id:int}")]
        public async Task<ActionResult<[EntityName]>> GetByIdAsync(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Invalid ID provided"
                    });
                }
                
                var loginInfo = GetLoginInfo();
                var result = await _service.GetByIdAsync(id, loginInfo.ClientID);
                
                if (result == null)
                {
                    return NotFound(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Record not found"
                    });
                }
                
                return Ok(new ApiResponse<[EntityName]>
                {
                    Success = true,
                    Data = result,
                    Message = "Record retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in GetByIdAsync for ID: {Id}", id);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving the record"
                });
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: GET lookup data for dropdowns
        /// </summary>
        [HttpGet("lookup")]
        public async Task<ActionResult<List<LookupItem>>> GetLookupDataAsync()
        {
            try
            {
                var loginInfo = GetLoginInfo();
                var result = await _service.GetLookupDataAsync(loginInfo.ClientID);
                
                return Ok(new ApiResponse<List<LookupItem>>
                {
                    Success = true,
                    Data = result,
                    Message = "Lookup data retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in GetLookupDataAsync");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving lookup data"
                });
            }
        }
        
        #endregion
        
        #region POST Endpoints
        
        /// <summary>
        /// ✅ CORRECT: POST create new record
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<string>> CreateAsync([FromBody] [EntityName] model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = errors
                    });
                }
                
                model.IsEdit = false;
                var loginInfo = GetLoginInfo();
                var result = await _service.SaveAsync(model, loginInfo);
                
                if (result == "S")
                {
                    return Ok(new ApiResponse<string>
                    {
                        Success = true,
                        Data = result,
                        Message = "Record created successfully"
                    });
                }
                else
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        Data = result,
                        Message = "Failed to create record"
                    });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in CreateAsync");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while creating the record"
                });
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: POST bulk operations
        /// </summary>
        [HttpPost("bulk")]
        public async Task<ActionResult<string>> BulkOperationAsync([FromBody] BulkOperationRequest<[EntityName]> request)
        {
            try
            {
                if (request?.Items == null || !request.Items.Any())
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "No items provided for bulk operation"
                    });
                }
                
                var loginInfo = GetLoginInfo();
                var result = await _service.BulkOperationAsync(request, loginInfo);
                
                if (result == "S")
                {
                    return Ok(new ApiResponse<string>
                    {
                        Success = true,
                        Data = result,
                        Message = $"Bulk operation completed for {request.Items.Count} items"
                    });
                }
                else
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        Data = result,
                        Message = "Bulk operation failed"
                    });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in BulkOperationAsync");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred during bulk operation"
                });
            }
        }
        
        #endregion
        
        #region PUT Endpoints
        
        /// <summary>
        /// ✅ CORRECT: PUT update existing record
        /// </summary>
        [HttpPut("{id:int}")]
        public async Task<ActionResult<string>> UpdateAsync(int id, [FromBody] [EntityName] model)
        {
            try
            {
                if (id <= 0 || model?.ID != id)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Invalid ID or ID mismatch"
                    });
                }
                
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Validation failed",
                        Errors = errors
                    });
                }
                
                model.IsEdit = true;
                var loginInfo = GetLoginInfo();
                var result = await _service.SaveAsync(model, loginInfo);
                
                if (result == "S")
                {
                    return Ok(new ApiResponse<string>
                    {
                        Success = true,
                        Data = result,
                        Message = "Record updated successfully"
                    });
                }
                else
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        Data = result,
                        Message = "Failed to update record"
                    });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in UpdateAsync for ID: {Id}", id);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while updating the record"
                });
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: PUT partial update (PATCH-like behavior)
        /// </summary>
        [HttpPut("{id:int}/status")]
        public async Task<ActionResult<string>> UpdateStatusAsync(int id, [FromBody] StatusUpdateRequest request)
        {
            try
            {
                if (id <= 0 || request == null)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Invalid parameters"
                    });
                }
                
                var loginInfo = GetLoginInfo();
                var result = await _service.UpdateStatusAsync(id, request.Status, request.Reason, loginInfo);
                
                if (result == "S")
                {
                    return Ok(new ApiResponse<string>
                    {
                        Success = true,
                        Data = result,
                        Message = "Status updated successfully"
                    });
                }
                else
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        Data = result,
                        Message = "Failed to update status"
                    });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in UpdateStatusAsync for ID: {Id}", id);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while updating status"
                });
            }
        }
        
        #endregion
        
        #region DELETE Endpoints
        
        /// <summary>
        /// ✅ CORRECT: DELETE soft delete (recommended)
        /// </summary>
        [HttpDelete("{id:int}")]
        public async Task<ActionResult<string>> SoftDeleteAsync(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Invalid ID provided"
                    });
                }
                
                var loginInfo = GetLoginInfo();
                var result = await _service.SoftDeleteAsync(id, loginInfo);
                
                if (result == "S")
                {
                    return Ok(new ApiResponse<string>
                    {
                        Success = true,
                        Data = result,
                        Message = "Record deleted successfully"
                    });
                }
                else
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        Data = result,
                        Message = "Failed to delete record"
                    });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in SoftDeleteAsync for ID: {Id}", id);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while deleting the record"
                });
            }
        }
        
        /// <summary>
        /// ⚠️ CRITICAL: Hard delete - use with extreme caution
        /// Only use for test data or when absolutely necessary
        /// </summary>
        [HttpDelete("{id:int}/permanent")]
        [Authorize(Roles = "Admin,SuperUser")]
        public async Task<ActionResult<string>> HardDeleteAsync(int id)
        {
            try
            {
                if (id <= 0)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Invalid ID provided"
                    });
                }
                
                var loginInfo = GetLoginInfo();
                var result = await _service.HardDeleteAsync(id, loginInfo);
                
                if (result == "S")
                {
                    return Ok(new ApiResponse<string>
                    {
                        Success = true,
                        Data = result,
                        Message = "Record permanently deleted"
                    });
                }
                else
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        Data = result,
                        Message = "Failed to permanently delete record"
                    });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in HardDeleteAsync for ID: {Id}", id);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while permanently deleting the record"
                });
            }
        }
        
        #endregion
        
        // ===== SECTION 2: ADVANCED CONTROLLER PATTERNS =====
        
        #region File Operations
        
        /// <summary>
        /// ✅ CORRECT: File upload endpoint
        /// </summary>
        [HttpPost("{id:int}/upload")]
        public async Task<ActionResult<string>> UploadFileAsync(int id, IFormFile file)
        {
            try
            {
                if (id <= 0 || file == null || file.Length == 0)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Invalid parameters or no file provided"
                    });
                }
                
                // File validation
                var allowedExtensions = new[] { ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".jpg", ".jpeg", ".png" };
                var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
                
                if (!allowedExtensions.Contains(extension))
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "File type not allowed"
                    });
                }
                
                if (file.Length > 10 * 1024 * 1024) // 10MB limit
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "File size exceeds 10MB limit"
                    });
                }
                
                var loginInfo = GetLoginInfo();
                var result = await _service.UploadFileAsync(id, file, loginInfo);
                
                if (result == "S")
                {
                    return Ok(new ApiResponse<string>
                    {
                        Success = true,
                        Data = result,
                        Message = "File uploaded successfully"
                    });
                }
                else
                {
                    return BadRequest(new ApiResponse<string>
                    {
                        Success = false,
                        Data = result,
                        Message = "Failed to upload file"
                    });
                }
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in UploadFileAsync for ID: {Id}", id);
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while uploading the file"
                });
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: File download endpoint
        /// </summary>
        [HttpGet("{id:int}/download/{fileId:int}")]
        public async Task<ActionResult> DownloadFileAsync(int id, int fileId)
        {
            try
            {
                if (id <= 0 || fileId <= 0)
                {
                    return BadRequest("Invalid parameters");
                }
                
                var loginInfo = GetLoginInfo();
                var fileInfo = await _service.GetFileInfoAsync(id, fileId, loginInfo);
                
                if (fileInfo == null)
                {
                    return NotFound("File not found");
                }
                
                var fileBytes = await _service.GetFileContentAsync(fileId, loginInfo);
                
                return File(fileBytes, fileInfo.ContentType, fileInfo.FileName);
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in DownloadFileAsync for ID: {Id}, FileID: {FileId}", id, fileId);
                return StatusCode(500, "An error occurred while downloading the file");
            }
        }
        
        #endregion
        
        #region Export Operations
        
        /// <summary>
        /// ✅ CORRECT: Export to Excel
        /// </summary>
        [HttpGet("export/excel")]
        public async Task<ActionResult> ExportToExcelAsync([FromQuery] ExportParameters exportParams)
        {
            try
            {
                var loginInfo = GetLoginInfo();
                var excelData = await _service.ExportToExcelAsync(exportParams, loginInfo);
                
                return File(excelData, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
                    $"[EntityName]_Export_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx");
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in ExportToExcelAsync");
                return StatusCode(500, "An error occurred while exporting data");
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: Export to PDF
        /// </summary>
        [HttpGet("export/pdf")]
        public async Task<ActionResult> ExportToPdfAsync([FromQuery] ExportParameters exportParams)
        {
            try
            {
                var loginInfo = GetLoginInfo();
                var pdfData = await _service.ExportToPdfAsync(exportParams, loginInfo);
                
                return File(pdfData, "application/pdf", 
                    $"[EntityName]_Report_{DateTime.Now:yyyyMMdd_HHmmss}.pdf");
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in ExportToPdfAsync");
                return StatusCode(500, "An error occurred while generating PDF");
            }
        }
        
        #endregion
        
        #region Reporting Operations
        
        /// <summary>
        /// ✅ CORRECT: Generate reports
        /// </summary>
        [HttpPost("reports")]
        public async Task<ActionResult<ReportResult>> GenerateReportAsync([FromBody] ReportRequest request)
        {
            try
            {
                if (request == null)
                {
                    return BadRequest(new ApiResponse<object>
                    {
                        Success = false,
                        Message = "Report request is required"
                    });
                }
                
                var loginInfo = GetLoginInfo();
                var result = await _service.GenerateReportAsync(request, loginInfo);
                
                return Ok(new ApiResponse<ReportResult>
                {
                    Success = true,
                    Data = result,
                    Message = "Report generated successfully"
                });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in GenerateReportAsync");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while generating the report"
                });
            }
        }
        
        #endregion
        
        // ===== SECTION 3: AUTHORIZATION & SECURITY PATTERNS =====
        
        #region Security Patterns
        
        /// <summary>
        /// ✅ CORRECT: Role-based authorization
        /// </summary>
        [HttpGet("admin")]
        [Authorize(Roles = "Admin,SuperUser")]
        public async Task<ActionResult<List<[EntityName]>>> GetAdminDataAsync()
        {
            try
            {
                var loginInfo = GetLoginInfo();
                var result = await _service.GetAdminDataAsync(loginInfo);
                
                return Ok(new ApiResponse<List<[EntityName]>>
                {
                    Success = true,
                    Data = result,
                    Message = "Admin data retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in GetAdminDataAsync");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving admin data"
                });
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: Custom authorization attribute usage
        /// </summary>
        [HttpGet("sensitive")]
        [CustomAuthorize(Permission = "VIEW_SENSITIVE_DATA")]
        public async Task<ActionResult<List<[EntityName]>>> GetSensitiveDataAsync()
        {
            try
            {
                var loginInfo = GetLoginInfo();
                var result = await _service.GetSensitiveDataAsync(loginInfo);
                
                return Ok(new ApiResponse<List<[EntityName]>>
                {
                    Success = true,
                    Data = result,
                    Message = "Sensitive data retrieved successfully"
                });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in GetSensitiveDataAsync");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred while retrieving sensitive data"
                });
            }
        }
        
        #endregion
        
        // ===== SECTION 4: ERROR HANDLING & VALIDATION =====
        
        #region Error Handling Patterns
        
        /// <summary>
        /// ✅ CORRECT: Global exception handling pattern
        /// Use this pattern in all controller actions
        /// </summary>
        private ActionResult<T> HandleServiceResponse<T>(string serviceResult, T data, string successMessage, string failureMessage)
        {
            if (serviceResult == "S")
            {
                return Ok(new ApiResponse<T>
                {
                    Success = true,
                    Data = data,
                    Message = successMessage
                });
            }
            else
            {
                return BadRequest(new ApiResponse<T>
                {
                    Success = false,
                    Data = data,
                    Message = failureMessage
                });
            }
        }
        
        /// <summary>
        /// ✅ CORRECT: Model validation helper
        /// </summary>
        private ActionResult ValidateModel()
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState.Values
                    .SelectMany(v => v.Errors)
                    .Select(e => e.ErrorMessage)
                    .ToList();
                
                return BadRequest(new ApiResponse<object>
                {
                    Success = false,
                    Message = "Validation failed",
                    Errors = errors
                });
            }
            
            return null; // Model is valid
        }
        
        #endregion
        
        #region Validation Patterns
        
        /// <summary>
        /// ✅ CORRECT: Custom validation endpoint
        /// </summary>
        [HttpPost("validate")]
        public async Task<ActionResult<ValidationResult>> ValidateDataAsync([FromBody] [EntityName] model)
        {
            try
            {
                var validationErrors = ValidateModel();
                if (validationErrors != null) return validationErrors;
                
                var loginInfo = GetLoginInfo();
                var validationResult = await _service.ValidateAsync(model, loginInfo);
                
                return Ok(new ApiResponse<ValidationResult>
                {
                    Success = validationResult.IsValid,
                    Data = validationResult,
                    Message = validationResult.IsValid ? "Validation passed" : "Validation failed"
                });
            }
            catch (Exception ex)
            {
                Logger.LogError(ex, "Error in ValidateDataAsync");
                return StatusCode(500, new ApiResponse<object>
                {
                    Success = false,
                    Message = "An error occurred during validation"
                });
            }
        }
        
        #endregion
        
        // ===== SECTION 5: COMPLETE WORKING EXAMPLES =====
        
        /// <summary>
        /// ✅ COMPLETE EXAMPLE: Full CRUD controller with all patterns
        /// Copy this pattern for new controllers
        /// </summary>
        
        // Already implemented above in sections 1-4
        // This controller demonstrates:
        // - Proper inheritance from XOSControllerBase
        // - Constructor injection pattern
        // - All HTTP verbs (GET, POST, PUT, DELETE)
        // - Error handling and logging
        // - Model validation
        // - Authorization attributes
        // - File operations
        // - Export functionality
        // - Custom response formatting
        // - Bulk operations
        // - Status updates
        // - Security patterns
    }
    
    // ===== SUPPORTING CLASSES =====
    
    /// <summary>
    /// ✅ CORRECT: API Response wrapper
    /// </summary>
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public T Data { get; set; }
        public string Message { get; set; }
        public List<string> Errors { get; set; } = new List<string>();
    }
    
    /// <summary>
    /// ✅ CORRECT: Search parameters
    /// </summary>
    public class SearchParameters
    {
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SearchText { get; set; }
        public string SortBy { get; set; }
        public bool SortAscending { get; set; } = true;
        public Dictionary<string, object> Filters { get; set; } = new Dictionary<string, object>();
    }
    
    /// <summary>
    /// ✅ CORRECT: Paged result wrapper
    /// </summary>
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling((double)TotalCount / PageSize);
        public bool HasNextPage => Page < TotalPages;
        public bool HasPreviousPage => Page > 1;
    }
    
    /// <summary>
    /// ✅ CORRECT: Bulk operation request
    /// </summary>
    public class BulkOperationRequest<T>
    {
        public List<T> Items { get; set; } = new List<T>();
        public string Operation { get; set; } // "CREATE", "UPDATE", "DELETE"
        public Dictionary<string, object> Parameters { get; set; } = new Dictionary<string, object>();
    }
    
    /// <summary>
    /// ✅ CORRECT: Status update request
    /// </summary>
    public class StatusUpdateRequest
    {
        public string Status { get; set; }
        public string Reason { get; set; }
    }
}

// ❌ COMMON MISTAKES TO AVOID:
// 1. Not extending XOSControllerBase
// 2. Not using GetService<T> for dependency injection
// 3. Not handling exceptions properly
// 4. Not validating model state
// 5. Not using proper HTTP status codes
// 6. Not logging errors
// 7. Missing authorization attributes
// 8. Not using async/await consistently
// 9. Not disposing services properly
// 10. Not following naming conventions