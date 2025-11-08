# Features - Salesforce Metadata Analyzer

## Currently Implemented

### Core Metadata Management

#### Metadata Fetching
- **Objects**: Retrieves both custom and standard objects from your Salesforce org
- **Fields**: Extracts all field metadata including type, labels, formulas, default values
- **Triggers**: Fetches Apex trigger code and metadata
- **Flows**: Retrieves Flow definitions and XML metadata
- **Validation Rules**: Extracts validation rule formulas and configurations
- **Permission Sets**: Gathers permission and access control information

#### Local Storage
- All metadata cached in Supabase PostgreSQL database
- Incremental sync only updates changed items
- Sync status tracking with timestamps and error logging
- Efficient indexing for fast queries

### CLI Commands

#### Authentication (`auth`)
```bash
npm run cli auth --username <email> --password <password>
```
- Validates connection to Salesforce org
- Tests API access permissions
- Displays connection status

#### Sync (`sync`)
```bash
npm run cli sync [--type objects|fields|triggers|flows|all]
```
- Retrieves metadata from Salesforce org
- Stores in local database
- Type filtering for incremental syncs
- Progress tracking and error reporting

#### Query Commands

**Field Usage**
```bash
npm run cli query field-usage <object> <field>
```
- Shows all triggers using the field
- Lists all flows using the field
- Identifies validation rules referencing the field
- Shows context and usage location

**Flow Fields**
```bash
npm run cli query flow-fields <flowName>
```
- Lists all fields referenced in a flow
- Shows object context for each field
- Displays dependency type
- Useful for understanding flow impact

**Trigger Fields**
```bash
npm run cli query trigger-fields <triggerName>
```
- Lists all fields accessed by a trigger
- Shows field reference context
- Helps understand trigger dependencies

#### Analysis Commands

**Object Analysis**
```bash
npm run cli analyze object <objectName>
```
- Lists all custom fields on object
- Shows associated triggers
- Displays field types and requirements
- Summary of object configuration

**Field Impact Analysis**
```bash
npm run cli analyze field-impact <object> <field>
```
- Shows all components using the field
- Breaks down by component type (trigger, flow, validation)
- Displays warning with component count
- Critical for impact assessment before changes

**Unused Fields Detection**
```bash
npm run cli analyze unused-fields <objectName>
```
- Identifies fields not used in automations
- Helps find unused custom fields
- Useful for cleanup efforts
- Note: Doesn't include page layout or record type usage

### Database Features

#### Metadata Tables
- Normalized schema for efficient queries
- Full-text search capabilities
- Relationship tracking between components
- Comprehensive indexes on frequently queried columns

#### RLS Security
- Row-level security enabled on all tables
- Local app policies for all operations
- Data isolation and access control
- Protection against unauthorized access

#### Dependency Tracking
- Links fields to triggers, flows, and validations
- Captures usage context
- Tracks dependency type (reference, formula, etc.)
- Enables impact analysis

## Planned Features

### Phase 1: Enhanced Analysis
- **Circular Dependency Detection**: Identify trigger chains and workflow loops
- **Performance Recommendations**: Suggest optimizations based on metadata analysis
- **Field Classification**: Auto-categorize fields by usage pattern
- **Change Tracking**: History of metadata changes over time

### Phase 2: Azure DevOps Integration
- **Repository Import**: Clone Apex code from Azure DevOps
- **Code Analysis**: Parse custom code for field references
- **Version Control Integration**: Link code commits to metadata changes
- **Developer Attribution**: Track who created/modified components

### Phase 3: MCP Server Integration
- **Claude Integration**: Ask questions about your Salesforce metadata
- **Natural Language Queries**: "Which flows use the Account Status field?"
- **Intelligent Analysis**: AI-powered recommendations
- **Report Generation**: Auto-generate change impact reports

### Phase 4: Web UI
- **Dashboard**: Visual representation of metadata relationships
- **Interactive Dependency Graph**: Visualize component connections
- **Change Preview**: See impact before deployment
- **Permission Analyzer**: Visual permission matrix
- **Search Interface**: Enhanced metadata search

### Phase 5: Advanced Features
- **Unused Component Detection**: Find unused flows, triggers, validation rules
- **Complexity Scoring**: Rate component complexity
- **Performance Analysis**: Identify performance bottlenecks
- **Security Audit**: Find overly permissive field access
- **Deployment Simulator**: Test change impact before deployment

## API/Integration Points

### Salesforce Connections
- **Metadata API**: Full metadata retrieval
- **Tooling API**: Real-time component dependencies
- **SOQL**: Query standard object metadata

### Database (Supabase)
- All operations via Supabase client
- GraphQL support available for advanced queries
- Real-time subscriptions for live updates
- Full PostgreSQL feature set

### MCP Server (Future)
- Tool definitions for Claude integration
- Resource definitions for metadata access
- Request handling for AI queries
- Streaming responses for large datasets

## Performance Characteristics

### Sync Times
- **First Sync**: 5-15 minutes (depends on org size)
- **Incremental Sync**: 30-60 seconds (typical)
- **Field Count**: ~10,000-50,000 fields in large orgs
- **Trigger Count**: ~100-500 triggers typical

### Query Performance
- **Field Usage Query**: <100ms
- **Object Analysis**: <500ms
- **Dependency Lookup**: <200ms
- **Search Operations**: <1 second

### Storage
- **Metadata Database**: 50MB-500MB (depends on org)
- **All data stored locally** in Supabase
- **No data sent** to external services

## Data Privacy

### Local Storage
- All Salesforce metadata cached locally
- Supabase database runs in your account
- Your credentials never stored in code
- Automatic cleanup of sync errors

### Network
- Direct connection to your Salesforce org only
- No third-party metadata calls
- Optional future MCP integration is configurable
- All processing happens locally

## Command Reference

### Help System
```bash
npm run cli --help
npm run cli auth --help
npm run cli sync --help
npm run cli query --help
npm run cli analyze --help
```

### Global Options
- `-h, --help`: Show help for command
- `-v, --version`: Show version number

### Common Patterns
```bash
# Set credentials once
export SF_USERNAME=you@company.com
export SF_PASSWORD=your_password

# Then run commands without flags
npm run cli auth
npm run cli sync
npm run cli query field-usage Account Status__c
```

## Limitations & Known Issues

### Current Limitations
- MCP server integration not yet implemented
- Azure DevOps integration planned for Phase 2
- No web UI (CLI only for now)
- Limited to Metadata API capabilities
- Page layout field associations not tracked

### Known Issues
- Large orgs (10,000+ fields) may take extended time to sync
- Some custom field types may not parse correctly
- Flow XML parsing is basic (element-level only)
- Trigger code analysis is pattern-based

## Support & Documentation

- **Quick Start**: See `QUICKSTART.md`
- **Detailed Setup**: See `SETUP.md`
- **Architecture**: See this document
- **Command Help**: Use `--help` flag on any command

## Roadmap

1. **Week 1**: Core CLI features (COMPLETED)
2. **Week 2**: Enhanced analysis commands
3. **Week 3**: Azure DevOps integration
4. **Week 4**: MCP server implementation
5. **Week 5**: Web dashboard

## Feedback & Contributions

Currently in active development. Features planned based on usage patterns and feedback.
