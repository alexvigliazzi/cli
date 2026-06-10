import fs from 'fs/promises';
import type { AgentAdapter } from './agent.interface.js';
import { transcriptService } from '../services/transcript.service.js';
import type {
  AgentType,
  LifecycleEvent,
  EventType,
  TokenUsage,
  TranscriptParseResult,
  ClaudeCodeHookEvent,
} from '../types/session.js';

const HOOK_TO_EVENT_TYPE: Record<ClaudeCodeHookEvent, EventType> = {
  'session-start': 'SessionStart',
  'session-end': 'SessionEnd',
  'stop': 'SessionEnd',
  'user-prompt-submit': 'TurnStart',
  'pre-task': 'SubagentStart',
  'post-task': 'SubagentEnd',
  'post-todo': 'TurnEnd',
};

export class ClaudeCodeAgent implements AgentAdapter {
  readonly agentType: AgentType = 'claude-code';

  parseHookEvent(hookName: string, payload: unknown): LifecycleEvent | null {
    const eventType = HOOK_TO_EVENT_TYPE[hookName as ClaudeCodeHookEvent];
    if (!eventType) return null;

    const obj = (payload && typeof payload === 'object' && !Array.isArray(payload))
      ? payload as Record<string, unknown>
      : {};

    const sessionId = pickString(obj, ['session_id', 'sessionId']) ?? '';
    const sessionRef = pickString(obj, ['transcript_path', 'transcriptPath', 'session_ref']) ?? '';
    const prompt = pickString(obj, ['prompt', 'user_message']);
    const toolUseId = pickString(obj, ['tool_use_id', 'toolUseId']);
    const subagentId = pickString(obj, ['subagent_id', 'subagentId']);
    const subagentType = pickString(obj, ['subagent_type', 'subagentType']);
    const taskDescription = pickString(obj, ['task_description', 'taskDescription']);

    let toolInput: unknown;
    if (obj['tool_input'] !== undefined) {
      toolInput = obj['tool_input'];
    } else if (obj['input'] !== undefined) {
      toolInput = obj['input'];
    }

    return {
      type: eventType,
      sessionId,
      sessionRef,
      prompt,
      timestamp: new Date(),
      toolUseId,
      subagentId,
      subagentType,
      taskDescription,
      toolInput,
    };
  }

  async readTranscript(transcriptPath: string, fromOffset = 0): Promise<TranscriptParseResult> {
    return transcriptService.parse(transcriptPath, fromOffset);
  }

  async extractPrompts(transcriptPath: string): Promise<string[]> {
    const result = await this.readTranscript(transcriptPath);
    return result.prompts;
  }

  async extractSummary(transcriptPath: string): Promise<string> {
    const result = await this.readTranscript(transcriptPath);
    return result.summary;
  }

  async extractModifiedFiles(transcriptPath: string): Promise<string[]> {
    const result = await this.readTranscript(transcriptPath);
    return result.modifiedFiles;
  }

  async calculateTokenUsage(transcriptPath: string): Promise<TokenUsage> {
    const result = await this.readTranscript(transcriptPath);
    return result.tokenUsage;
  }

  async waitForTranscriptFlush(transcriptPath: string, timeoutMs = 3000): Promise<boolean> {
    const pollInterval = 50;
    const startTime = Date.now();
    let lastSize = -1;
    let stableCount = 0;
    const requiredStable = 3; // 150ms of no changes

    while (Date.now() - startTime < timeoutMs) {
      try {
        const stat = await fs.stat(transcriptPath);
        const currentSize = stat.size;

        if (currentSize === lastSize) {
          stableCount++;
          if (stableCount >= requiredStable) {
            return true; // File is stable
          }
        } else {
          stableCount = 0;
          lastSize = currentSize;
        }
      } catch {
        // File doesn't exist yet
        stableCount = 0;
      }

      await sleep(pollInterval);
    }

    return stableCount >= requiredStable;
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pickString(obj: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function extractTextFromContent(content: unknown): string {
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';

  const texts: string[] = [];
  for (const block of content) {
    if (!block || typeof block !== 'object') continue;
    const b = block as Record<string, unknown>;
    if (b['type'] === 'text' && typeof b['text'] === 'string') {
      texts.push(b['text'] as string);
    }
  }
  return texts.join('\n');
}

function toNumber(value: unknown): number {
  return typeof value === 'number' ? value : 0;
}

function emptyTokenUsage(): TokenUsage {
  return {
    inputTokens: 0,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
    outputTokens: 0,
    apiCallCount: 0,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const claudeCodeAgent = new ClaudeCodeAgent();
