import { agents, validateBrief, runAgent, demoResult } from './agents.js';

export const network = {
  name: 'Sansi content agent network',
  version: 1,
  execution: 'sequential-shared-context',
  agents: agents.map(({id, name, role, fields}, index) => ({
    id, name, role, receives: index === 0 ? ['brief'] : ['brief', ...agents.slice(0, index).map(a => a.id)],
    produces: fields, next: agents[index + 1]?.id || null
  }))
};

/** Each specialist receives the brief and every completed upstream output. */
export async function runNetwork(input, { demo = false, signal, execute = runAgent, onEvent = async () => {} } = {}) {
  const brief = validateBrief(input);
  const results = [];
  await onEvent({ type: 'start', mode: demo ? 'demo' : 'ai', brief });
  for (const agent of agents) {
    signal?.throwIfAborted();
    await onEvent({ type: 'handoff', to: agent.id, from: results.at(-1)?.agent || 'brief', contextAgents: results.map(r => r.agent) });
    try {
      const output = demo ? demoResult(agent.id, brief) : await execute(agent, brief, structuredClone(results), signal);
      if (output.agent !== agent.id || !Array.isArray(output.sections) || !output.sections.length || output.sections.some(s => typeof s.title !== 'string' || typeof s.body !== 'string')) throw new Error('Invalid agent output schema.');
      results.push(output);
      await onEvent({ type: 'result', result: output });
    } catch (error) {
      await onEvent({ type: 'error', agent: agent.id, message: error.message });
      throw new Error(`${agent.name} failed: ${error.message}`, { cause: error });
    }
  }
  await onEvent({ type: 'done', completedAgents: results.length });
  return { mode: demo ? 'demo' : 'ai', brief, results };
}

export function toMarkdown({ mode, brief, results }) {
  return `# ${brief.topic}\n\nMode: ${mode}\nPlatform: ${brief.platform}\nLanguage: ${brief.language}\nDuration: ${brief.duration}\nAudience: ${brief.audience}\nGoal: ${brief.goal}\n\n> ${mode === 'demo' ? 'DEMO: illustrative templates, not researched content. ' : ''}Live trends are not independently verified. Review claims, timing, sources and rights before publishing.\n\n${brief.evidence ? '## Supplied evidence\n\n' + brief.evidence + '\n\n' : ''}${results.map(r => `## ${agents.find(a => a.id === r.agent).name}\n\n${r.sections.map(s => `### ${s.title}\n\n${s.body}`).join('\n\n')}`).join('\n\n---\n\n')}\n`;
}
