# Quick Start Guide - Salesforce Metadata Analyzer

## 5-Minute Setup

### Step 1: Install Dependencies
```bash
npm install
npm run build
```

### Step 2: Set Your Credentials

Create or update `.env` file with your Salesforce credentials:

```
SF_USERNAME=your@email.com
SF_PASSWORD=your_password
SF_INSTANCE_URL=https://login.salesforce.com
```

Supabase credentials should already be configured.

### Step 3: Authenticate

```bash
npm run cli auth
```

You should see: "Successfully authenticated with Salesforce!"

### Step 4: Sync Your Metadata

Start with a specific type (faster for first run):

```bash
npm run cli sync --type objects
npm run cli sync --type fields
npm run cli sync --type triggers
npm run cli sync --type flows
```

Or sync everything at once:

```bash
npm run cli sync
```

### Step 5: Start Exploring

Find where a field is used:

```bash
npm run cli query field-usage Account Status__c
```

Analyze object:

```bash
npm run cli analyze object Account
```

Check field impact before deletion:

```bash
npm run cli analyze field-impact Account Status__c
```

## Common Use Cases

### "I need to delete a field but want to check what breaks"

```bash
npm run cli analyze field-impact ObjectName FieldName__c
```

### "Which flows are using this field?"

```bash
npm run cli query flow-fields Account.MyField__c
```

### "Show me all custom fields on this object"

```bash
npm run cli analyze object ObjectName
```

### "Find fields that aren't used in any automation"

```bash
npm run cli analyze unused-fields ObjectName
```

## Data Syncing

The tool caches metadata locally in Supabase. To get the latest changes from Salesforce:

```bash
npm run cli sync --type triggers
```

Or re-sync everything:

```bash
npm run cli sync
```

## Tips

- First sync takes a few minutes depending on org size
- Subsequent syncs are much faster (only changed items)
- Run sync regularly to keep data fresh
- Use specific types to sync only what changed

## Next: Advanced Features

Ready to dive deeper?

- See `SETUP.md` for detailed configuration
- Use `npm run cli --help` for all available commands
- Each command supports `--help` flag for options

```bash
npm run cli sync --help
npm run cli query --help
npm run cli analyze --help
```

## Troubleshooting

**"Authentication failed"**
- Verify credentials are correct
- Check API access is enabled in Salesforce
- Try resetting your password

**"No metadata found"**
- Make sure sync completed successfully
- Check database connection to Supabase
- Try running sync again

**"Command not found"**
- Make sure you built the project: `npm run build`
- Try clearing node_modules and reinstalling: `npm install`

## Architecture Overview

```
Your Local Machine
    ↓
CLI Interface (Node.js)
    ↓
Salesforce Connection (JSforce)
    ↓
Supabase Database (PostgreSQL)
    ↓
Query & Analysis Engine
    ↓
Results
```

Everything runs locally - your data never leaves your machine except for the connection to your own Salesforce org.
