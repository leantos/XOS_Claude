# 📦 Common Module Examples - Ready-to-Use Claude Prompts

## 🔐 User Authentication Module

### Complete Prompt
```
"Create a User Authentication module:

REQUIREMENTS:
- Login form with username/password
- Remember me checkbox
- Forgot password link
- Session management
- Logout functionality
- Password validation (min 8 chars, 1 number, 1 special)

BACKEND:
- AuthenticationService with Login/Logout methods
- JWT token generation
- Password hashing with BCrypt
- Session storage in PostgreSQL
- Rate limiting for failed attempts

FRONTEND:
- UserLogin component with XOS MVVM
- Password field with show/hide toggle
- Loading state during authentication
- Error messages for invalid credentials
- Redirect to dashboard on success

Follow @claude_docs/CRITICAL_PATTERNS.md
Use @claude_docs/frontend/xos-input-handling-fix.md for inputs
Ensure all inputs accept keyboard input with three-step handler"
```

---

## 👥 User Management Module

### Complete Prompt
```
"Create a User Management module:

ENTITY FIELDS:
- UserID (int, auto-increment)
- Username (string, unique, required)
- Email (string, unique, required)
- FirstName (string)
- LastName (string)
- Role (dropdown from roles table)
- IsActive (boolean)
- CreatedDate (datetime)
- ModifiedDate (datetime)

FEATURES:
- List users in XOSGrid with search/filter
- Add new user with validation
- Edit user (modal form)
- Delete with confirmation
- Bulk activate/deactivate
- Export to Excel

BACKEND:
- UserService with CRUD + BulkUpdate
- RoleService to fetch roles
- Validation for unique username/email
- Audit trail for changes

FRONTEND:
- UserList with XOSGrid
- UserForm for add/edit
- Confirmation dialogs
- Success/error notifications

Use patterns from @claude_docs/
Follow @claude_docs/development-guide/TDD-XOS-FRONTEND-WORKFLOW.md
Target 80% test coverage"
```

---

## 📦 Product Catalog Module

### Complete Prompt
```
"Create a Product Catalog module:

PRODUCT ENTITY:
- ProductID (int)
- SKU (string, unique)
- Name (string, required)
- Description (text)
- Category (foreign key)
- Price (decimal)
- Cost (decimal)
- StockQuantity (int)
- Images (array of URLs)
- IsActive (boolean)

CATEGORY ENTITY:
- CategoryID (int)
- Name (string)
- ParentCategoryID (nullable)
- DisplayOrder (int)

FEATURES:
- Product grid with thumbnail images
- Advanced search (name, SKU, category)
- Price range filter
- Add/Edit product with image upload
- Category tree view
- Stock management
- Bulk import from CSV

BACKEND:
- ProductService with search, filter
- CategoryService with hierarchy
- Image upload to storage
- CSV import processor

FRONTEND:
- ProductList with image grid
- ProductForm with image uploader
- CategoryTree component
- Import wizard

Follow XOS patterns from @claude_docs/
Ensure inputs work with @claude_docs/frontend/xos-input-handling-fix.md"
```

---

## 📊 Dashboard Module

### Complete Prompt
```
"Create a Dashboard module:

REQUIREMENTS:
- Summary cards (Users, Orders, Revenue, etc.)
- Charts (Line, Bar, Pie)
- Recent activities list
- Quick actions menu
- Real-time updates via SignalR

BACKEND:
- DashboardService with aggregation queries
- Metrics calculation methods
- SignalR hub for real-time data
- Caching for performance

FRONTEND:
- Dashboard component with grid layout
- Chart components (use recharts)
- Activity feed with auto-refresh
- Responsive design with Bootstrap

DATA POINTS:
- Total users (active/inactive)
- Orders (today/week/month)
- Revenue trends
- Top products
- System health metrics

Follow @claude_docs/CRITICAL_PATTERNS.md
Use Utils.ajax for API calls
Implement SignalR pattern from @claude_docs/backend/"
```

---

## 📄 Report Generator Module

### Complete Prompt
```
"Create a Report Generator module:

REPORT TYPES:
- Sales Report (date range, product, customer)
- Inventory Report (stock levels, movements)
- User Activity Report (logins, actions)
- Financial Summary (revenue, expenses)

FEATURES:
- Parameter selection UI
- Date range picker
- Multi-select filters
- Report preview
- Export (PDF, Excel, CSV)
- Schedule reports
- Email delivery

BACKEND:
- ReportService with query builders
- ReportTemplateService
- ExportService (PDF/Excel generation)
- SchedulerService for automated reports
- EmailService for delivery

FRONTEND:
- ReportParameters component
- ReportViewer with print preview
- ScheduleForm for automation
- ReportHistory list

Use @claude_docs/frontend/ui-templates/ReportParameterTemplate
Follow XOS MVVM pattern
Ensure date pickers work properly"
```

---

## 🔔 Notification System Module

### Complete Prompt
```
"Create a Notification System module:

NOTIFICATION ENTITY:
- NotificationID (int)
- UserID (int)
- Type (enum: Info, Warning, Error, Success)
- Title (string)
- Message (text)
- IsRead (boolean)
- CreatedDate (datetime)
- ReadDate (nullable datetime)

FEATURES:
- Real-time notifications via SignalR
- Toast popups for new notifications
- Notification center dropdown
- Mark as read/unread
- Clear all notifications
- Notification preferences

BACKEND:
- NotificationService with CRUD
- SignalR hub for push notifications
- NotificationPreferenceService
- Batch operations (mark all read)

FRONTEND:
- NotificationBell icon with badge
- NotificationDropdown component
- ToastNotification component
- NotificationSettings form

Implement SignalR from @claude_docs/backend/
Use XOS patterns for frontend
Handle real-time updates properly"
```

---

## 🛒 Shopping Cart Module

### Complete Prompt
```
"Create a Shopping Cart module:

CART ENTITY:
- CartID (int)
- UserID (int)
- Items (array of CartItem)
- Total (calculated)
- CreatedDate
- ModifiedDate

CARTITEM ENTITY:
- ProductID (int)
- Quantity (int)
- Price (decimal)
- Subtotal (calculated)

FEATURES:
- Add to cart (with animation)
- Update quantities
- Remove items
- Apply coupon codes
- Calculate shipping
- Persist cart for logged-in users
- Guest cart with session storage

BACKEND:
- CartService with add/update/remove
- PricingService for calculations
- CouponService for discounts
- Session management for guest carts

FRONTEND:
- CartIcon with item count
- CartDrawer slide-out panel
- CartItem components
- CheckoutButton with validation

Follow @claude_docs/CRITICAL_PATTERNS.md
Use XOS state management patterns
Ensure smooth UI updates with updateUI()"
```

---

## 📝 Form Builder Module

### Complete Prompt
```
"Create a Form Builder module:

REQUIREMENTS:
- Drag-drop form designer
- Field types (text, number, date, dropdown, checkbox, radio)
- Field validation rules
- Conditional logic
- Form preview
- Save form templates
- Generate form from template

FORM ENTITY:
- FormID (int)
- Name (string)
- Description (text)
- Fields (JSON)
- ValidationRules (JSON)
- IsActive (boolean)

BACKEND:
- FormService with CRUD
- FormValidationService
- FormSubmissionService
- FormTemplateService

FRONTEND:
- FormDesigner with drag-drop
- FieldPalette component
- PropertyPanel for field config
- FormPreview component
- FormRenderer for display

Use XOS components for form fields
Follow @claude_docs/frontend/xos-components-reference.md
Ensure all generated forms work with keyboard"
```

---

## 📊 Data Import/Export Module

### Complete Prompt
```
"Create a Data Import/Export module:

FEATURES:
- Import CSV/Excel files
- Column mapping UI
- Data validation
- Error reporting
- Progress tracking
- Export to CSV/Excel/PDF
- Template generation
- Scheduled exports

BACKEND:
- ImportService with file parsing
- ValidationService for data checks
- MappingService for column matching
- ExportService with formatters
- JobService for background processing

FRONTEND:
- ImportWizard (upload, map, validate, import)
- ExportDialog with options
- ProgressBar component
- ErrorReport component
- TemplateManager

Handle large files with streaming
Use background jobs for processing
Follow @claude_docs/backend/backend-blueprint.md"
```

---

## 🔍 Search Module with Filters

### Complete Prompt
```
"Create an Advanced Search module:

REQUIREMENTS:
- Global search bar
- Multi-field search
- Filter sidebar
- Search suggestions
- Recent searches
- Save search criteria
- Search results with highlighting

BACKEND:
- SearchService with full-text search
- FilterService for dynamic filters
- SearchHistoryService
- SavedSearchService
- PostgreSQL full-text search

FRONTEND:
- SearchBar with autocomplete
- FilterPanel with dynamic controls
- SearchResults with pagination
- SavedSearches dropdown

Use @claude_docs/frontend/ui-templates/SearchListGridTemplate
Implement debouncing for search input
Follow XOS patterns for state management"
```

---

## 💬 Comments/Notes Module

### Complete Prompt
```
"Create a Comments/Notes module:

COMMENT ENTITY:
- CommentID (int)
- EntityType (string)
- EntityID (int)
- UserID (int)
- Text (text)
- ParentCommentID (nullable, for replies)
- CreatedDate
- ModifiedDate
- IsDeleted (soft delete)

FEATURES:
- Add comment to any entity
- Reply to comments (threaded)
- Edit own comments
- Delete with confirmation
- @mention users
- Rich text editor
- Attachments

BACKEND:
- CommentService with CRUD
- Generic entity attachment
- Notification on mention
- Soft delete implementation

FRONTEND:
- CommentList component
- CommentForm with rich editor
- ReplyForm inline
- MentionAutocomplete

Use XOS patterns from @claude_docs/
Implement real-time updates via SignalR"
```

---

## 📋 How to Use These Examples

1. **Copy the relevant prompt** for your module type
2. **Customize the requirements** to match your needs
3. **Add any specific business rules** unique to your application
4. **Tell Claude to start** with: "I'm working with XOS framework. [Paste prompt]"
5. **Reference documentation** if Claude needs clarification

## 🎯 Tips for Success

- Always mention XOS framework first
- Specify that inputs must accept keyboard input
- Request 80% test coverage
- Ask for both backend and frontend if needed
- Be specific about field types and validation rules
- Include UI/UX requirements (modals, notifications, etc.)

---

*These examples cover the most common module types. Customize them for your specific needs!*