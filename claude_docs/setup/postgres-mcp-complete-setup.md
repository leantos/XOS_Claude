# PostgreSQL MCP Server Setup for Claude Code on Windows

A complete, tested guide for setting up PostgreSQL MCP server with Claude Code on Windows. This method has been verified to work correctly.

## Prerequisites

- **Windows 10/11**
- **Python 3.12+** installed
- **PostgreSQL database** running locally or remotely
- **Claude Code CLI** installed and working
- Database credentials (username, password, database name)

## Step-by-Step Installation

### Step 1: Install Python (if not already installed)

1. Check if Python is installed:
```bash
python --version
```

2. If not installed, download from [python.org](https://python.org)
   - Choose Python 3.12 or higher
   - Check "Add Python to PATH" during installation

### Step 2: Install pipx Package Manager

pipx allows you to install Python applications in isolated environments.

```bash
# Install pipx using pip
python -m pip install --user pipx

# Add pipx to your PATH
python -m pipx ensurepath
```

**Important**: After running `ensurepath`, you may need to:
- Close and reopen your terminal
- Or restart your computer for PATH changes to take effect

### Step 3: Install postgres-mcp Server

```bash
# Install the postgres-mcp server globally
python -m pipx install postgres-mcp

# Verify installation
postgres-mcp --help
```

You should see help output showing available options like `--access-mode` and `--transport`.

### Step 4: Configure Claude Code with Your Database

This is the **critical step** that makes everything work. You must use the Claude Code CLI command, NOT manual configuration:

```bash
claude mcp add postgres --env DATABASE_URI=postgresql://USERNAME:PASSWORD@HOST:PORT/DATABASE -- postgres-mcp --access-mode=unrestricted
```

**Example with real values:**
```bash
claude mcp add postgres --env DATABASE_URI=postgresql://postgres:admin@localhost:5432/CVS -- postgres-mcp --access-mode=unrestricted
```

**Important Notes:**
- Replace `USERNAME`, `PASSWORD`, `HOST`, `PORT`, and `DATABASE` with your actual values
- Database names are **case-sensitive** on Windows (use `CVS` not `cvs`)
- Use `--access-mode=unrestricted` for development
- Use `--access-mode=restricted` for production (read-only)

### Step 5: Verify Configuration

Check that the MCP server is configured correctly:

```bash
claude mcp list
```

You should see output like:
```
Checking MCP server health...
postgres: postgres-mcp --access-mode=unrestricted - ✓ Connected
```

### Step 6: Restart Claude Code

**This step is mandatory!** Claude Code must be restarted to load the MCP tools.

1. Close Claude Code completely
2. Start Claude Code again
3. Resume or start a new conversation

### Step 7: Test the Connection

After restarting, test by asking Claude:
- "List all tables in my database"
- "Show me the database schemas"
- "Check database health"

## Configuration Details

### Where Configuration is Stored

The configuration is automatically saved to:
- **Windows**: `C:\Users\%USERNAME%\.claude.json`
- **Project-specific**: Can also be in `.mcp.json` in project root

### Environment Variables (Optional)

For additional configuration, create a `.env` file in your project:

```env
# PostgreSQL MCP Configuration
DATABASE_URI=postgresql://postgres:admin@localhost:5432/CVS
ACCESS_MODE=unrestricted
```

## Available MCP Tools

Once configured, these tools become available in Claude Code:

| Tool | Description | Example Usage |
|------|-------------|---------------|
| `list_schemas` | List all database schemas | "Show me all schemas" |
| `list_objects` | List tables, views, sequences | "List all tables in public schema" |
| `get_object_details` | Get table structure | "Show me the columns in users table" |
| `execute_sql` | Run SQL queries | "Select all users created today" |
| `explain_query` | Analyze query performance | "Explain this query's execution plan" |
| `get_top_queries` | Find slow queries | "What are the slowest queries?" |
| `analyze_workload_indexes` | Recommend indexes | "Suggest indexes for my database" |
| `analyze_db_health` | Health check | "Check database health" |

## Troubleshooting

### Issue: "postgres-mcp not found"

**Solution**: PATH not updated after pipx installation
```bash
# Manually run pipx ensurepath again
python -m pipx ensurepath

# Then restart your terminal
```

### Issue: "Database 'xyz' does not exist"

**Solution**: Database names are case-sensitive on Windows
- Check exact database name: Use `CVS` not `cvs`
- Verify with: `psql -U postgres -l`

### Issue: MCP tools not available in Claude Code

**Solution**: Must restart Claude Code after configuration
1. Run `claude mcp add` command
2. Completely close Claude Code
3. Start Claude Code fresh
4. Start NEW conversation (not resume)

### Issue: "Connection refused" or timeout

**Solution**: PostgreSQL not running or firewall blocking
```bash
# Check if PostgreSQL is running
tasklist | findstr postgres

# Check PostgreSQL is listening on correct port
netstat -an | findstr 5432
```

### Issue: Authentication failed

**Solution**: Verify credentials
```bash
# Test connection directly
psql -h localhost -U postgres -d CVS
```

## Security Considerations

### For Development
- Use `--access-mode=unrestricted` for full access
- Keep connection strings in `.env` files
- Add `.env` to `.gitignore`

### For Production
- Use `--access-mode=restricted` (read-only)
- Create dedicated read-only database user
- Never commit credentials to version control
- Consider using environment variables or secrets management

## Quick Setup Script

For automated setup, use the provided PowerShell script:

```powershell
.\claude_docs\setup\install-postgres-mcp.ps1
```

This script will:
1. Check Python installation
2. Install pipx if needed
3. Install postgres-mcp
4. Configure Claude Code
5. Test the connection

## Common Commands

```bash
# List configured MCP servers
claude mcp list

# Remove MCP server
claude mcp remove postgres

# Re-add with different database
claude mcp add postgres --env DATABASE_URI=postgresql://user:pass@host:port/newdb -- postgres-mcp --access-mode=restricted

# Check postgres-mcp version
pipx list

# Upgrade postgres-mcp
python -m pipx upgrade postgres-mcp

# Uninstall postgres-mcp
python -m pipx uninstall postgres-mcp
```

## Important Notes

1. **One Installation, Multiple Projects**: postgres-mcp is installed globally but each project can have different connection strings

2. **Claude Code vs Claude Desktop**: This guide is specifically for Claude Code. Claude Desktop uses different configuration

3. **Windows Specifics**:
   - Use backslashes or forward slashes in paths
   - Database names are case-sensitive
   - May need to run terminal as Administrator for some operations

4. **Restart Required**: Always restart Claude Code after configuration changes

## Verification Checklist

- [ ] Python 3.12+ installed
- [ ] pipx installed and in PATH
- [ ] postgres-mcp installed via pipx
- [ ] Database connection string configured
- [ ] `claude mcp list` shows "✓ Connected"
- [ ] Claude Code restarted
- [ ] MCP tools available in new conversation

## Support

If you encounter issues:
1. Check this guide's troubleshooting section
2. Verify all prerequisites are met
3. Ensure Claude Code is fully restarted
4. Try with a fresh conversation (not resumed)

---

*Last tested: January 2025 | Claude Code on Windows 11 | PostgreSQL 17 | postgres-mcp 0.3.0*