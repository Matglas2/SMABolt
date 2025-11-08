# Salesforce Metadata Analyzer - Setup Guide

## Overview

The Salesforce Metadata Analyzer is a comprehensive tool for analyzing your Salesforce organization's metadata. It helps you understand field usage, track automation dependencies, and analyze the impact of changes across your Salesforce solution.

## Architecture

The application consists of four main components:

### 1. Backend (Node.js + JSforce)
- Connects to your Salesforce org using JSforce
- Retrieves metadata for objects, fields, triggers, flows, and validation rules
- Extracts dependencies from Apex code and Flow definitions
- Runs locally on your machine

### 2. Database (Supabase PostgreSQL)
- Stores all metadata locally for fast queries
- Maintains dependency relationships
- Tracks sync status and last update times
- Accessible only from your local machine

### 3. CLI Application
- Command-line interface for interacting with the tool
- Commands for syncing, querying, and analyzing metadata
- Supports batch operations and detailed reporting

### 4. MCP Server (Future)
- Integration with Claude for AI-powered analysis
- Provides tools for Claude to query your metadata
- Enables intelligent question answering about your Salesforce solution

## Prerequisites

- Node.js 18+
- npm or yarn
- Salesforce org with API access enabled
- Supabase account (pre-configured)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the project root (it should already exist with Supabase credentials):

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
SF_USERNAME=your_salesforce_username
SF_PASSWORD=your_salesforce_password
SF_INSTANCE_URL=https://login.salesforce.com
```

**Important**: Store sensitive credentials safely. Consider using environment variables instead of hardcoding in `.env`.

### 3. Build the Project

```bash
npm run build
```

This builds both the web interface and CLI application.

## Usage

### Authentication

Before you can sync metadata, authenticate with your Salesforce org:

```bash
npm run cli auth --username your@email.com --password your_password
```

Or use environment variables:

```bash
SF_USERNAME=your@email.com SF_PASSWORD=your_password npm run cli auth
```

### Syncing Metadata

Sync all metadata from your Salesforce org:

```bash
npm run cli sync --username your@email.com --password your_password
```

Sync specific types:

```bash
npm run cli sync --username your@email.com --password your_password --type objects
npm run cli sync --type fields
npm run cli sync --type triggers
npm run cli sync --type flows
```

### Querying Data

Find where a field is used:

```bash
npm run cli query field-usage Account Status__c
```

Find all fields used by a flow:

```bash
npm run cli query flow-fields MyFlowName
```

Find all fields used by a trigger:

```bash
npm run cli query trigger-fields MyTriggerName
```

### Analysis Commands

Analyze a specific object:

```bash
npm run cli analyze object Account
```

Analyze the impact of changing a field:

```bash
npm run cli analyze field-impact Account Status__c
```

Find unused fields on an object:

```bash
npm run cli analyze unused-fields Account
```

## Database Schema

### Main Tables

**salesforce_objects**
- Stores all custom and standard objects
- Tracks object type and customization status

**salesforce_fields**
- Stores all fields across objects
- Includes field type, formula, default value, etc.

**salesforce_triggers**
- Stores Apex trigger metadata
- Includes trigger code for analysis

**salesforce_flows**
- Stores Flow definitions
- Includes XML metadata for parsing

**field_metadata_dependencies**
- Links fields to all components that use them
- Tracks dependency type and context

**metadata_sync_status**
- Tracks last sync time for each metadata type
- Records any sync errors

## Features

### Current Implementation

- Metadata fetching from Salesforce using JSforce
- Local database storage in Supabase
- Field dependency tracking
- CLI interface with comprehensive commands
- Support for analyzing triggers, flows, and validation rules
- Field impact analysis

### Planned Enhancements

- MCP Server integration with Claude
- Azure DevOps repository integration for Apex code
- Advanced circular dependency detection
- Performance recommendations
- Unused field identification
- Security audit features
- Web UI dashboard

## Workflow Example

### Scenario: Understand Impact Before Deleting a Field

1. **Sync your metadata first:**
   ```bash
   npm run cli sync --username you@company.com --password your_password
   ```

2. **Check field usage:**
   ```bash
   npm run cli analyze field-impact Account MyCustomField__c
   ```

3. **Review the impact report** showing which automations use the field

4. **Make informed decision** about field deletion

## Development

### Project Structure

```
src/
├── cli/
│   ├── index.ts              (CLI entry point)
│   └── commands/
│       ├── auth.ts           (Authentication)
│       ├── sync.ts           (Metadata sync)
│       ├── query.ts          (Query commands)
│       └── analyze.ts        (Analysis commands)
├── lib/
│   ├── supabaseClient.ts     (Database client)
│   ├── salesforceFetcher.ts  (Salesforce API)
│   ├── metadataParser.ts     (Database operations)
│   ├── flowParser.ts         (Flow XML parsing)
│   └── mcpServer.ts          (MCP integration)
└── main.js                   (Web UI entry point)
```

### Building for Production

```bash
npm run build
```

Output:
- `dist/` - Web UI build
- `dist/cli/` - CLI application

## Troubleshooting

### Authentication Fails

- Verify username and password are correct
- Check that API access is enabled in your Salesforce org
- Try resetting your password or generating a new one

### Sync Takes Too Long

- For large orgs, initial sync can take several minutes
- Subsequent syncs only update changed metadata
- Can sync specific types to speed up testing

### Database Connection Issues

- Verify Supabase credentials in `.env`
- Check internet connection
- Ensure Supabase database is running

## Next Steps

1. Run initial metadata sync to populate the database
2. Explore your metadata using query commands
3. Use analysis commands to understand dependencies
4. Set up regular sync schedule for changes
5. Plan integration with Claude for AI-powered analysis

## Support

For issues or questions:
- Check the troubleshooting section
- Review command help: `npm run cli --help`
- Verify environment variables are set correctly
