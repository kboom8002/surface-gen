/**
 * @surface-gen/prompts
 *
 * Centralized LLM prompt templates for all agent nodes.
 * Prompts are stored here and referenced by apps/worker agent nodes.
 *
 * All prompt builders are pure functions — they receive typed vars and return
 * { system, user, promptVersion } objects. No LLM calls happen in this package.
 */

// Node prompt builders
export * from './nodes/input-audit.prompt';
export * from './nodes/brand-truth.prompt';
export * from './nodes/semantic-strategy.prompt';
export * from './nodes/knowledge-graph.prompt';
export * from './nodes/gnb-ia.prompt';
