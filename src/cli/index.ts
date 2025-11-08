import { Command } from 'commander';
import chalk from 'chalk';
import { authCommand } from './commands/auth';
import { syncCommand } from './commands/sync';
import { queryCommand } from './commands/query';
import { analyzeCommand } from './commands/analyze';

const program = new Command();

program
  .name('sf-analyze')
  .description('Salesforce Metadata Analysis Tool - Understand field usage, automation dependencies, and permissions')
  .version('1.0.0');

program.addCommand(authCommand);
program.addCommand(syncCommand);
program.addCommand(queryCommand);
program.addCommand(analyzeCommand);

program.on('command:*', () => {
  console.error(chalk.red('\nInvalid command. Use --help for available commands.\n'));
  process.exit(1);
});

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

program.parse(process.argv);
