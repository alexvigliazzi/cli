import { Command } from 'commander';
import { reviewCommand } from './commands/review.js';
import { authCommand } from './commands/auth/index.js';
import { configCommand } from './commands/config.js';
import { upgradeCommand } from './commands/upgrade.js';
import { telemetryCommand } from './commands/telemetry.js';
import { prCommand } from './commands/pr.js';

const program = new Command();

program
  .name('kodus')
  .description('Kodus CLI - AI-powered code review from your terminal')
  .version('1.0.0')
  .option('-f, --format <format>', 'Output format: terminal, json, markdown', 'terminal')
  .option('-o, --output <file>', 'Output file (for json/markdown)')
  .option('-v, --verbose', 'Verbose output', false)
  .option('-q, --quiet', 'Quiet mode (errors only)', false)
  .option('--org <org>', 'Organization name')
  .option('--repo <repo>', 'Repository name');

program.addCommand(reviewCommand);
program.addCommand(authCommand);
program.addCommand(configCommand);
program.addCommand(upgradeCommand);
program.addCommand(telemetryCommand);
program.addCommand(prCommand);

export { program };

