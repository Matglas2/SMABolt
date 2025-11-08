import { Command } from 'commander';
import chalk from 'chalk';
import { MetadataParser } from '../../lib/metadataParser';
import { table } from 'table';

export const analyzeCommand = new Command('analyze')
  .description('Perform advanced analysis on Salesforce metadata')
  .addCommand(
    new Command('object')
      .description('Analyze a specific object')
      .argument('<objectName>', 'Object API name')
      .action(async (objectName) => {
        try {
          const parser = new MetadataParser();
          const supabase = (await import('../../lib/supabaseClient')).supabase;

          const { data: object, error: objError } = await supabase
            .from('salesforce_objects')
            .select('*')
            .eq('api_name', objectName)
            .maybeSingle();

          if (objError || !object) {
            console.error(chalk.red(`Object "${objectName}" not found`));
            process.exit(1);
          }

          console.log(chalk.blue(`\n=== Object Analysis: ${objectName} ===\n`));

          const { data: fields } = await supabase
            .from('salesforce_fields')
            .select('*')
            .eq('object_id', object.id);

          if (fields && fields.length > 0) {
            console.log(chalk.cyan('Custom Fields:'));
            const fieldRows = [['API Name', 'Label', 'Type', 'Required']];
            for (const field of fields) {
              fieldRows.push([
                field.api_name,
                field.label || '-',
                field.field_type,
                field.is_required ? 'Yes' : 'No',
              ]);
            }
            console.log(table(fieldRows));
          }

          const { data: triggers } = await supabase
            .from('salesforce_triggers')
            .select('*')
            .eq('object_id', object.id);

          if (triggers && triggers.length > 0) {
            console.log(chalk.cyan('\nTriggers:'));
            const triggerRows = [['Trigger Name', 'Active']];
            for (const trigger of triggers) {
              triggerRows.push([trigger.api_name, trigger.is_active ? 'Yes' : 'No']);
            }
            console.log(table(triggerRows));
          }

          console.log();
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(chalk.red(`Error: ${message}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('field-impact')
      .description('Analyze impact of changing a field')
      .argument('<object>', 'Object API name')
      .argument('<field>', 'Field API name')
      .action(async (objectName, fieldName) => {
        try {
          const parser = new MetadataParser();
          const supabase = (await import('../../lib/supabaseClient')).supabase;

          const objectData = await parser.getObjectByName(objectName);
          if (!objectData) {
            console.error(chalk.red(`Object "${objectName}" not found`));
            process.exit(1);
          }

          const fieldData = await parser.getFieldByName(objectData.id, fieldName);
          if (!fieldData) {
            console.error(chalk.red(`Field "${fieldName}" not found`));
            process.exit(1);
          }

          const dependencies = await parser.getFieldDependencies(fieldData.id);

          console.log(chalk.blue(`\n=== Impact Analysis: ${objectName}.${fieldName} ===\n`));
          console.log(chalk.yellow(`This field is used in ${dependencies.length} automation(s):\n`));

          const rows = [['Component', 'Type', 'Status', 'Notes']];
          for (const dep of dependencies) {
            const type = dep.trigger ? 'Trigger' : dep.flow ? 'Flow' : 'Validation';
            const name = dep.trigger?.api_name || dep.flow?.api_name || dep.validation?.api_name || 'Unknown';
            const status = 'Active';
            rows.push([name, type, status, dep.context || 'Used in automation']);
          }

          console.log(table(rows));
          console.log(chalk.red(`\nWarning: Deleting or modifying this field could break ${dependencies.length} automation(s)\n`));
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(chalk.red(`Error: ${message}`));
          process.exit(1);
        }
      })
  )
  .addCommand(
    new Command('unused-fields')
      .description('Find fields that may not be used in any automation')
      .argument('<object>', 'Object API name')
      .action(async (objectName) => {
        try {
          const parser = new MetadataParser();
          const supabase = (await import('../../lib/supabaseClient')).supabase;

          const objectData = await parser.getObjectByName(objectName);
          if (!objectData) {
            console.error(chalk.red(`Object "${objectName}" not found`));
            process.exit(1);
          }

          const { data: fields } = await supabase
            .from('salesforce_fields')
            .select('id, api_name, label')
            .eq('object_id', objectData.id);

          if (!fields || fields.length === 0) {
            console.log(chalk.yellow(`No fields found for object ${objectName}`));
            return;
          }

          console.log(chalk.blue(`\n=== Unused Fields Analysis: ${objectName} ===\n`));

          const unusedRows = [['API Name', 'Label']];
          for (const field of fields) {
            const dependencies = await parser.getFieldDependencies(field.id);
            if (dependencies.length === 0) {
              unusedRows.push([field.api_name, field.label || '-']);
            }
          }

          if (unusedRows.length === 1) {
            console.log(chalk.green('All fields are used in automation!'));
            return;
          }

          console.log(table(unusedRows));
          console.log(chalk.gray(`\nNote: Fields may also be used in Page Layouts, Record Types, or other non-automation components\n`));
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          console.error(chalk.red(`Error: ${message}`));
          process.exit(1);
        }
      })
  );
