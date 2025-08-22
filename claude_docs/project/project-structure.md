# Generic Project Structure

## Overview
This document defines the standard project structure that should be used consistently across all projects using the XOS framework and .NET architecture. Replace `{ProjectName}` with your actual project name.

## Complete Project Structure

```
{ProjectName}/
├── .sln                                    # Solution File
├── CLAUDE.md                               # Claude Code context file
├── README.md                               # Project documentation
│
├── {ProjectName}.WebApi/                   # Web API Project
│   ├── {ProjectName}.WebApi.csproj        # Project file
│   ├── Program.cs                         # Application entry point
│   ├── appsettings.json                   # Configuration
│   ├── appsettings.Development.json       # Dev configuration
│   │
│   ├── Controllers/                       # API Controllers
│   │   ├── AuthController.cs             # Authentication
│   │   ├── {Entity}Controller.cs         # Entity-specific controllers
│   │   └── XOSBaseController.cs          # Base controller class
│   │
│   ├── Domain/                           # Web API Domain Models
│   │   ├── AppClaims.cs                 # Application claims
│   │   ├── AppConstants.cs              # Application constants
│   │   ├── Token.cs                     # Token models
│   │   └── {Entity}Info.cs              # Entity info models
│   │
│   ├── Services/                         # Web API Services
│   │   ├── Interfaces/                  # Service interfaces
│   │   │   ├── ITokenStoreService.cs
│   │   │   └── ITokenValidatorService.cs
│   │   ├── TokenStoreService.cs         # Token management
│   │   ├── TokenValidatorService.cs     # Token validation
│   │   └── SignalRNotifierService.cs    # Real-time notifications
│   │
│   ├── Extensions/                       # Service Extensions
│   │   └── ServiceExtensions.cs         # DI configuration
│   │
│   ├── SignalR/                         # Real-time Communication
│   │   └── NotificationsHub.cs          # SignalR hub
│   │
│   ├── Files/                           # File Storage
│   │   └── DB File/                    # Local database files
│   │
│   ├── UIPages/                         # Frontend Application
│   │   ├── package.json                 # NPM dependencies
│   │   ├── README.md                    # Frontend documentation
│   │   │
│   │   ├── public/                      # Static Files
│   │   │   ├── index.html              # Entry HTML
│   │   │   ├── config.json             # Frontend config
│   │   │   ├── manifest.json           # PWA manifest
│   │   │   ├── favicon.ico             # Favicon
│   │   │   ├── fonts/                  # Web fonts
│   │   │   └── images/                 # Static images
│   │   │
│   │   ├── src/                        # Source Code
│   │   │   ├── index.js               # React entry point
│   │   │   ├── App.js                 # Main App component
│   │   │   ├── App.css                # App styles
│   │   │   │
│   │   │   ├── components/            # React Components
│   │   │   │   ├── Common/           # Shared components
│   │   │   │   │   ├── Login/       # Login component
│   │   │   │   │   ├── Header/      # Header component
│   │   │   │   │   ├── Footer/      # Footer component
│   │   │   │   │   └── Main/        # Main layout
│   │   │   │   ├── General/         # Master/Config modules
│   │   │   │   │   └── {MODULE}/    # Module folder
│   │   │   │   │       ├── index.jsx        # Component
│   │   │   │   │       ├── {MODULE}VM.js    # ViewModel
│   │   │   │   │       └── index.css        # Styles
│   │   │   │   ├── Transaction/     # Transaction modules
│   │   │   │   ├── Reports/         # Report modules
│   │   │   │   └── Controls/        # Reusable controls
│   │   │   │
│   │   │   ├── xos-components/      # XOS Component Library
│   │   │   │   ├── Core/           # Core Framework
│   │   │   │   │   ├── ApiManager.js
│   │   │   │   │   ├── SessionManager.js
│   │   │   │   │   └── SignalRManager.js
│   │   │   │   ├── Utils/          # Utilities
│   │   │   │   │   ├── Utils.js
│   │   │   │   │   └── xos.linq.js
│   │   │   │   ├── XOSComponent.js # Base component
│   │   │   │   ├── VMBase.js       # ViewModel base
│   │   │   │   ├── XOSStateManager.js
│   │   │   │   ├── AsyncLoader.js
│   │   │   │   └── XOS{Component}/ # Individual components
│   │   │   │       ├── index.js
│   │   │   │       └── index.css
│   │   │   │
│   │   │   ├── assets/             # Assets
│   │   │   │   ├── css/           # Compiled CSS
│   │   │   │   │   └── theme.css
│   │   │   │   └── images/        # Images
│   │   │   │
│   │   │   ├── scss/              # SCSS Source
│   │   │   │   ├── theme.scss    # Main theme
│   │   │   │   ├── mixins/       # SCSS mixins
│   │   │   │   └── _{component}.scss
│   │   │   │
│   │   │   └── fonts/             # Custom fonts
│   │   │
│   │   └── build/                 # Build output
│   │
│   └── wwwroot/                   # Static Web Content
│       └── (Published frontend files)
│
├── {ProjectName}.Transaction/     # Business Logic Layer
│   ├── {ProjectName}.Transaction.csproj
│   │
│   ├── Core/                     # Core Base Classes
│   │   └── XOSServiceBase.cs    # Service base class
│   │
│   ├── Domain/                   # Business Domain Models
│   │   ├── BaseObject.cs        # Base entity
│   │   └── {Entity}.cs          # Domain entities
│   │
│   ├── Interfaces/               # Service Contracts
│   │   └── I{Entity}Service.cs  # Service interfaces
│   │
│   ├── Services/                 # Business Logic Services
│   │   └── {Entity}Service.cs   # Service implementations
│   │
│   ├── Extensions/               # Business Extensions
│   │   └── ServiceExtensions.cs
│   │
│   └── Utils/                    # Utility Classes
│       └── {Utility}Utils.cs
│
├── Documents/                    # Project Documentation
│   └── DB/                      # Database Scripts
│       └── Schema.sql           # Database schema
│
└── claude_docs/                 # Claude Code Documentation
    ├── automation/              # Automation & Subagents
    │   ├── subagent-catalog.md
    │   └── subagent-patterns.md
    ├── backend/                 # Backend Documentation
    │   ├── backend-blueprint.md
    │   └── API_ROUTES.md
    ├── database/                # Database Documentation
    │   ├── DATABASE_SCHEMA.md
    │   └── schema_design.md
    ├── frontend/                # Frontend Documentation
    │   ├── frontend-blueprint.md
    │   ├── xos-components-reference.md
    │   └── xos-framework.md
    ├── project/                 # Project Standards
    │   ├── PROJECT_STRUCTURE.md (this file)
    │   ├── NAMING_CONVENTIONS.md
    │   ├── ASSET_STRUCTURE.md
    │   └── MODULE_MAP.md
    ├── security/                # Security Documentation
    │   └── SECURITY_RULES.md
    └── testing/                 # Testing Documentation
        ├── backend-testing-guide.md
        └── frontend-testing-guide.md
```

## Module Structure Pattern

### Frontend Modules
Each module follows this structure:
```
{ModuleCode}/
├── index.jsx            # React component
├── {ModuleCode}VM.js    # ViewModel
└── index.css           # Module styles (optional)
```

### Module Types
- **General/Master**: Configuration and setup modules
- **Transaction**: Business operation modules
- **Reports**: Analytics and reporting modules

## Naming Conventions

### Projects
- Solution: `{ProjectName}.sln`
- Web API: `{ProjectName}.WebApi`
- Business Layer: `{ProjectName}.Transaction`

### Files
- Controllers: `{Entity}Controller.cs`
- Services: `{Entity}Service.cs`
- Interfaces: `I{Entity}Service.cs`
- Domain Models: `{Entity}.cs`
- ViewModels: `{ModuleCode}VM.js`

### Modules
- Pattern: `{PREFIX}{TYPE}{NUMBER}`
- Example: `PROJ_M001` (Master), `PROJ_T001` (Transaction), `PROJ_R001` (Report)

## Key Directories Explained

### Backend Structure
- **Controllers/**: HTTP request handlers
- **Domain/**: Data models and entities
- **Services/**: Business logic implementation
- **Interfaces/**: Service contracts
- **Extensions/**: DI and configuration extensions

### Frontend Structure
- **components/**: React components organized by type
- **xos-components/**: Reusable XOS framework components
- **assets/**: Static resources (CSS, images)
- **scss/**: SCSS source files for theming

### Documentation
- **claude_docs/**: Comprehensive documentation for Claude Code
- **Documents/DB/**: Database scripts and schemas

## Environment-Specific Files

### Development
- `appsettings.Development.json`
- `config.json` (frontend)

### Production
- `appsettings.json`
- `config.release.json` (frontend)

## Build Outputs

### Backend
- `bin/`: Compiled binaries
- `obj/`: Intermediate build files

### Frontend
- `build/`: Production-ready frontend
- `node_modules/`: NPM dependencies

## Best Practices

1. **Consistency**: Always follow this structure for new projects
2. **Modularity**: Keep modules self-contained with their own VM and styles
3. **Separation**: Maintain clear separation between WebApi and Transaction layers
4. **Documentation**: Keep claude_docs updated with project-specific details
5. **Naming**: Follow the naming conventions strictly

## Migration Guide

When creating a new project:

1. Copy this structure
2. Replace all instances of `{ProjectName}` with your project name
3. Replace `{Entity}` with your domain entities
4. Replace `{MODULE}` with your module codes
5. Update the module prefix in naming conventions
6. Customize the claude_docs for your project specifics

## Version Control

### Required Files
- All source code
- Configuration files
- Documentation
- Database scripts

### Ignored Files
- `bin/`
- `obj/`
- `node_modules/`
- `build/`
- `*.user`
- `.vs/`

This structure ensures consistency across projects while maintaining flexibility for project-specific requirements.