import { Command } from 'commander';
import chalk from 'chalk';
import { MetadataParser } from '../../lib/metadataParser';
import { table } from 'table';

export const queryCommand = new Command('query')
  .description('Query metadata and analyze dependencies')
  .addCommand(
    new Command('field-usage')
      .description('Find where a field is used')
      .argument('<object>', 'Object API name')
      .argument('<field>', 'Field API name')
      .action(async (objectName, fieldName) => {
        try {
          const parser = new MetadataParser();
          const objectData = await parser.getObjectByName(objectName);

          if (!objectData) {
            console.error(chalk.red(`Object "${objectName}" not found`));
            process.exit(1);
          }

          const fieldData = await parser.getFieldByName(objectData.id, fieldName);

          if (!fieldData) {
            console.error(chalk.red(`Field "${fieldName}" not found on object "${objectName}"`));
            process.exit(1);
          }

          const dependencies = await parser.getFieldDependencies(fieldData.id);

          if (dependencies.length === 0) {
            console.log(chalk.yellow(`No dependencies found for ${objectName}.${fieldName}`));
            return;
          }

          console.log(chalk.blue(`\nField Usage: ${objectName}.${fieldName}\n`));

          const rows = [['Type', 'Component', 'Dependency Type', 'Context']];
          for (const dep of dependencies) {
            const type = dep.trigger ? 'Trigger' : dep.flow ? 'Flow' : 'Validation';
            const name = dep.trigger?.api_name || dep.flow?.api_name || dep.validation?.api_name || 'Unknown';
            rows.push([type, name, dep.dependency_type, dep.context || '-']);
          }

          console.log(table(rows));
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(chalk.red(`Error: ${message}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('flow-fields')
      .description('Find all fields used by a flow')
      .argument('<flowName>', 'Flow API name')
      .action(async (flowName) => {
        try {
          const parser = new MetadataParser();
          const { data: flow } = await (async () => {
            const client = await import('../../lib/supabaseClient').then(m => m.supabase);
            return client.from('salesforce_flows').select('id').eq('api_name', flowName).maybeSingle();
          })();

          if (!flow) {
            console.error(chalk.red(`Flow "${flowName}" not found`));
            process.exit(1);
          }

          const fields = await parser.getFieldUsageByFlow(flow.id);

          if (fields.length === 0) {
            console.log(chalk.yellow(`No fields found for flow ${flowName}`));
            return;
          }

          console.log(chalk.blue(`\nFields Used in Flow: ${flowName}\n`));

          const rows = [['Field', 'Object', 'Type', 'Context']];
          for (const field of fields) {
            rows.push([
              field.field?.api_name || 'Unknown',
              field.field?.object_id || '-',
              field.dependency_type,
              field.context || '-',
            ]);
          }

          console.log(table(rows));
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(chalk.red(`Error: ${message}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('trigger-fields')
      .description('Find all fields used by a trigger')
      .argument('<triggerName>', 'Trigger API name')
      .action(async (triggerName) => {
        try {
          const parser = new MetadataParser();
          const { data: trigger } = await (async () => {
            const client = await import('../../lib/supabaseClient').then(m => m.supabase);
            return client.from('salesforce_triggers').select('id').eq('api_name', triggerName).maybeSingle();
          })();

          if (!trigger) {
            console.error(chalk.red(`Trigger "${triggerName}" not found`));
            process.exit(1);
          }

          const fields = await parser.getFieldUsageByTrigger(trigger.id);

          if (fields.length === 0) {
            console.log(chalk.yellow(`No fields found for trigger ${triggerName}`));
            return;
          }

          console.log(chalk.blue(`\nFields Used in Trigger: ${triggerName}\n`));

          const rows = [['Field', 'Object', 'Type', 'Context']];
          for (const field of fields) {
            rows.push([
              field.field?.api_name || 'Unknown',
              field.field?.object_id || '-',
              field.dependency_type,
              field.context || '-',
            ]);
          }

          console.log(table(rows));
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(chalk.red(`Error: ${message}`));
          process.exit(1);
        }
      })
  );
