# 🚨 CRITICAL PATTERNS - MUST READ FIRST

## ⚠️ This is NOT a Standard ASP.NET Core + React Application

Applications built with the **custom XOS enterprise framework** significantly modify standard patterns. Following standard React or ASP.NET Core patterns will cause errors.

## 🔴 XOS Component Implementation Checklist (100% ACCURACY)

### ✅ MUST DO - Complete this checklist for EVERY XOS component:

```bash
# 1. Install Dependencies (ONE TIME)
cd CVS_Claude.WebApi/UIPages
npm install react-color fast-sort --save

# 2. Copy Theme CSS (ONE TIME)
cp D:\Projects\CVS_Claude\assets\css\theme.css D:\Projects\CVS_Claude\CVS_Claude.WebApi\UIPages\src\theme.css
```

```javascript
// 3. Import Pattern (EVERY COMPONENT)
import * as cntrl from '../../xos-components';  // ✅ CORRECT
// NOT: import { XOSComponent } from '../../xos-components/XOSComponent.js';  ❌

// 4. Component Class (EVERY COMPONENT)
export class MyComponent extends cntrl.XOSComponent {  // ✅ CORRECT
    constructor(props) {
        super(props, new MyComponentVM(props));  // Pass VM to super
    }
}

// 5. ViewModel State Initialization (CRITICAL!)
export default class MyComponentVM extends VMBase {
    constructor(props) {
        super(props);
        this.init();
    }
    
    init() {
        // ⚠️ CRITICAL: Get reference to Data, then set properties!
        const model = this.Data;     // Get reference to _____state
        model.userName = '';         // ✅ CORRECT - Set on reference
        // this.Data = { userName: '' };  // ❌ ERROR: Cannot set Data
    }
}

// 6. Event Handlers (EVERY XOS INPUT) - MEMORIZE THIS PATTERN!
handleInputChange = (e) => {
    if (this.VM) {
        const model = this.VM.Data;  // Step 1: Get reference to _____state
        model[e.name] = e.value;     // Step 2: Modify property (e.value NOT e.target.value!)
        this.VM.updateUI();           // Step 3: Trigger re-render (NEVER FORGET THIS!)
    }
}

// 7. XOSTextbox Usage (EVERY TEXT INPUT)
<cntrl.XOSTextbox
    name="userName"  // ⚠️ CRITICAL: name prop for e.name in handler!
    value={this.VM.Data.userName || ''}
    onChange={this.handleInputChange}
    inputType={cntrl.XOSTextboxTypes.textbox}  // or .password
    mandatory={true}
/>

// 8. Buttons (EVERY BUTTON)
<button className="btn btn-primary">  // ✅ HTML button with Bootstrap
    <i className="fa fa-save"></i> Save  // ✅ fa NOT fas
</button>

// 8. Theme Import (App.js ONLY)
import './theme.css';  // ✅ In App.js after copying to src/
```

### ❌ NEVER DO - These will break XOS components:

```javascript
// ❌ WRONG imports
import { XOSComponent } from '../../xos-components/XOSComponent.js';
import '../../../assets/css/theme.css';  // Can't import outside src/

// ❌ WRONG event handling
handleChange(event) {
    this.VM.setValue(event.target.value);  // Won't work with XOSTextbox
}

// ❌ WRONG icon classes
<i className="fas fa-user"></i>  // Use 'fa' not 'fas'

// ❌ WRONG - Looking for XOSButton
<cntrl.XOSButton>  // Doesn't exist for UI
```

## 🔴 Database Access Pattern (CRITICAL)

### ✅ CORRECT Pattern - MUST USE
```csharp
await db.GetEntityDataListAsync<T>(query, params, (row) => {
    return new T {
        ID = row.GetValue<int>("id"),
        Name = row.GetValue<string>("name", "default")
    };
});
```

### ❌ WRONG Pattern - Will Cause Runtime Errors
```csharp
// DO NOT USE standard ADO.NET patterns
row["id"]  // WRONG
row.GetInt32(0)  // WRONG
```

## 🔴 Frontend State Updates (CRITICAL)

### ✅ CORRECT Pattern - Manual Updates Required
```javascript
// In ViewModel
onChange = (prop, val) => {
    this.Data.Input[prop] = val;  // Direct mutation
    this.updateUI();  // MANDATORY - UI won't update without this
}

// In Component
handleChange = () => {
    this.VM.Data.value = newValue;
    this.VM.updateUI();  // REQUIRED for UI to reflect changes
}
```

### ❌ WRONG Pattern - UI Won't Update
```javascript
// These patterns will NOT work
this.setState({ value: newValue });  // NO - XOS doesn't use setState for data
const [value, setValue] = useState();  // NO - No hooks in XOS components
this.Data.property = value;  // NO - Missing updateUI() call
```

## 🔴 API Pattern - 95% POST Only

### ✅ CORRECT Pattern
```csharp
[HttpPost("Save")]  // Always POST, even for reads
public async Task<DomainType> SaveAsync([FromBody] Input input)
{
    // Return domain type directly, not IActionResult
    return domainObject;
}

[HttpPost("GetList")]  // POST for getting data
public async Task<List<Item>> GetListAsync([FromBody] SearchParams params)
{
    return items;
}
```

### ❌ WRONG Pattern
```csharp
[HttpGet]  // NO - Use POST
[HttpPut]  // NO - Use POST
[HttpDelete]  // NO - Use POST
public IActionResult Get()  // NO - Return domain types directly
```

## 🔴 jQuery Dependency (REQUIRED)

### ✅ jQuery is MANDATORY
```javascript
// XOS requires jQuery throughout
$('body').addClass('overflow-hidden');
$('.modal').modal('show');
$(this.getRef('input')).val(value);
```

### ❌ Cannot Remove jQuery
- XOS framework depends on jQuery
- Bootstrap components require jQuery
- Many XOS utilities use jQuery internally

## 🟠 Transaction Pattern with SignalR

### ✅ CORRECT Complex Transaction Pattern
```csharp
using (var dbService = this.GetDBService("CrystalDB", transOwner))
using (var tran = dbService.BeginTransaction())
{
    try
    {
        // Multiple database operations
        await SaveData(dbService);
        
        // Commit before SignalR
        tran.Commit();
        
        // SignalR notifications AFTER commit
        await HubContext.Clients.All.SendAsync("DataUpdated", data);
    }
    catch
    {
        tran.Rollback();
        throw;
    }
}
```

## 🟠 Mixed API Call Patterns

### Primary Pattern - Utils.ajax
```javascript
// Most common pattern in codebase
Utils.ajax({ 
    url: 'Site/Save',  // Relative URL
    data: this.Data.Input 
}, (resp) => {
    // Handle response
});
```

### Secondary Pattern - ApiManager
```javascript
// Used in some components
ApiManager.post('/api/Site/Save', this.Data.Input)
    .then(resp => {
        // Handle response
    });
```

## 🟠 Multi-Tenant Database Configuration

### Connection String Pattern
```json
{
  "CrystalDB": {
    "ConnectionString": "Host=localhost;Database=crystaldb;",
    "Keys": ["1", "MG"]  // Client routing keys
  },
  "CrystalDB2": {
    "ConnectionString": "Host=localhost;Database=crystaldb2;",
    "Keys": ["2", "WB"]  // Different client keys
  }
}
```

## 🟡 Bootstrap + XOS Hybrid

### Mixed Component Usage
```jsx
// XOS components
<XOSButton />
<XOSGrid />

// Bootstrap classes (required)
<div className="modal-dialog modal-xl">
<button className="btn btn-primary">
<div className="col-md-6">
```

## 🟡 File Upload Pattern

### Mixed JSON + Files
```csharp
[HttpPost("Upload")]
public async Task<Result> UploadAsync(
    [FromBody] JsonData data,  // JSON from body
    List<IFormFile> files)      // Files from form
{
    // Handle both JSON and files
}
```

## ✅ Quick Validation Checklist

Before running your code, verify:

1. ✅ Database reads use `row.GetValue<T>("column")`
2. ✅ All state changes call `updateUI()`
3. ✅ API endpoints use POST
4. ✅ Controllers return domain types directly
5. ✅ jQuery is included and available
6. ✅ Transactions commit before SignalR calls
7. ✅ Frontend uses Utils.ajax for API calls
8. ✅ Bootstrap classes are used for layout

## 📚 Essential Reading Order

1. **This Document** (CRITICAL_PATTERNS.md)
2. **XOS Framework Guide** (frontend/xos-framework.md)
3. **Backend Blueprint** (backend/backend-blueprint.md)
4. **Database Schema** (database/database-schema.md)

## ⚠️ Common Pitfalls to Avoid

1. **Don't use React hooks** - XOS components don't support them
2. **Don't use Entity Framework** - Use XOS data framework
3. **Don't create RESTful APIs** - Use POST pattern
4. **Don't expect automatic UI updates** - Call updateUI()
5. **Don't remove jQuery** - It's required everywhere
6. **Don't use IActionResult** - Return domain types
7. **Don't use standard React state** - Use VM.Data pattern

---

## 🧭 Quick Navigation
- [← Back to claude_docs](./README.md) - Main documentation hub
- [Module Development Guide](./MODULE-DEVELOPMENT-GUIDE.md) - Complete workflows
- [Quick Reference Prompts](./CLAUDE-PROMPT-QUICK-REFERENCE.md) - Copy-paste prompts
- [XOS Input Fix](./frontend/xos-input-handling-fix.md) - Fix typing issues
- [Backend Blueprint](./backend/backend-blueprint.md) - API patterns
- [Setup Guide](./SETUP.md) - Environment setup

*This document contains the most critical patterns that differ from standard development. Master these before proceeding with any implementation.*