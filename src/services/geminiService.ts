/**
 * Kang Teguh AI Client Service
 * Hardened through Provider Abstraction (Server Proxy, BYOK, Offline Fallback)
 */

import { aiManager, ChatEntry } from './aiProvider';

export type { ChatEntry };

export async function askKangTeguhAI(
  message: string,
  history: ChatEntry[] = [],
  signal?: AbortSignal
): Promise<string> {
  return await aiManager.ask(message, history, signal);
}
