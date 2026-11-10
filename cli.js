#!/usr/bin/env node
import { readFile, mkdir, writeFile, appendFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { parseArgs } from 'node:util';
import { network, runNetwork, toMarkdown } from './network.js';

async function main() {
  const {values} = parseArgs({ options: {
    brief: { type: 'string' }, output: { type: 'string', default: 'runs' },
    demo: { type: 'boolean', default: false }, help: { type: 'boolean', short: 'h' },
    describe: { type: 'boolean' }
  } });
  if (values.help) {
    console.log('Sansi — six-agent content network (no app/server)\n\nUsage: npm run agents -- --brief briefs/example.json [--demo] [--output runs]\n       npm run agents -- --describe\n\nReal AI requires OPENAI_API_KEY. --demo explicitly runs illustrative templates.\nEach run writes agent JSON files, handoffs.ndjson, content-pack.json and content-pack.md.');
    return;
  }
  if (values.describe) { console.log(JSON.stringify(network, null, 2)); return; }
  if (!values.brief) throw new Error('Provide --brief path/to/brief.json. Use --help for usage.');
  if (!values.demo && !process.env.OPENAI_API_KEY) throw new Error('Set OPENAI_API_KEY for real agents, or pass --demo explicitly. No silent demo fallback.');
  const input = JSON.parse(await readFile(resolve(values.brief), 'utf8'));
  const dir = join(resolve(values.output), `${new Date().toISOString().replace(/[:.]/g, '-')}-${randomUUID().slice(0,8)}`);
  await mkdir(dir, {recursive: true});
  const statusPath = join(dir, 'status.json');
  await writeFile(join(dir, 'network.json'), JSON.stringify(network, null, 2));
  await writeFile(statusPath, JSON.stringify({status: 'running', mode: values.demo ? 'demo' : 'ai'}));
  console.log(`Run directory: ${dir}`);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('Network timed out after 10 minutes.')), 600000);
  const cancel = () => controller.abort(new Error('Run cancelled.'));
  process.once('SIGINT', cancel);
  process.once('SIGTERM', cancel);
  try {
    const pack = await runNetwork(input, { demo: values.demo, signal: controller.signal, onEvent: async event => {
      await appendFile(join(dir, 'handoffs.ndjson'), JSON.stringify({at: new Date().toISOString(), ...event}) + '\n');
      if (event.type === 'handoff') console.log(`→ ${event.to} (context: ${event.contextAgents.join(', ') || 'brief only'})`);
      if (event.type === 'result') await writeFile(join(dir, `${event.result.agent}.json`), JSON.stringify(event.result, null, 2));
    } });
    await writeFile(join(dir, 'content-pack.json'), JSON.stringify(pack, null, 2));
    await writeFile(join(dir, 'content-pack.md'), toMarkdown(pack));
    await writeFile(statusPath, JSON.stringify({status: 'complete', completedAgents: pack.results.length, mode: pack.mode}, null, 2));
    console.log(`✓ ${pack.results.length} agents complete. Content pack: ${join(dir, 'content-pack.md')}`);
  } catch (error) {
    await writeFile(statusPath, JSON.stringify({status: 'failed', message: error.message}, null, 2));
    throw error;
  } finally { clearTimeout(timer); process.removeListener('SIGINT', cancel); process.removeListener('SIGTERM', cancel); }
}
main().catch(error => { console.error(`Error: ${error.message}`); process.exitCode = 1; });
