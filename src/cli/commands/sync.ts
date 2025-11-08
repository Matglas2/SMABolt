import { Command } from 'commander';
import chalk from 'chalk';
import { SalesforceFetcher } from '../../lib/salesforceFetcher';
import { MetadataParser } from '../../lib/metadataParser';

export const syncCommand = new Command('sync')
  .description('Sync metadata from Salesforce organization')
  .option('-u, --username <username>', 'Salesforce username')
  .option('-p, --password <password>', 'Salesforce password')
  .option('-t, --type <type>', 'Sync specific type (objects|fields|triggers|flows|all)', 'all')
  .action(async (options) => {
    try {
      const {
        username = process.env.SF_USERNAME,
        password = process.env.SF_PASSWORD,
        type = 'all',
      } = options;

      if (!username || !password) {
        console.error(chalk.red('Error: Username and password are required'));
        console.log('Set SF_USERNAME and SF_PASSWORD environment variables or use flags');
        process.exit(1);
      }

      const fetcher = new SalesforceFetcher({
        instanceUrl: 'https://login.salesforce.com',
        clientId: '',
        clientSecret: '',
        username,
        password,
      });

      const parser = new MetadataParser();

      console.log(chalk.blue('Starting metadata sync...'));

      await fetcher.authenticate(username, password);
      console.log(chalk.green('Authenticated successfully'));

      if (type === 'objects' || type === 'all') {
        await syncObjects(fetcher, parser);
      }

      if (type === 'fields' || type === 'all') {
        await syncFields(fetcher, parser);
      }

      if (type === 'triggers' || type === 'all') {
        await syncTriggers(fetcher, parser);
      }

      if (type === 'flows' || type === 'all') {
        await syncFlows(fetcher, parser);
      }

      console.log(chalk.green('Sync completed successfully!'));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Sync failed: ${message}`));
      process.exit(1);
    }
  });

async function syncObjects(fetcher: SalesforceFetcher, parser: MetadataParser) {
  try {
    console.log(chalk.yellow('Syncing objects...'));
    await parser.updateSyncStatus('objects', 'syncing');

    const objects = await fetcher.fetchObjects();

    for (const obj of objects) {
      await parser.storeObject({
        api_name: obj.fullName,
        label: obj.fullName,
        object_type: obj.type,
        is_custom: obj.type === 'CustomObject',
      });
    }

    await parser.updateSyncStatus('objects', 'success');
    console.log(chalk.green(`Synced ${objects.length} objects`));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await parser.updateSyncStatus('objects', 'error', message);
    console.error(chalk.red(`Failed to sync objects: ${message}`));
  }
}

async function syncFields(fetcher: SalesforceFetcher, parser: MetadataParser) {
  try {
    console.log(chalk.yellow('Syncing fields...'));
    await parser.updateSyncStatus('fields', 'syncing');

    const objects = await fetcher.fetchObjects();
    let fieldCount = 0;

    for (const obj of objects) {
      try {
        const objectData = await parser.getObjectByName(obj.fullName);
        if (!objectData) continue;

        const fields = await fetcher.fetchFields(obj.fullName);

        for (const field of fields) {
          if (field.custom) {
            await parser.storeField({
              object_id: objectData.id,
              api_name: field.name,
              label: field.label,
              field_type: field.type,
              is_custom: true,
              is_required: field.nillable === false,
              formula: field.calculatedFormula,
              default_value: field.defaultValue,
              description: field.inlineHelpText,
            });
            fieldCount++;
          }
        }
      } catch (err) {
        console.log(chalk.gray(`Skipped object ${obj.fullName}`));
      }
    }

    await parser.updateSyncStatus('fields', 'success');
    console.log(chalk.green(`Synced ${fieldCount} fields`));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await parser.updateSyncStatus('fields', 'error', message);
    console.error(chalk.red(`Failed to sync fields: ${message}`));
  }
}

async function syncTriggers(fetcher: SalesforceFetcher, parser: MetadataParser) {
  try {
    console.log(chalk.yellow('Syncing triggers...'));
    await parser.updateSyncStatus('triggers', 'syncing');

    const triggers = await fetcher.fetchTriggers();
    let triggerCount = 0;

    for (const trigger of triggers) {
      try {
        const objectName = trigger.fullName.split('.')[0];
        const objectData = await parser.getObjectByName(objectName);
        if (!objectData) continue;

        const code = await fetcher.fetchTriggerCode(trigger.fullName);

        await parser.storeTrigger({
          object_id: objectData.id,
          api_name: trigger.fullName,
          apex_code: code,
          is_active: true,
        });
        triggerCount++;
      } catch (err) {
        console.log(chalk.gray(`Skipped trigger ${trigger.fullName}`));
      }
    }

    await parser.updateSyncStatus('triggers', 'success');
    console.log(chalk.green(`Synced ${triggerCount} triggers`));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await parser.updateSyncStatus('triggers', 'error', message);
    console.error(chalk.red(`Failed to sync triggers: ${message}`));
  }
}

async function syncFlows(fetcher: SalesforceFetcher, parser: MetadataParser) {
  try {
    console.log(chalk.yellow('Syncing flows...'));
    await parser.updateSyncStatus('flows', 'syncing');

    const flows = await fetcher.fetchFlows();
    let flowCount = 0;

    for (const flow of flows) {
      try {
        const xml = await fetcher.fetchFlowXml(flow.fullName);

        await parser.storeFlow({
          api_name: flow.fullName,
          label: flow.fullName,
          flow_type: 'Flow',
          is_active: flow.active || false,
          version_number: 1,
          xml_metadata: xml,
        });
        flowCount++;
      } catch (err) {
        console.log(chalk.gray(`Skipped flow ${flow.fullName}`));
      }
    }

    await parser.updateSyncStatus('flows', 'success');
    console.log(chalk.green(`Synced ${flowCount} flows`));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await parser.updateSyncStatus('flows', 'error', message);
    console.error(chalk.red(`Failed to sync flows: ${message}`));
  }
}
