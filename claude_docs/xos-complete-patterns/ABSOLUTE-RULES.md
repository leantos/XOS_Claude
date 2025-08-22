# 🚨 ABSOLUTE RULES - The Unbreakable Laws of XOS Framework

## ⚠️ CRITICAL: These Rules Cannot Be Broken

Violating ANY of these rules will cause runtime errors, broken functionality, or system instability. These are framework requirements, not suggestions.

---

## 🎨 FRONTEND RULES (React/XOS Components)

### RULE 1: Component Structure (MANDATORY)
```javascript
// ✅ CORRECT - Always follow this EXACT structure
export default class [ComponentName] extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new [ComponentName]VM(props));  // MUST pass VM to super
    }
}

// ❌ WRONG - These will break
class Component extends React.Component { }     // NO - Must extend XOSComponent
class Component extends cntrl.XOSComponent {
    constructor(props) {
        super(props);  // NO - Must pass VM
    }
}
```

### RULE 2: Import Pattern (MANDATORY)
```javascript
// ✅ CORRECT - Always use this exact import
import * as cntrl from '../../xos-components';

// ❌ WRONG - These will fail
import { XOSComponent } from '../../xos-components/XOSComponent.js';
import XOSComponent from '../../xos-components';
```

### RULE 3: ViewModel Data Pattern (CRITICAL)
```javascript
// ✅ CORRECT - Get reference to Data, then modify properties
init() {
    const model = this.Data;     // Step 1: Get reference
    model.userName = '';         // Step 2: Set properties on reference
    model.isLoading = false;
}

// ❌ WRONG - These will throw "Cannot set property Data" error
init() {
    this.Data = { userName: '' };           // NEVER set Data directly
    this.Data.userName = '';                // NEVER access Data directly
}
```

### RULE 4: Event Handler Pattern (CRITICAL)
```javascript
// ✅ CORRECT - Three-step pattern (NEVER change this)
handleInputChange = (e) => {
    if (this.VM) {                    // Step 1: Check VM exists
        const model = this.VM.Data;   // Step 2: Get Data reference  
        model[e.name] = e.value;      // Step 3: Use e.value (NOT e.target.value)
        this.VM.updateUI();           // Step 4: ALWAYS call updateUI()
    }
};

// ❌ WRONG - These will break input handling
handleInputChange = (e) => {
    this.VM.Data[e.name] = e.target.value;  // NO - Direct Data access
    // Missing updateUI() - UI won't update
};
```

### RULE 5: XOS Input Requirements (MANDATORY)
```javascript
// ✅ CORRECT - All XOS inputs MUST have name prop
<cntrl.XOSTextbox
    name="userName"                    // REQUIRED - Must match Data property
    value={data.userName || ''}        // REQUIRED - Prevent undefined
    onChange={this.handleInputChange}  // REQUIRED - Use exact handler
/>

// ❌ WRONG - These will break
<cntrl.XOSTextbox
    value={data.userName}              // NO - Will break if undefined
    onChange={(e) => setValue(e.target.value)}  // NO - Wrong event object
/>
```

---

## ⚙️ BACKEND RULES (Controllers/Services)

### RULE 6: API Endpoint Pattern (MANDATORY)
```csharp
// ✅ CORRECT - 95% of endpoints MUST be POST
[HttpPost("Save")]
public async Task<EntityType> SaveAsync([FromBody] EntityType input)
{
    return await serviceManager.SaveAsync(input, this.GetRequestInfo());
}

// ❌ WRONG - Avoid these patterns
[HttpGet]           // NO - Use POST for consistency
[HttpPut]           // NO - Use POST for consistency
[HttpDelete]        // NO - Use POST for consistency
public IActionResult Save()  // NO - Return domain types directly
```

### RULE 7: Controller Base Class (MANDATORY)
```csharp
// ✅ CORRECT - Always extend XOSBaseController
public class EntityController : XOSBaseController
{
    // Access to this.ClientID, this.SiteID, this.GetRequestInfo()
}

// ❌ WRONG - These break XOS functionality
public class EntityController : ControllerBase { }  // NO - Missing XOS context
public class EntityController : Controller { }      // NO - Missing XOS context
```

### RULE 8: Service Base Class (MANDATORY)
```csharp
// ✅ CORRECT - Always extend XOSServiceBase
public class EntityService : XOSServiceBase, IEntityService
{
    public EntityService(IServiceProvider serviceProvider, ILogger<EntityService> logger) 
        : base(serviceProvider, logger) { }
}

// ❌ WRONG - These break data access
public class EntityService : IEntityService { }  // NO - Missing XOS infrastructure
```

---

## 💾 DATABASE RULES (Data Access)

### RULE 9: Database Query Pattern (CRITICAL)
```csharp
// ✅ CORRECT - MUST use GetValue<T> pattern
await dbService.GetEntityDataAsync<Entity>(query, dbParams, (row) => {
    return new Entity {
        ID = row.GetValue<int>("id"),                    // REQUIRED pattern
        Name = row.GetValue<string>("name", "default"),  // With default value
        Date = row.GetValue<DateTime?>("date")           // Nullable types
    };
});

// ❌ WRONG - These will cause runtime errors
return new Entity {
    ID = row["id"],              // NO - Use GetValue<T>
    Name = row.GetString(0),     // NO - Use GetValue<T>
    ID = (int)row["id"]          // NO - Use GetValue<T>
};
```

### RULE 10: Database Service Pattern (MANDATORY)
```csharp
// ✅ CORRECT - Always use GetDBService pattern
using (var dbService = this.GetDBService(clientId.ToString(), false))
{
    // Database operations
}

// ❌ WRONG - These break multi-tenancy
using (var connection = new NpgsqlConnection(connectionString)) { }  // NO
// Direct ADO.NET usage breaks XOS data framework
```

### RULE 11: Transaction Pattern (CRITICAL)
```csharp
// ✅ CORRECT - Always commit before SignalR
using (var dbService = this.GetDBService(clientId.ToString(), false))
using (var tran = dbService.BeginTransaction())
{
    try
    {
        // Database operations
        tran.Commit();                    // MUST commit first
        
        // SignalR AFTER commit
        await HubContext.Clients.All.SendAsync("Updated", data);
    }
    catch
    {
        tran.Rollback();
        throw;
    }
}

// ❌ WRONG - This will cause deadlocks
// SignalR before commit
// Missing rollback on error
```

---

## 🎨 STYLING RULES (CSS/Bootstrap)

### RULE 12: Theme Integration (MANDATORY)
```javascript
// ✅ CORRECT - Import theme.css in App.js ONLY
import './theme.css';  // MUST be in src/ folder

// ❌ WRONG - These will fail
import '../../../assets/css/theme.css';  // NO - Can't import outside src/
// Multiple theme imports in different components
```

### RULE 13: Bootstrap Class Usage (REQUIRED)
```jsx
// ✅ CORRECT - Always use Bootstrap classes for layout
<div className="container">
    <div className="row">
        <div className="col-md-6">
            <div className="card">
                <div className="card-body">
```

### RULE 14: Icon Classes (MANDATORY)
```jsx
// ✅ CORRECT - Use 'fa' not 'fas'
<i className="fa fa-save"></i>
<i className="fa fa-user"></i>

// ❌ WRONG - These won't display
<i className="fas fa-save"></i>  // NO - Use 'fa'
<i className="fab fa-user"></i>  // NO - Use 'fa'
```

---

## 🔗 API RULES (Frontend to Backend)

### RULE 15: API Call Pattern (MANDATORY)
```javascript
// ✅ CORRECT - Use Utils.ajax with relative URLs
Utils.ajax({
    url: '/api/Entity/Save',     // MUST be relative
    data: { id: 1, name: 'test' }
}, (response) => {
    // Success callback
});

// ❌ WRONG - These patterns will fail
fetch('/api/Entity/Save', { ... });        // NO - Use Utils.ajax
axios.post('/api/Entity/Save', data);       // NO - Use Utils.ajax
Utils.ajax({ url: 'http://localhost/...' }); // NO - Relative URLs only
```

### RULE 16: Error Handling Pattern (REQUIRED)
```javascript
// ✅ CORRECT - Always handle errors
Utils.ajax({
    url: '/api/Entity/Save',
    data: input
}).then(response => {
    model.successMessage = 'Saved successfully';
}).catch(error => {
    model.errorMessage = error.message || 'Save failed';
}).finally(() => {
    model.isLoading = false;
    this.updateUI();  // NEVER forget this
});
```

---

## 📚 JQUERY RULES (Required Dependencies)

### RULE 17: jQuery Usage (MANDATORY)
```javascript
// ✅ CORRECT - jQuery is REQUIRED, cannot be removed
$('body').addClass('overflow-hidden');
$('.modal').modal('show');
$(element).val(value);

// ❌ WRONG - Don't try to remove jQuery
// XOS framework depends on jQuery internally
// Bootstrap components require jQuery
```

---

## 🚨 WHAT HAPPENS IF YOU BREAK THESE RULES

### Frontend Rule Violations:
- **Data property errors**: "Cannot set property Data of #<VMBase>"
- **Input not working**: Textboxes won't accept keyboard input
- **UI not updating**: Changes don't reflect in the interface
- **Import errors**: "Cannot resolve module" errors

### Backend Rule Violations:
- **Database errors**: "Column does not exist" runtime errors
- **Connection failures**: Multi-tenant routing breaks
- **Transaction deadlocks**: Database locks and timeouts
- **Authorization failures**: Missing XOS security context

### API Rule Violations:
- **CORS errors**: Cross-origin request failures
- **404 errors**: Endpoints not found
- **Timeout errors**: Requests hang indefinitely
- **Data corruption**: Invalid data formats

---

## ✅ COMPLIANCE CHECKLIST

Before deploying any XOS module, verify:

### Frontend Checklist:
- [ ] Component extends `cntrl.XOSComponent`
- [ ] ViewModel passed to `super(props, vm)`
- [ ] Data property uses reference pattern
- [ ] All inputs have `name` prop
- [ ] Event handlers call `updateUI()`
- [ ] Theme.css imported in App.js only

### Backend Checklist:
- [ ] Controller extends `XOSBaseController`
- [ ] Service extends `XOSServiceBase`
- [ ] All endpoints are POST
- [ ] Database uses `GetValue<T>` pattern
- [ ] Transactions commit before SignalR
- [ ] Returns domain types directly

### API Checklist:
- [ ] Uses `Utils.ajax` pattern
- [ ] Relative URLs only
- [ ] Error handling implemented
- [ ] Loading states managed

**Remember**: These rules exist because the XOS framework requires them. They are not optional suggestions - they are the foundation that makes XOS work correctly.