import { Command } from 'commander';
import { claudeCodeHookAction } from './claude-code.js';
import { cursorHookAction } from './cursor.js';

const HOOK_EVENT_LIST = 'session-start, session-end, stop, user-prompt-submit, pre-task, post-task, post-todo';

export const sessionHooksCommand = new Command('hooks')
  .description('Internal session lifecycle hook handlers');

sessionHooksCommand
  .command('claude-code')
  .description('Handle Claude Code lifecycle hooks')
  .argument('<hook-name>', `Hook event name (${HOOK_EVENT_LIST})`)
  .action(claudeCodeHookAction);

sessionHooksCommand
  .command('cursor')
  .description('Handle Cursor lifecycle hooks')
  .argument('<hook-name>', `Hook event name (${HOOK_EVENT_LIST})`)
  .action(cursorHookAction);
