import { Command } from 'commander';
import chalk from 'chalk';
import { SalesforceFetcher } from '../../lib/salesforceFetcher';

export const authCommand = new Command('auth')
  .description('Authenticate with Salesforce organization')
  .option('-u, --username <username>', 'Salesforce username')
  .option('-p, --password <password>', 'Salesforce password')
  .option('--url <instanceUrl>', 'Salesforce instance URL (e.g., https://login.salesforce.com)')
  .option('--client-id <clientId>', 'OAuth client ID')
  .option('--client-secret <clientSecret>', 'OAuth client secret')
  .action(async (options) => {
    try {
      const {
        username = process.env.SF_USERNAME,
        password = process.env.SF_PASSWORD,
        url = process.env.SF_INSTANCE_URL || 'https://login.salesforce.com',
        clientId = process.env.SF_CLIENT_ID,
        clientSecret = process.env.SF_CLIENT_SECRET,
      } = options;

      if (!username || !password) {
        console.error(chalk.red('Error: Username and password are required'));
        console.log('Set SF_USERNAME and SF_PASSWORD environment variables or use --username and --password flags');
        process.exit(1);
      }

      console.log(chalk.blue('Authenticating with Salesforce...'));

      const fetcher = new SalesforceFetcher({
        instanceUrl: url,
        clientId: clientId || '',
        clientSecret: clientSecret || '',
        username,
        password,
      });

      await fetcher.authenticate(username, password);

      console.log(chalk.green('Successfully authenticated with Salesforce!'));
      console.log(chalk.gray('You can now run sync command to fetch metadata'));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(chalk.red(`Authentication failed: ${message}`));
      process.exit(1);
    }
  });
