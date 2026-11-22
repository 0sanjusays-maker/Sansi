import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mulberry32, generateScripts, scoreScripts, scoreScript, analyzeScripts,
  analyzeTrends, renderReport, renderFlagship, scriptsToCSV, trendsToCSV
} from '../horror.js';

test('generates exactly N unique, deterministic scripts with full schema', () => {
  const a = generateScripts({ count: 40, seed: 7 });
  const b = generateScripts({ count: 40, seed: 7 });
  assert.equal(a.length, 40);
  assert.equal(new Set(a.map(s => s.signature)).size, 40);
  assert.deepEqual(a.map(s => s.id), b.map(s => s.id));
  assert.deepEqual(a.map(s => s.hooks[0]), b.map(s => s.hooks[0]));
  const c = generateScripts({ count: 40, seed: 8 });
  assert.notDeepEqual(a.map(s => s.hooks[0]), c.map(s => s.hooks[0]));

  for (const s of a) {
    assert.match(s.id, /^H-\d{4}$/);
    assert.ok(s.titleOptions.length === 3);
    assert.ok(s.hooks.length === 3);
    assert.ok(s.script.length >= 6);
    for (const beat of s.script) {
      assert.match(beat.t, /^\d+:\d{2}–\d+:\d{2}$/);
      assert.ok(beat.line.length > 30);
    }
    assert.ok(s.cta && s.soundDesign && s.twistLine && s.entityFlavor);
    assert.ok(['Hinglish', 'English'].includes(s.language));
    assert.ok(['chalega', 'borderline', 'nahi chalega'].includes(scoreScript(s, { key3: new Map([[`${s._meta.ids.hook}|${s._meta.ids.twist}|${s._meta.ids.setting}`, 1]]), n: 40 }).verdict));
  }
});

test('rejects invalid counts and honors filters', () => {
  assert.throws(() => generateScripts({ count: 0 }), /count/);
  assert.throws(() => generateScripts({ count: 99999 }), /count/);
  const reels = generateScripts({ count: 25, seed: 3, platform: 'Instagram Reels', duration: '60 seconds' });
  assert.ok(reels.every(s => s.platform === 'Instagram Reels' && s.duration === '60 seconds'));
  const hindi = generateScripts({ count: 10, seed: 3, language: 'hinglish' });
  assert.ok(hindi.every(s => s.language === 'Hinglish'));
});

test('scoring produces bounded scores, verdict thresholds and flags', () => {
  const scripts = scoreScripts(generateScripts({ count: 120, seed: 11 }));
  for (const s of scripts) {
    assert.ok(s.score.total >= 0 && s.score.total <= 100);
    for (const v of Object.values(s.score.factors)) assert.ok(v >= 0 && v <= 1);
    if (s.score.total >= 75) assert.equal(s.score.verdict, 'chalega');
    else if (s.score.total >= 62) assert.equal(s.score.verdict, 'borderline');
    else assert.equal(s.score.verdict, 'nahi chalega');
    if (s.score.flags.length) assert.ok(s.score.flags.every(f => typeof f === 'string'));
  }
  const analysis = analyzeScripts(scripts);
  assert.equal(analysis.count, 120);
  assert.ok(analysis.top[0].score >= analysis.top[9].score);
  assert.ok(analysis.maxScore >= analysis.medianScore && analysis.medianScore >= analysis.minScore);
  assert.equal(analysis.verdicts.chalega + analysis.verdicts.borderline + analysis.verdicts['nahi chalega'], 120);
  assert.ok(analysis.groups.subgenre.length >= 5);
  assert.ok(analysis.groups.hookStyle.every(g => g.count >= 1));
  const totals = analysis.groups.subgenre.map(g => g.avg);
  assert.deepEqual(totals, [...totals].sort((a, b) => b - a));
  for (const r of Object.values(analysis.correlations)) assert.ok(r >= -1.01 && r <= 1.01);
});

test('trend analyzer ranks candidates and gives chalega / nahi chalega verdicts', () => {
  const strong = {
    name: 'Train horror', demandSignal: 9, hookPotential: 9, repeatability: 9,
    productionDifficulty: 2, saturation: 3, longevityMonths: 11, platformCount: 5
  };
  const weak = {
    name: 'Fading meme format', demandSignal: 2, hookPotential: 3, repeatability: 2,
    productionDifficulty: 9, saturation: 9, longevityMonths: 2, platformCount: 1
  };
  const mid = {
    name: 'Risky experiment', demandSignal: 5, hookPotential: 5, repeatability: 5,
    productionDifficulty: 5, saturation: 5, longevityMonths: 5, platformCount: 3
  };
  const result = analyzeTrends([weak, mid, strong]);
  assert.equal(result.ranked[0].name, 'Train horror');
  assert.equal(result.ranked[0].verdict, 'chalega');
  assert.equal(result.ranked.at(-1).name, 'Fading meme format');
  assert.equal(result.ranked.at(-1).verdict, 'nahi chalega');
  assert.ok(result.winner.strengths.length > 0);
  assert.ok(result.loser.risks.length > 0);
  assert.match(result.caveat, /hypothesis|verify/i);
  assert.throws(() => analyzeTrends([]), /trends/);
  assert.throws(() => analyzeTrends([{ name: 'x', demandSignal: -1 }]), /number/);
});

test('reports and CSVs render every required section', () => {
  const scripts = scoreScripts(generateScripts({ count: 60, seed: 5 }));
  const analysis = analyzeScripts(scripts);
  const trendAnalysis = analyzeTrends([
    { name: 'A', demandSignal: 8, hookPotential: 8, repeatability: 8, productionDifficulty: 3, saturation: 4, longevityMonths: 9, platformCount: 4 },
    { name: 'B', demandSignal: 3, hookPotential: 3, repeatability: 3, productionDifficulty: 8, saturation: 8, longevityMonths: 2, platformCount: 2 }
  ]);
  const md = renderReport({ scripts, analysis, trendAnalysis, meta: { count: 60, seed: 5, language: 'mixed', generatedAt: 'now' } });
  for (const section of ['Top 10 scripts', 'Bottom 5', 'Distribution', 'factor analysis', 'Group comparison', 'Trend verdict', 'kaun sa trend chalega']) {
    assert.ok(md.includes(section), `missing section: ${section}`);
  }
  assert.ok(md.includes('A') && md.includes('B'));
  const csv = scriptsToCSV(scripts);
  assert.equal(csv.trim().split('\n').length, 61);
  assert.match(csv.split('\n')[0], /total,verdict/);
  const tcsv = trendsToCSV(trendAnalysis);
  assert.match(tcsv, /rank,name,category,score,verdict/);
  const flagship = renderFlagship(analysis.topScript);
  assert.match(flagship, /Flagship Horror Script/);
  assert.match(flagship, /Score breakdown/);
});

test('seeded RNG is stable', () => {
  const r = mulberry32(42);
  const first = [r(), r(), r()];
  const r2 = mulberry32(42);
  assert.deepEqual([r2(), r2(), r2()], first);
});
