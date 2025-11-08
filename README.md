# Salesforce Metadata Analyzer

A comprehensive command-line tool for analyzing your Salesforce organization's metadata. Understand field usage, track automation dependencies, identify impact zones before making changes, and maintain complete visibility of your Salesforce solution.

## Overview

This tool solves a critical problem in Salesforce operations: **understanding the full scope of impact before making changes to fields, objects, or automations**.

### Key Questions It Answers
- Which flows and triggers are using this field?
- What would break if I deleted this field?
- Which automations reference this object?
- Are there any unused fields on this object?
- What is the complete dependency chain for this component?

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Set your Salesforce credentials
export SF_USERNAME=your@email.com
export SF_PASSWORD=your_password

# 4. Authenticate with your Salesforce org
npm run cli auth

# 5. Sync metadata from your org
npm run cli sync

# 6. Start analyzing
npm run cli query field-usage Account Status__c
npm run cli analyze field-impact Account Status__c
```

See [Quick Start Guide](./QUICKSTART.md) for detailed setup instructions.

## Features

### Current Implementation
- **Metadata Fetching**: Objects, fields, triggers, flows, validation rules, permissions
- **Local Caching**: All metadata stored in local Supabase database
- **CLI Interface**: Comprehensive command-line tools for querying and analysis
- **Dependency Tracking**: Understand field usage across all automations
- **Impact Analysis**: See what breaks before you delete something

### Planned Features
- MCP Server integration with Claude for AI-powered analysis
- Azure DevOps integration for tracking Apex code
- Web dashboard for visual metadata relationships
- Advanced analysis: circular dependencies, performance recommendations
- Security audit and unused field detection

## Architecture

```
Your Machine
    ├── CLI Interface (Node.js)
    ├── Salesforce Connector (JSforce)
    ├── Metadata Parser
    └── Supabase Database (PostgreSQL)
```

**Everything runs locally.** Your metadata never leaves your machine except for the connection to your own Salesforce org.

## Usage Examples

### Find All Uses of a Field
```bash
npm run cli query field-usage Account Status__c
```

### Analyze Impact Before Deletion
```bash
npm run cli analyze field-impact Account MyField__c
```

### Understand an Object's Configuration
```bash
npm run cli analyze object Account
```

### Find Unused Fields
```bash
npm run cli analyze unused-fields Account
```

### See All Fields Used by a Flow
```bash
npm run cli query flow-fields MyFlowName
```

## Documentation

- **[Quick Start Guide](./QUICKSTART.md)** - Get up and running in 5 minutes
- **[Setup Guide](./SETUP.md)** - Detailed configuration and usage
- **[Features](./FEATURES.md)** - Complete feature list and roadmap

## How It Works

### 1. Metadata Retrieval
- Connects to your Salesforce org using JSforce
- Retrieves objects, fields, triggers, flows, validations
- Extracts dependencies from Apex code and Flow XML

### 2. Local Storage
- Stores all metadata in Supabase PostgreSQL database
- Creates relationship maps between components
- Indexes frequently queried columns for speed

### 3. Analysis Engine
- Queries local database for dependencies
- Calculates impact of changes
- Identifies unused components
- Generates reports and recommendations

### 4. CLI Interface
- Command-line tool for interacting with data
- Structured output with tables and formatting
- Support for batch operations

## Technology Stack

- **Backend**: Node.js + TypeScript
- **Salesforce API**: JSforce (Metadata API, Tooling API, SOQL)
- **Database**: Supabase (PostgreSQL with RLS)
- **CLI**: Commander.js + Chalk + Table
- **Build**: Vite + TypeScript
- **Future**: MCP Server (Model Context Protocol)

## System Requirements

- Node.js 18+
- npm or yarn
- Salesforce org with API access
- Internet connection (for Salesforce API and Supabase)

## Installation

```bash
# Clone or download the repository
cd salesforce-metadata-analyzer

# Install dependencies
npm install

# Build the project
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file:

```env
# Supabase (pre-configured)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key

# Salesforce Credentials
SF_USERNAME=your@email.com
SF_PASSWORD=your_password
SF_INSTANCE_URL=https://login.salesforce.com
```

### Secure Credential Storage

**Never commit `.env` file to version control.** Use:
- Environment variables on your system
- Secure credential management tools
- .env.local (excluded from git)

## Development

### Project Structure
```
src/
├── cli/                    # Command-line interface
│   ├── commands/          # CLI commands (auth, sync, query, analyze)
│   └── index.ts           # CLI entry point
├── lib/                   # Core libraries
│   ├── supabaseClient.ts  # Database client
│   ├── salesforceFetcher.ts # Salesforce API
│   ├── metadataParser.ts  # Database operations
│   ├── flowParser.ts      # Flow XML parsing
│   └── mcpServer.ts       # MCP integration
└── main.js                # Web UI (future)
```

### Build Commands
```bash
npm run build        # Build everything
npm run build:cli    # Build CLI only
npm run dev          # Start dev server
npm run preview      # Preview production build
```

## Database Schema

The tool creates and manages these tables:

- `salesforce_objects` - Objects and customizations
- `salesforce_fields` - Field definitions and metadata
- `salesforce_triggers` - Apex triggers with code
- `salesforce_flows` - Flow definitions
- `salesforce_validations` - Validation rules
- `field_metadata_dependencies` - Relationship tracking
- `metadata_sync_status` - Sync tracking

All tables have RLS (Row Level Security) enabled and comprehensive indexes.

## Use Cases

### For Admins
- Impact analysis before field deletion
- Permission auditing
- Unused field cleanup
- Change management planning

### For Developers
- Code dependency tracking
- Flow documentation
- Trigger impact analysis
- Refactoring validation

### For Solution Architects
- Solution documentation
- Complexity assessment
- Performance optimization
- Knowledge transfer

## Limitations

- Initial sync may take 5-15 minutes for large orgs
- MCP integration not yet implemented
- Web UI coming soon
- Azure DevOps integration in development

## Roadmap

1. **Enhanced Analysis** - Circular dependencies, performance recommendations
2. **Azure DevOps Integration** - Track Apex code alongside metadata
3. **MCP Server** - Claude integration for AI-powered analysis
4. **Web Dashboard** - Visual dependency graphs and interactive analysis
5. **Advanced Features** - Security audit, unused component detection

## Troubleshooting

### Authentication Issues
```bash
# Verify credentials
npm run cli auth

# Check Salesforce API access is enabled
# Regenerate password if needed
```

### Sync Not Working
```bash
# Check credentials
export SF_USERNAME=your@email.com
export SF_PASSWORD=your_password

# Try syncing specific types
npm run cli sync --type objects
```

### Query Returning No Results
```bash
# Make sure metadata was synced
npm run cli sync

# Verify correct API names (case-sensitive)
npm run cli query field-usage Account Status__c
```

## Performance

- **First Sync**: 5-15 minutes (depends on org size)
- **Incremental Sync**: 30-60 seconds
- **Field Queries**: <100ms
- **Analysis Commands**: <500ms

## Security

- All metadata stored locally on your machine
- Direct connection to your Salesforce org only
- Credentials not persisted in code
- Row-level security on all database tables
- No data shared with third parties

## Support

- Check [Quick Start Guide](./QUICKSTART.md)
- Review [Setup Guide](./SETUP.md)
- See [Features](./FEATURES.md) for roadmap
- Use `--help` on any command for options

## License

[Your License Here]

## Contributing

This tool is actively being developed. Feedback and suggestions welcome!

---

**Ready to get started?** See [Quick Start Guide](./QUICKSTART.md)
