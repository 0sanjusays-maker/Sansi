import test from 'node:test';
import assert from 'node:assert/strict';
import { agents, validateBrief, demoResult } from '../agents.js';

test('brief requires a topic and rejects invalid or oversized inputs', () => {
  assert.throws(() => validateBrief({}), /topic/);
  assert.throws(() => validateBrief({ topic: 42 }), /text/);
  assert.throws(() => validateBrief({ topic: 'a'.repeat(301) }), /too long/);
  assert.equal(validateBrief({ topic: ' AI agents ' }).topic, 'AI agents');
  assert.equal(validateBrief({ topic: 'AI' }).language, 'Hinglish');
});
test('all six agents provide structured demo outputs with transparency', () => {
  const brief = validateBrief({ topic: '<script>alert(1)</script>', evidence: 'Example source', duration: '30 seconds' });
  assert.equal(agents.length, 6);
  for (const agent of agents) {
    const result = demoResult(agent.id, brief);
    assert.equal(result.agent, agent.id);
    assert.equal(result.sections.length, agent.fields.length);
    assert.ok(result.sections.every(s => typeof s.title === 'string' && typeof s.body === 'string'));
  }
  assert.match(demoResult('scout',brief).sections[0].body, /UNVERIFIED/);
  assert.match(demoResult('writer',brief).sections[1].body, /30s/);
});
test('platform adapter provides distinct packages for seven social formats', () => {
  const brief = validateBrief({topic: 'AI agents', language: 'English', platform: 'LinkedIn'});
  const output = demoResult('adapter', brief);
  assert.deepEqual(output.sections.map(s => s.title), agents.at(-1).fields);
  for (const section of output.sections.slice(0,7)) {
    assert.match(section.body, /FORMAT:/);
    assert.match(section.body, /HOOK:/);
    assert.match(section.body, /CTA:/);
    assert.match(section.body, /EDIT:/);
    assert.match(section.body, /HASHTAGS:/);
  }
  assert.match(output.sections[2].body, /not a finished long-form script/);
  assert.match(output.sections[6].body, /POST:/);
  const hinglish = demoResult('adapter', validateBrief({topic:'AI agents', language:'Hinglish'}));
  assert.match(hinglish.sections[0].body, /Save karo/);
});
