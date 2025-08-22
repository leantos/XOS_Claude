# ⚠️ COMMON PITFALLS - What Breaks Everything and How to Fix It

## Quick Error Lookup

**Got an error?** Use Ctrl+F to search for your error message below.

---

## 🎨 FRONTEND ERRORS

### ❌ "Cannot set property Data of #<VMBase>"

**What it means**: You're trying to replace the Data object instead of modifying its properties.

**How it breaks:**
```javascript
// ❌ WRONG - This throws the error
init() {
    this.Data = { userName: '', email: '' };  // Trying to replace Data
}

// ❌ ALSO WRONG
someMethod() {
    this.VM.Data = { newProperty: 'value' };  // Trying to replace Data
}
```

**✅ CORRECT FIX:**
```javascript
// Get reference to Data, then modify properties
init() {
    const model = this.Data;     // Get reference
    model.userName = '';         // Modify properties
    model.email = '';
    model.isLoading = false;
}

// For updates
someMethod() {
    const model = this.VM.Data;
    model.newProperty = 'value';
    this.VM.updateUI();
}
```

**Reference**: `frontend/viewmodel-complete.jsx` lines 20-50

---

### ❌ "Textbox not accepting keyboard input" / "Input is read-only"

**What it means**: The three-step event handler pattern is missing or incorrect.

**How it breaks:**
```javascript
// ❌ WRONG - Missing updateUI()
handleInputChange = (e) => {
    this.VM.Data[e.name] = e.value;  // Direct access + no updateUI()
};

// ❌ WRONG - Using e.target.value
handleInputChange = (e) => {
    const model = this.VM.Data;
    model[e.name] = e.target.value;  // Should be e.value
    this.VM.updateUI();
};

// ❌ WRONG - Missing name prop
<cntrl.XOSTextbox
    value={data.userName}
    onChange={this.handleInputChange}  // No name prop!
/>
```

**✅ CORRECT FIX:**
```javascript
// Perfect three-step pattern
handleInputChange = (e) => {
    if (this.VM) {                    // Step 1: Check VM
        const model = this.VM.Data;   // Step 2: Get reference
        model[e.name] = e.value;      // Step 3: Use e.value
        this.VM.updateUI();           // Step 4: Update UI
    }
};

// Component must have name prop
<cntrl.XOSTextbox
    name="userName"                   // REQUIRED
    value={data.userName || ''}
    onChange={this.handleInputChange}
/>
```

**Reference**: `frontend/component-complete.jsx` lines 200-300

---

### ❌ "Cannot resolve module '../../xos-components/XOSComponent.js'"

**What it means**: Wrong import pattern for XOS components.

**How it breaks:**
```javascript
// ❌ WRONG import patterns
import { XOSComponent } from '../../xos-components/XOSComponent.js';
import XOSComponent from '../../xos-components';
import { XOSTextbox } from '../../xos-components/XOSTextbox';
```

**✅ CORRECT FIX:**
```javascript
// ALWAYS use this exact import
import * as cntrl from '../../xos-components';

// Then use as:
export default class MyComponent extends cntrl.XOSComponent {
    // ...
}

<cntrl.XOSTextbox ... />
<cntrl.XOSCombobox ... />
```

**Reference**: `frontend/component-complete.jsx` lines 1-10

---

### ❌ "UI not re-rendering after state changes"

**What it means**: Missing `updateUI()` calls after data modifications.

**How it breaks:**
```javascript
// ❌ WRONG - UI won't reflect changes
saveData() {
    this.VM.Data.isLoading = true;  // Changed data but no updateUI()
    
    // API call
    Utils.ajax({ ... }).then(() => {
        this.VM.Data.isLoading = false;  // Still no updateUI()
        this.VM.Data.message = 'Saved!';
    });
}
```

**✅ CORRECT FIX:**
```javascript
// Always call updateUI() after changing Data
saveData() {
    this.VM.Data.isLoading = true;
    this.VM.updateUI();  // Update after each change
    
    Utils.ajax({ ... }).then(() => {
        this.VM.Data.isLoading = false;
        this.VM.Data.message = 'Saved!';
        this.VM.updateUI();  // Update again
    });
}
```

**Reference**: `frontend/viewmodel-complete.jsx` lines 200-250

---

### ❌ "TypeError: Cannot read property 'Data' of undefined"

**What it means**: ViewModel not properly passed to component constructor.

**How it breaks:**
```javascript
// ❌ WRONG - VM not passed to super
export default class MyComponent extends cntrl.XOSComponent {
    constructor(props) {
        super(props);  // Missing VM parameter
    }
}

// ❌ WRONG - VM not instantiated
export default class MyComponent extends cntrl.XOSComponent {
    constructor(props) {
        super(props, MyComponentVM);  // Should be: new MyComponentVM(props)
    }
}
```

**✅ CORRECT FIX:**
```javascript
// Always pass new VM instance to super
export default class MyComponent extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new MyComponentVM(props));  // CORRECT
    }
}
```

**Reference**: `frontend/component-complete.jsx` lines 15-25

---

## ⚙️ BACKEND ERRORS

### ❌ "Column 'column_name' does not exist"

**What it means**: Using wrong database access pattern, case sensitivity issues.

**How it breaks:**
```csharp
// ❌ WRONG - These will fail
return new Entity {
    ID = row["ID"],           // Case sensitive!
    Name = row["Name"],       // Might not exist
    ID = (int)row["id"]       // Wrong casting
};

// ❌ WRONG - Direct ADO.NET
using (var cmd = new NpgsqlCommand(sql, connection)) {
    var reader = cmd.ExecuteReader();
    while (reader.Read()) {
        var id = reader.GetInt32(0);  // Wrong pattern
    }
}
```

**✅ CORRECT FIX:**
```csharp
// Use exact PostgreSQL column names with GetValue<T>
return new Entity {
    ID = row.GetValue<int>("id"),                    // Exact column name
    Name = row.GetValue<string>("name", "default"), // With default
    Amount = row.GetValue<decimal?>("amount")        // Nullable
};

// Always use XOS data framework
await dbService.GetEntityDataListAsync<Entity>(query, dbParams, (row) => {
    return new Entity { /* mapping */ };
});
```

**Reference**: `backend/service-complete.cs` lines 500-700

---

### ❌ "404 Not Found" on API endpoints

**What it means**: Wrong HTTP verb or routing pattern.

**How it breaks:**
```csharp
// ❌ WRONG - Using non-POST verbs
[HttpGet("GetList")]
public async Task<List<Entity>> GetList() { }

[HttpPut("Update")]
public async Task<bool> Update([FromBody] Entity entity) { }

// ❌ WRONG - Missing [FromBody]
[HttpPost("Save")]
public async Task<string> Save(Entity input) { }  // Should be [FromBody]
```

**✅ CORRECT FIX:**
```csharp
// 95% of XOS endpoints should be POST
[HttpPost("GetList")]
public async Task<List<Entity>> GetListAsync([FromBody] SearchParams input) { }

[HttpPost("Save")]
public async Task<string> SaveAsync([FromBody] Entity input) { }

[HttpPost("Delete")]
public async Task<bool> DeleteAsync([FromBody] IdInput input) { }
```

**Reference**: `backend/controller-complete.cs` lines 100-200

---

### ❌ "Object reference not set to an instance of an object" in Services

**What it means**: Missing service base class or incorrect DI registration.

**How it breaks:**
```csharp
// ❌ WRONG - Not extending XOSServiceBase
public class EntityService : IEntityService {
    // Missing XOS infrastructure - this.GetDBService() won't work
}

// ❌ WRONG - Incorrect constructor
public class EntityService : XOSServiceBase {
    public EntityService() { }  // Missing required parameters
}
```

**✅ CORRECT FIX:**
```csharp
// Always extend XOSServiceBase with correct constructor
public class EntityService : XOSServiceBase, IEntityService {
    public EntityService(IServiceProvider serviceProvider, ILogger<EntityService> logger) 
        : base(serviceProvider, logger) { }
        
    // Now this.GetDBService() works
}
```

**Reference**: `infrastructure/xos-service-base.cs` lines 50-100

---

### ❌ "Transaction deadlock detected"

**What it means**: SignalR called before transaction commit, or nested transaction issues.

**How it breaks:**
```csharp
// ❌ WRONG - SignalR before commit
using (var tran = dbService.BeginTransaction()) {
    await SaveData();
    await HubContext.Clients.All.SendAsync("Updated");  // Before commit!
    tran.Commit();
}

// ❌ WRONG - Nested using statements
using (var db1 = GetDBService("DB1"))
using (var tran1 = db1.BeginTransaction())
using (var db2 = GetDBService("DB2"))  // Can cause deadlock
using (var tran2 = db2.BeginTransaction()) { }
```

**✅ CORRECT FIX:**
```csharp
// Always commit BEFORE SignalR
using (var tran = dbService.BeginTransaction()) {
    try {
        await SaveData();
        tran.Commit();  // COMMIT FIRST
        
        // SignalR AFTER commit
        await HubContext.Clients.All.SendAsync("Updated", data);
    }
    catch {
        tran.Rollback();
        throw;
    }
}
```

**Reference**: `database/transactions-complete.cs` lines 100-200

---

## 🔗 API COMMUNICATION ERRORS

### ❌ "CORS policy: No 'Access-Control-Allow-Origin' header"

**What it means**: API call using wrong pattern or absolute URLs.

**How it breaks:**
```javascript
// ❌ WRONG - Absolute URLs cause CORS
Utils.ajax({
    url: 'http://localhost:5000/api/Entity/Save',  // Absolute URL
    data: input
});

// ❌ WRONG - Using fetch/axios instead of Utils.ajax
fetch('/api/Entity/Save', {
    method: 'POST',
    body: JSON.stringify(input)
});
```

**✅ CORRECT FIX:**
```javascript
// Always use Utils.ajax with relative URLs
Utils.ajax({
    url: '/api/Entity/Save',  // Relative URL
    data: input
}, (response) => {
    // Success
}, (error) => {
    // Error
});

// Or with promises
Utils.ajax({
    url: '/api/Entity/Save',
    data: input
}).then(response => {
    // Success
}).catch(error => {
    // Error
});
```

**Reference**: `api-patterns/utils-ajax-complete.js` lines 50-150

---

### ❌ "Request timeout" / "API calls hanging"

**What it means**: Missing error handling or incorrect API patterns.

**How it breaks:**
```javascript
// ❌ WRONG - No error handling
Utils.ajax({
    url: '/api/Entity/Save',
    data: input
});  // What if it fails?

// ❌ WRONG - No loading state
async save() {
    const result = await Utils.ajax({ ... });  // User doesn't know it's loading
}
```

**✅ CORRECT FIX:**
```javascript
// Always include loading states and error handling
async save() {
    const model = this.Data;
    model.isLoading = true;
    model.errorMessage = '';
    this.updateUI();
    
    try {
        const result = await Utils.ajax({
            url: '/api/Entity/Save',
            data: model.formData
        });
        
        model.successMessage = 'Saved successfully';
        return result;
    } catch (error) {
        model.errorMessage = error.message || 'Save failed';
        return false;
    } finally {
        model.isLoading = false;
        this.updateUI();
    }
}
```

**Reference**: `api-patterns/error-handling-complete.js` lines 100-200

---

## 🎨 STYLING ERRORS

### ❌ "Module not found: Can't resolve '../../../assets/css/theme.css'"

**What it means**: Trying to import theme.css from outside src/ folder.

**How it breaks:**
```javascript
// ❌ WRONG - Can't import outside src/
import '../../../assets/css/theme.css';
import './assets/theme.css';
```

**✅ CORRECT FIX:**
```bash
# First, copy theme.css to src/ folder
cp /path/to/assets/css/theme.css ./src/theme.css
```

```javascript
// Then import in App.js ONLY
import './theme.css';  // In src/App.js
```

**Reference**: `styling/theme-complete.css` lines 1-20

---

### ❌ "Icons not displaying" / "FontAwesome not working"

**What it means**: Using wrong icon class names.

**How it breaks:**
```jsx
// ❌ WRONG - 'fas' doesn't work in XOS
<i className="fas fa-user"></i>
<i className="fab fa-save"></i>
<i className="fal fa-edit"></i>
```

**✅ CORRECT FIX:**
```jsx
// Always use 'fa' class
<i className="fa fa-user"></i>
<i className="fa fa-save"></i>
<i className="fa fa-edit"></i>
<i className="fa fa-trash"></i>
```

**Reference**: `styling/bootstrap-complete.html` lines 800-900

---

## 📚 JQUERY ERRORS

### ❌ "$ is not defined" / "jQuery is not defined"

**What it means**: Trying to remove jQuery or jQuery not loaded properly.

**How it breaks:**
```javascript
// ❌ WRONG - Can't remove jQuery
// Attempting to replace with vanilla JS
document.querySelector('.modal').show();  // Won't work with Bootstrap

// ❌ WRONG - Loading jQuery incorrectly
import $ from 'jquery';  // May not work with XOS
```

**✅ CORRECT FIX:**
```javascript
// jQuery is required and should be globally available
$('.modal').modal('show');    // This should work
$('body').addClass('loading');
$(element).val(newValue);

// If not available, check your index.html for jQuery script tag
```

**Reference**: `jquery-bootstrap/jquery-patterns.js` lines 1-50

---

## 🚨 EMERGENCY FIXES

### Quick Fixes for Common Issues:

1. **Input not working?**
   - Add `name` prop to XOSTextbox
   - Check event handler uses `e.value` not `e.target.value`
   - Add `updateUI()` call

2. **Data property error?**
   - Change `this.Data = {}` to `const model = this.Data; model.prop = value`

3. **API 404?**
   - Change to `[HttpPost]`
   - Add `[FromBody]` parameter

4. **Database error?**
   - Use `row.GetValue<T>("column")` pattern
   - Check column name case

5. **UI not updating?**
   - Add `this.VM.updateUI()` after data changes

6. **Import error?**
   - Use `import * as cntrl from '../../xos-components'`

---

## 🔍 Debugging Strategy

When something breaks:

1. **Check ABSOLUTE-RULES.md** - Are you following all mandatory patterns?
2. **Search this file** - Is your error listed above?
3. **Check the pattern files** - Find the correct implementation
4. **Compare with working code** - Look at existing modules
5. **Test incrementally** - Add one feature at a time

## 📚 Pattern File References

For complete correct patterns, see:
- Frontend issues → `frontend/component-complete.jsx`, `frontend/viewmodel-complete.jsx`
- Backend issues → `backend/service-complete.cs`, `backend/controller-complete.cs`
- API issues → `api-patterns/utils-ajax-complete.js`
- Styling issues → `styling/bootstrap-complete.html`
- Database issues → `database/postgres-queries.sql`

**Remember**: Every error above has a working solution in the pattern files. When in doubt, copy the pattern exactly and modify for your needs.