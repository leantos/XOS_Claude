# XOS Utils API Reference

## Import
```javascript
import { Utils } from '../xos-components';
// Or from Utils directly
import { Utils } from '../xos-components/Utils';
```

## API Communication

### Utils.ajax() - CRITICAL FOR ALL API CALLS
**IMPORTANT**: This is the ONLY method that should be used for API calls in applications using this framework. It provides automatic token management, session handling, and error handling.

```javascript
Utils.ajax(options, callback)
```

**Implementation Location:** `src\xos-components\Utils\Utils.js:672-674`

**Parameters:**
```javascript
{
    url: string,          // API endpoint (relative to base URL)
    data: object,         // Request payload
    method: string,       // HTTP method (default: 'POST')
    files: Array/FileList, // Files for upload operations
    headers: object,      // Custom headers
    timeout: number,      // Request timeout (ms)
    responseType: string  // Response type (json, blob, text)
}
```

**Critical Features:**
- Automatic Bearer token inclusion in Authorization header
- Token refresh on 401 responses
- Session timeout handling
- FormData conversion when files are present
- Centralized error logging

**Examples:**
```javascript
// Simple POST request (most common pattern)
Utils.ajax({
    url: 'Customer/Save',
    data: { name: 'John', email: 'john@example.com' }
}, (response) => {
    if (response && response.IsValid) {
        // Handle success
        this.showMessageBox({
            text: Utils.getMessage(4), // "Saved successfully"
            messageboxType: XOSMessageboxTypes.info
        });
    }
});

// GET request
Utils.ajax({
    url: 'General/LoadReportsNew',
    method: 'GET'
}, (response) => {
    if (response) {
        this.Data.Reports = response;
        this.updateUI();
    }
});

// File upload
Utils.ajax({
    url: 'Files/Upload',
    data: this.Data.Input,
    files: this.selectedFiles
}, (response) => {
    // Handle upload response
});

// With loading indicator pattern
this.loading = true;
this.updateUI();
Utils.ajax({
    url: 'WorkFlow/SaveAttachment',
    data: this.Data.Input
}, (response) => {
    this.loading = false;
    this.updateUI();
    if (response && response.IsValid) {
        this.showMessageBox({
            text: Utils.getMessage(4),
            messageboxType: XOSMessageboxTypes.info,
            onClose: () => this.close(response)
        });
    }
});
```

**Common API Endpoints:**
```javascript
// User Management
'Shared/FillComboUser'
'General/GetUserAccess'

// Data Operations  
'Customer/Save'
'WorkFlow/SaveAttachment'
'WorkFlow/LoadAttachments'

// Reports
'General/LoadReportsNew'
'Dashboard/GetDashboard'

// File Operations
'Files/Upload'
'Files/Download'
'Files/Delete'

// Lookups
'Shared/FillLookupMaster'
'Shared/FillComboPackingType'
```

### Utils.downloadFile()
Download files from server.

```javascript
Utils.downloadFile(options, callback)
```

**Examples:**
```javascript
// Download with file info
Utils.downloadFile({
    url: 'Reports/Download',
    data: { 
        reportId: 123,
        format: 'pdf'
    }
}, (result) => {
    if (result.success) {
        console.log('File downloaded');
    }
});

// Download with blob response
Utils.downloadFile({
    url: 'Export/Excel',
    data: { startDate, endDate },
    fileName: 'report.xlsx'  // Optional custom filename
}, (result) => {
    // File automatically downloads
});
```

### Utils.uploadFile()
Upload files to server.

```javascript
Utils.uploadFile(options, successCallback, errorCallback)
```

**Examples:**
```javascript
// Single file upload
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('category', 'documents');

Utils.uploadFile({
    url: 'Files/Upload',
    data: formData
}, (response) => {
    console.log('Upload successful:', response);
}, (error) => {
    console.error('Upload failed:', error);
});

// Multiple files
const formData = new FormData();
for (let file of fileInput.files) {
    formData.append('files', file);
}

Utils.uploadFile({
    url: 'Files/UploadMultiple',
    data: formData,
    onProgress: (percent) => {
        console.log(`Upload progress: ${percent}%`);
    }
}, successHandler, errorHandler);
```

## Validation Functions

### String Validation

```javascript
// Check null/empty/whitespace
Utils.isNullOrEmpty(value)
// Returns: true if null, undefined, empty string, or whitespace

// Examples
Utils.isNullOrEmpty(null)        // true
Utils.isNullOrEmpty('')          // true
Utils.isNullOrEmpty('  ')        // true
Utils.isNullOrEmpty('text')      // false
Utils.isNullOrEmpty(0)           // false
```

### Email Validation

```javascript
Utils.validateEmail(email)
// Returns: true if valid email format

// Examples
Utils.validateEmail('user@example.com')     // true
Utils.validateEmail('user+tag@example.co')  // true
Utils.validateEmail('invalid.email')        // false
Utils.validateEmail('user@')                // false
```

### Character Type Validation

```javascript
// Check if character is digit
Utils.isDigit(charCode)
// charCode: character code from charCodeAt()

// Check if character is alphabet
Utils.isAlphabet(charCode)

// Check if alphanumeric
Utils.isAlphaNumeric(charCode)

// Examples
Utils.isDigit('5'.charCodeAt(0))      // true
Utils.isAlphabet('A'.charCodeAt(0))   // true
Utils.isAlphaNumeric('3'.charCodeAt(0)) // true
Utils.isAlphaNumeric('@'.charCodeAt(0)) // false
```

### Credit Card Validation

```javascript
Utils.validateCreditCard(cardNumber)
// Uses Luhn algorithm

// Examples
Utils.validateCreditCard('4111111111111111')  // true (Visa test)
Utils.validateCreditCard('5500000000000004')  // true (Mastercard test)
Utils.validateCreditCard('1234567890123456')  // false
```

## Data Manipulation

### Object Operations

```javascript
// Deep clone object
Utils.cloneObject(obj)
// Creates deep copy, handles circular references

// JSON-based clone (faster but limited)
Utils.getJSONCopy(obj)
// Note: Loses functions, dates become strings

// Clean circular references
Utils.cleanObject(obj, deep = false)
// Removes circular references and cleans memory

// Examples
const original = { a: 1, b: { c: 2 } };
const clone = Utils.cloneObject(original);
clone.b.c = 3;
console.log(original.b.c); // Still 2

const jsonCopy = Utils.getJSONCopy(original);
// Fast but converts dates to strings
```

### Type Checking

```javascript
// Check if value is object
Utils.isObject(value)

// Check if value is array
Utils.isArray(value)

// Check if value is function
Utils.isFunction(value)

// Check if value is date
Utils.isDate(value)

// Examples
Utils.isObject({})           // true
Utils.isObject([])           // false (arrays are not plain objects)
Utils.isArray([1, 2, 3])     // true
Utils.isFunction(() => {})   // true
Utils.isDate(new Date())     // true
```

## Date/Time Utilities

### Date Formatting

```javascript
// Format date to string
Utils.formatDate(date, format)

// Formats:
// 'DD/MM/YYYY' - 31/12/2023
// 'MM/DD/YYYY' - 12/31/2023
// 'YYYY-MM-DD' - 2023-12-31
// 'DD MMM YYYY' - 31 Dec 2023
// 'DD MMMM YYYY' - 31 December 2023

// Examples
const date = new Date('2023-12-31');
Utils.formatDate(date, 'DD/MM/YYYY')     // "31/12/2023"
Utils.formatDate(date, 'DD MMM YYYY')    // "31 Dec 2023"
Utils.formatDate(date, 'YYYY-MM-DD')     // "2023-12-31"
```

### Date Parsing

```javascript
// Parse date string
Utils.parseDate(dateString)
// Auto-detects format: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD

// Parse with specific format
Utils.parseDateWithFormat(dateString, format)

// Examples
Utils.parseDate('31/12/2023')     // Date object
Utils.parseDate('2023-12-31')     // Date object
Utils.parseDate('Dec 31, 2023')   // Date object
```

### Date Manipulation

```javascript
// Add days to date
Utils.addDays(date, days)

// Add months to date
Utils.addMonths(date, months)

// Add years to date
Utils.addYears(date, years)

// Get date difference in days
Utils.dateDiff(startDate, endDate)

// Examples
const today = new Date();
const tomorrow = Utils.addDays(today, 1);
const nextMonth = Utils.addMonths(today, 1);
const nextYear = Utils.addYears(today, 1);

const days = Utils.dateDiff(startDate, endDate); // Number of days
```

### Date Comparison

```javascript
// Check if date is today
Utils.isToday(date)

// Check if date is in past
Utils.isPastDate(date)

// Check if date is in future
Utils.isFutureDate(date)

// Compare dates (ignoring time)
Utils.compareDates(date1, date2)
// Returns: -1 (date1 < date2), 0 (equal), 1 (date1 > date2)

// Examples
Utils.isToday(new Date())              // true
Utils.isPastDate(yesterday)            // true
Utils.isFutureDate(tomorrow)           // true
Utils.compareDates(date1, date2)       // 0, 1, or -1
```

## String Utilities

### String Manipulation

```javascript
// Trim whitespace
Utils.trim(str)

// Title case
Utils.toTitleCase(str)
// "hello world" → "Hello World"

// Sentence case
Utils.toSentenceCase(str)
// "hello world" → "Hello world"

// Camel case
Utils.toCamelCase(str)
// "hello world" → "helloWorld"

// Pascal case
Utils.toPascalCase(str)
// "hello world" → "HelloWorld"

// Truncate string
Utils.truncate(str, length, suffix = '...')
// "Long text here" → "Long te..."

// Remove HTML tags
Utils.stripHtml(htmlString)
// "<p>Hello</p>" → "Hello"
```

### String Formatting

```javascript
// Format number with commas
Utils.formatNumber(number, decimals = 2)
// 1234567.89 → "1,234,567.89"

// Format currency
Utils.formatCurrency(amount, symbol = '$', decimals = 2)
// 1234.5 → "$1,234.50"

// Format percentage
Utils.formatPercentage(value, decimals = 2)
// 0.1234 → "12.34%"

// Format file size
Utils.formatFileSize(bytes)
// 1024 → "1 KB"
// 1048576 → "1 MB"
```

## Array Extensions (LINQ-style)

These methods are added to Array prototype when XOS is loaded.

### Filtering and Finding

```javascript
// Find first matching element
array.first(predicate)
// Returns: First match or null

// Find last matching element
array.last(predicate)

// Filter elements
array.where(predicate)
// Returns: New array with matches

// Check if any element matches
array.any(predicate)
// Returns: boolean

// Check if all elements match
array.all(predicate)
// Returns: boolean

// Examples
const users = [
    { id: 1, name: 'John', age: 30 },
    { id: 2, name: 'Jane', age: 25 },
    { id: 3, name: 'Bob', age: 30 }
];

users.first(u => u.age === 30)    // { id: 1, name: 'John', age: 30 }
users.where(u => u.age === 30)    // [John, Bob]
users.any(u => u.age > 40)        // false
users.all(u => u.age > 20)        // true
```

### Transformation

```javascript
// Map to new array
array.select(selector)
// Same as map() but chainable

// Flatten nested arrays
array.selectMany(selector)

// Group by key
array.groupBy(keySelector)

// Distinct values
array.distinct(keySelector)

// Examples
users.select(u => u.name)           // ['John', 'Jane', 'Bob']
users.groupBy(u => u.age)           // { 30: [John, Bob], 25: [Jane] }
[1, 2, 2, 3, 3, 3].distinct()       // [1, 2, 3]

const orders = [
    { id: 1, items: [{ product: 'A' }, { product: 'B' }] },
    { id: 2, items: [{ product: 'C' }] }
];
orders.selectMany(o => o.items)     // Flattened array of all items
```

### Sorting

```javascript
// Order by ascending
array.orderBy(keySelector)

// Order by descending
array.orderByDescending(keySelector)

// Multiple sorting
array.orderBy(key1).thenBy(key2)

// Examples
users.orderBy(u => u.age)           // Sorted by age ascending
users.orderByDescending(u => u.age) // Sorted by age descending
users.orderBy(u => u.age).thenBy(u => u.name) // Multi-level sort
```

### Aggregation

```javascript
// Sum values
array.sum(selector)

// Average values
array.average(selector)

// Min value
array.min(selector)

// Max value
array.max(selector)

// Count matches
array.count(predicate)

// Examples
users.sum(u => u.age)               // 85 (30 + 25 + 30)
users.average(u => u.age)           // 28.33
users.min(u => u.age)               // 25
users.max(u => u.age)               // 30
users.count(u => u.age === 30)      // 2
```

### Array Manipulation

```javascript
// Remove item
array.remove(item)
// Modifies original array

// Remove at index
array.removeAt(index)

// Insert at index
array.insert(index, item)

// Clear array
array.clear()

// Examples
const arr = [1, 2, 3, 4, 5];
arr.remove(3);                      // arr = [1, 2, 4, 5]
arr.removeAt(0);                    // arr = [2, 4, 5]
arr.insert(1, 3);                   // arr = [2, 3, 4, 5]
arr.clear();                        // arr = []
```

## Utility Functions

### ID Generation

```javascript
// Generate unique ID
Utils.getUniqueID()
// Returns: "component_1234567890123_45678"

// Generate GUID
Utils.generateGUID()
// Returns: "550e8400-e29b-41d4-a716-446655440000"

// Generate random string
Utils.randomString(length, includeNumbers = true)
// Returns: Random alphanumeric string
```

### Messaging

```javascript
// Get predefined message by code
Utils.getMessage(code)

// Message codes:
// 1: "Operation failed"
// 2: "Operation successful"
// 3: "Are you sure?"
// 4: "Record saved successfully"
// 5: "Record deleted successfully"
// 10: "Invalid data"
// 20: "Required field missing"
// ... etc

// Show notification
Utils.showMessage(message, type)
// type: 'success', 'error', 'warning', 'info'
```

### Local Storage

```javascript
// Save to local storage
Utils.setLocalStorage(key, value)
// Automatically JSON stringifies objects

// Get from local storage
Utils.getLocalStorage(key)
// Automatically JSON parses

// Remove from local storage
Utils.removeLocalStorage(key)

// Clear all local storage
Utils.clearLocalStorage()

// Examples
Utils.setLocalStorage('user', { id: 1, name: 'John' });
const user = Utils.getLocalStorage('user'); // Object
Utils.removeLocalStorage('user');
```

### Session Storage

```javascript
// Same as local storage but session-scoped
Utils.setSessionStorage(key, value)
Utils.getSessionStorage(key)
Utils.removeSessionStorage(key)
Utils.clearSessionStorage()
```

### DOM Utilities

```javascript
// Get element by ID
Utils.getElementById(id)

// Get elements by class
Utils.getElementsByClass(className)

// Add class to element
Utils.addClass(element, className)

// Remove class from element
Utils.removeClass(element, className)

// Toggle class on element
Utils.toggleClass(element, className)

// Check if element has class
Utils.hasClass(element, className)

// Get keyboard focusable elements
Utils.getKeyboardFocusableElements(container)
// Returns array of focusable elements (inputs, buttons, etc.)
```

### Debounce and Throttle

```javascript
// Debounce function
Utils.debounce(func, delay)
// Delays execution until after delay ms of inactivity

// Throttle function
Utils.throttle(func, limit)
// Limits execution to once per limit ms

// Examples
const search = Utils.debounce((query) => {
    // API call here
}, 300);

const scroll = Utils.throttle(() => {
    // Scroll handler
}, 100);
```

### Delayed Search (Built-in Debounce)

```javascript
// Create debounced search
const searcher = Utils.delayedSearch((searchText) => {
    // Perform search
    console.log('Searching for:', searchText);
}, 300);

// Use it
searcher('hello');  // Won't execute immediately
searcher('hello w'); // Cancels previous, waits 300ms
searcher('hello world'); // Final execution after 300ms
```

## Cryptography

### Encryption/Decryption

```javascript
// Encrypt string
Utils.encrypt(text, key)
// Returns: Encrypted string

// Decrypt string
Utils.decrypt(encryptedText, key)
// Returns: Original string

// Generate encryption key
Utils.generateKey()
// Returns: Random key string

// Examples
const key = Utils.generateKey();
const encrypted = Utils.encrypt('sensitive data', key);
const decrypted = Utils.decrypt(encrypted, key);
```

### Hashing

```javascript
// MD5 hash
Utils.md5(text)

// SHA256 hash
Utils.sha256(text)

// SHA512 hash
Utils.sha512(text)

// Examples
Utils.md5('password')     // "5f4dcc3b5aa765d61d8327deb882cf99"
Utils.sha256('password')  // "5e884898da28047151d0e56f8dc6292..."
```

## Display Utilities

```javascript
// Get display-friendly filename
Utils.getDisplayFileName(fullPath)
// "C:\Users\...\document.pdf" → "document.pdf"

// Format bytes to readable size
Utils.formatBytes(bytes, decimals = 2)
// 1024 → "1.00 KB"
// 1048576 → "1.00 MB"

// Pluralize word
Utils.pluralize(count, singular, plural)
// Utils.pluralize(1, 'item', 'items') → "1 item"
// Utils.pluralize(5, 'item', 'items') → "5 items"

// Get initials from name
Utils.getInitials(name)
// "John Doe" → "JD"
// "Jane" → "J"
```

## Performance Utilities

```javascript
// Measure execution time
Utils.measureTime(func)
// Returns: { result: any, time: number }

// Example
const { result, time } = Utils.measureTime(() => {
    // Some heavy operation
    return processData();
});
console.log(`Operation took ${time}ms`);

// Memoize function
Utils.memoize(func)
// Caches results based on arguments

// Example
const expensiveCalc = Utils.memoize((n) => {
    // Heavy calculation
    return fibonacci(n);
});
```

## Best Practices

1. **Always handle errors in callbacks**
   ```javascript
   Utils.ajax(options, successHandler, errorHandler);
   ```

2. **Use appropriate validation methods**
   ```javascript
   if (!Utils.isNullOrEmpty(value)) { /* proceed */ }
   ```

3. **Leverage LINQ methods for arrays**
   ```javascript
   const result = array.where(x => x.active).orderBy(x => x.name);
   ```

4. **Use debounce for search inputs**
   ```javascript
   const search = Utils.delayedSearch(handler, 300);
   ```

5. **Clean up objects to prevent memory leaks**
   ```javascript
   Utils.cleanObject(largeObject, true);
   ```