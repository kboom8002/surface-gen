import { ChatOpenAI } from '@langchain/openai';

/**
 * Task class determines which model variant and temperature to use.
 * All model access must go through this adapter — never call provider SDKs directly from nodes.
 */
export type ModelTaskClass =
  | 'planner'
  | 'vision_analysis'
  | 'structured_generation'
  | 'longform_generation'
  | 'validator'
  | 'repair'
  | 'batch_low_risk';

/**
 * Typed result wrapper for model calls.
 * Nodes must unwrap and Zod-parse the data field before persisting.
 */
export type ModelCallResult<T> =
  | {
      ok: true;
      data: T;
      tokenUsage?: { promptTokens: number; completionTokens: number };
    }
  | {
      ok: false;
      error: string;
    };

/**
 * Get a ChatOpenAI instance tuned for the given task class.
 * Model selection and temperature follow the LANGGRAPH_NODE_SPEC.
 */
export function getModelForTask(taskClass: ModelTaskClass): ChatOpenAI {
  const apiKey = process.env['OPENAI_API_KEY'];
  if (!apiKey) throw new Error('OPENAI_API_KEY is not set in environment');

  switch (taskClass) {
    case 'longform_generation':
      return new ChatOpenAI({ model: 'gpt-4o', temperature: 0.7, apiKey });
    case 'vision_analysis':
      return new ChatOpenAI({ model: 'gpt-4o', temperature: 0.1, apiKey });
    case 'batch_low_risk':
      return new ChatOpenAI({ model: 'gpt-4o-mini', temperature: 0.5, apiKey });
    case 'planner':
    case 'structured_generation':
    case 'validator':
    case 'repair':
    default:
      return new ChatOpenAI({ model: 'gpt-4o', temperature: 0.3, apiKey });
  }
}
