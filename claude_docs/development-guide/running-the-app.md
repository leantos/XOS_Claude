# Running the Restaurant Management Application

## Prerequisites

### Required Software
- **Node.js** (v14+ recommended)
- **npm** (comes with Node.js)
- **.NET SDK 8.0** or later
- **PostgreSQL** (v12+ recommended)
- **Git** (for version control)

### Database Setup
- PostgreSQL running on `localhost:5432`
- Database name: `Restaurant`
- Username: `postgres`
- Password: `admin`

## Initial Setup (First Time Only)

### 1. Database Setup
```sql
-- Connect to PostgreSQL and create database
CREATE DATABASE Restaurant;

-- Run the schema creation script
-- Execute: Documents/DB/create_tables.sql

-- IMPORTANT: Set password hashes to match your chosen passwords
-- BCrypt works with ANY password - just needs the hash to match!
-- 
-- Option 1: Use this hash for password 'admin123'
UPDATE users 
SET password = '$2a$11$xiOh0GwIu6Wn1EwZLM4.0.jnbh.FNI3gUTqKxnlWE9K1tbxRPlKOG' 
WHERE username IN ('admin', 'manager', 'staff');

-- Option 2: Generate your own hash for ANY password you prefer
-- Use: GET http://localhost:5000/api/test/hash (modify TestController)
-- Or use any online BCrypt generator
```

### 2. Backend Dependencies
```bash
cd Restaurant.WebApi
dotnet restore
dotnet build
```

### 3. Frontend Dependencies
```bash
cd Restaurant.WebApi/UIPages
npm install
```

## Starting the Application

### Step 1: Start the Backend API
```bash
cd Restaurant.WebApi
dotnet run
```
- Runs on: `http://localhost:5000`
- Wait for: `Now listening on: http://localhost:5000`

### Step 2: Start the Frontend
Open a new terminal:
```bash
cd Restaurant.WebApi/UIPages
npm start
```
- Runs on: `http://localhost:3001`
- Browser should open automatically

## Login Credentials

**Default example** (if using the provided hash):
- **Username**: `admin` (or `manager` or `staff`)
- **Password**: `admin123`
- **Owner**: Select any from dropdown

**Custom passwords**: 
- Use ANY password you want!
- Just generate the BCrypt hash for it
- Update the database with your hash
- BCrypt will verify it perfectly

## Application Flow

1. **Login Page** (`http://localhost:3001`)
   - Enter credentials
   - Click "Login"

2. **Restaurant Selection**
   - Choose a restaurant
   - Click "Continue"

3. **Dashboard**
   - Main application interface
   - Currently shows placeholder

## Common Issues & Solutions

### Port Already in Use

#### Frontend (Port 3001)
```bash
# Windows - Find and kill process
netstat -ano | findstr :3001
taskkill //PID [PID_NUMBER] //F

# Then restart
cd Restaurant.WebApi/UIPages
npm start
```

#### Backend (Port 5000)
```bash
# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill //PID [PID_NUMBER] //F

# Then restart
cd Restaurant.WebApi
dotnet run
```

### Login Fails with "Invalid username or password"

**Cause**: BCrypt hash in database doesn't match your entered password

**Understanding BCrypt**:
- BCrypt is one-way hashing (NOT encryption/decryption)
- ANY password works perfectly with BCrypt
- Just needs the stored hash to match the entered password

**Solutions**:

1. **Quick Fix - Use 'admin123'**:
```sql
UPDATE users 
SET password = '$2a$11$xiOh0GwIu6Wn1EwZLM4.0.jnbh.FNI3gUTqKxnlWE9K1tbxRPlKOG' 
WHERE username IN ('admin', 'manager', 'staff');
```

2. **Custom Password - Generate your own hash**:
   - Choose ANY password you want
   - Generate BCrypt hash using online tool or test endpoint
   - Update database with YOUR generated hash
   - Login will work perfectly!

### XOS Components Not Visible

**Cause**: Missing theme.css import

**Solution**: Ensure `App.js` contains:
```javascript
import './assets/css/theme.css';
```

### "Cannot set property Data of VMBase"

**Cause**: Incorrect ViewModel initialization

**Solution**: Use direct property assignment:
```javascript
// CORRECT
this.Data.property = value;

// WRONG
this._____state = { };
```

### Backend Build Errors

**Issue**: "The process cannot access the file"

**Solution**:
1. Kill all dotnet processes
2. Delete `bin` and `obj` folders
3. Rebuild:
```bash
dotnet clean
dotnet build
dotnet run
```

## Development Tips

### Hot Reload
- **Frontend**: Automatic with `npm start`
- **Backend**: Use `dotnet watch run` for auto-restart

### Debugging

#### Frontend (Browser DevTools)
1. Open Chrome DevTools (F12)
2. Go to Sources tab
3. Find your file in `webpack://./src/`
4. Set breakpoints

#### Backend (Visual Studio/VS Code)
1. Open project in IDE
2. Set breakpoints in code
3. Press F5 to start debugging

### API Testing
Test backend endpoints directly:
```bash
# Test login
curl -X POST http://localhost:5000/api/auth/sign-in \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","clientReference":"DEFAULT"}'

# Test auth validation (requires token)
curl http://localhost:5000/api/auth/validate \
  -H "Authorization: Bearer [TOKEN]"
```

## Project Structure Overview

```
Restaurant/
├── Restaurant.WebApi/          # Backend (.NET Core)
│   ├── Controllers/           # API endpoints
│   ├── Services/             # Business logic
│   ├── Domain/               # Data models
│   └── UIPages/              # Frontend (React)
│       ├── src/
│       │   ├── components/   # React components
│       │   ├── xos-components/ # XOS framework
│       │   └── assets/       # CSS, images
│       └── package.json
├── Restaurant.Transaction/    # Shared library
└── Documents/
    └── DB/                   # Database scripts
```

## XOS Framework Notes

### Key Patterns
1. **MVVM Architecture**: Every component needs a ViewModel
2. **Direct Data Assignment**: Use `this.Data.prop = value`
3. **Update UI**: Call `this.updateUI()` after state changes
4. **Theme CSS**: Required for component visibility

### Component Creation
```javascript
// ViewModel (ComponentVM.js)
export default class ComponentVM extends VMBase {
    constructor(props) {
        super(props);
        if (Object.keys(this.Data).length !== 0) return;
        
        this.Data.myProperty = 'initial value';
    }
}

// Component (Component.jsx)
export default class Component extends cntrl.XOSComponent {
    constructor(props) {
        super(props, new ComponentVM(props));
    }
}
```

## Useful Commands Reference

### Database
```bash
# Connect to PostgreSQL
psql -U postgres -d Restaurant

# Backup database
pg_dump -U postgres Restaurant > backup.sql

# Restore database
psql -U postgres Restaurant < backup.sql
```

### Git
```bash
# Check status
git status

# Stage and commit
git add .
git commit -m "Description of changes"

# Push to remote
git push origin main
```

### NPM
```bash
# Install new package
npm install package-name

# Update packages
npm update

# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix
```

## Environment Variables

### Backend (.NET)
Create `appsettings.Development.json`:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=Restaurant;Username=postgres;Password=admin"
  },
  "Jwt": {
    "Key": "your-secret-key-here",
    "Issuer": "Restaurant.WebApi",
    "Audience": "Restaurant.Client"
  }
}
```

### Frontend (React)
Create `.env`:
```
REACT_APP_API_URL=http://localhost:5000
```

## Production Deployment Notes

For production deployment:
1. Update connection strings
2. Set proper JWT secrets
3. Enable HTTPS
4. Configure CORS properly
5. Build optimized versions:
   ```bash
   # Backend
   dotnet publish -c Release
   
   # Frontend
   npm run build
   ```

---

Last Updated: 2025-08-12