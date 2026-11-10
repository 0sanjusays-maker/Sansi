import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { network, runNetwork, toMarkdown } from '../network.js';

const exec = promisify(execFile);
test('real orchestration passes every upstream output to the next specialist', async () => {
  const calls = [], events = [];
  const pack = await runNetwork({topic: 'Creator workflows'}, {
    execute: async (agent, brief, previous) => {
      assert.equal(brief.topic, 'Creator workflows');
      assert.deepEqual(previous.map(r => r.agent), network.agents.slice(0,calls.length).map(a => a.id));
      calls.push(agent.id);
      return {agent: agent.id, sections: [{title: agent.fields[0], body: `${agent.id} output`}]};
    }, onEvent: async event => events.push(event)
  });
  assert.equal(calls.length, 6);
  assert.equal(events.filter(e => e.type === 'handoff').length, 6);
  assert.equal(events.at(-1).type, 'done');
  assert.match(toMarkdown(pack), /Platform Adapter/);
});
test('failure stops downstream agents without silently switching to demo', async () => {
  const calls = [], events = [];
  await assert.rejects(runNetwork({topic: 'AI'}, {
    execute: async agent => { calls.push(agent.id); throw new Error('provider unavailable'); },
    onEvent: async event => events.push(event)
  }), /Trend Scout failed/);
  assert.deepEqual(calls, ['scout']);
  assert.equal(events.at(-1).type, 'error');
});
test('aborted runs do not call agents', async () => {
  const controller = new AbortController(); controller.abort();
  await assert.rejects(runNetwork({topic:'AI'}, {signal:controller.signal, execute: async () => assert.fail('must not run')}), /abort/i);
});
test('CLI writes complete demo pack, agent outputs and explicit handoff trace', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'sansi-test-'));
  try {
    await exec(process.execPath, ['cli.js','--brief','briefs/example.json','--demo','--output',dir]);
    const [run] = await readdir(dir);
    const pack = JSON.parse(await readFile(join(dir, run, 'content-pack.json'),'utf8'));
    assert.equal(pack.mode, 'demo'); assert.equal(pack.results.length,6);
    const status = JSON.parse(await readFile(join(dir,run,'status.json'),'utf8')); assert.equal(status.status,'complete');
    const trace = (await readFile(join(dir,run,'handoffs.ndjson'),'utf8')).trim().split('\n').map(JSON.parse);
    const adapter = trace.find(e => e.type === 'handoff' && e.to === 'adapter');
    assert.equal(adapter.contextAgents.length,5);
    assert.match(await readFile(join(dir,run,'content-pack.md'),'utf8'),/Instagram Reels/);
  } finally { await rm(dir,{recursive:true,force:true}); }
});
test('CLI requires explicit demo flag without an API key', async () => {
  await assert.rejects(exec(process.execPath, ['cli.js','--brief','briefs/example.json'],{env:{...process.env,OPENAI_API_KEY:''}}), /No silent demo fallback/);
});
