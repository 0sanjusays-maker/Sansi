#!/usr/bin/env node
// horror-cli.js — Sansi Horror Script Factory: bulk-generate horror scripts,
// score them for engagement, compare them and analyze which horror trends will work.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { parseArgs } from 'node:util';
import {
  generateScripts, scoreScripts, analyzeScripts, analyzeTrends,
  scriptsToCSV, trendsToCSV, renderReport, renderFlagship
} from './horror.js';

async function main() {
  const { values } = parseArgs({ options: {
    count: { type: 'string', default: '2000' },
    seed: { type: 'string', default: '42' },
    language: { type: 'string', default: 'mixed' },
    platform: { type: 'string' },
    duration: { type: 'string' },
    trends: { type: 'string' },
    out: { type: 'string', default: 'runs' },
    top: { type: 'string', default: '10' },
    help: { type: 'boolean', short: 'h' }
  } });

  if (values.help) {
    console.log(`Sansi Horror Script Factory — bulk horror scripts + engagement & trend analysis

Usage:
  npm run horror -- [--count 2000] [--seed 42] [--language mixed|hinglish|english]
                    [--platform "Instagram Reels"] [--duration "60 seconds"]
                    [--trends briefs/horror-trends.json] [--out runs] [--top 10]

What it does:
  1. Auto-generates up to 5,000 unique horror scripts (Hinglish/English) with
     hooks, timestamped spoken scripts, twists, CTAs and sound design.
  2. Scores every script on 10 engagement factors (hook, tension, payoff…)
     and labels it: chalega / borderline / nahi chalega.
  3. Compares scripts: leaderboard, factor correlations, group winners.
  4. (--trends) Ranks your horror trend candidates: kaun sa trend chalega.

Output: scripts.ndjson, scripts.csv, analysis.json, report.md, flagship.md
        (+ trends.csv when --trends is given).

Honesty boundary: trend verdicts are structural hypotheses from YOUR inputs,
not verified live platform data. Cross-check with your own analytics.`);
    return;
  }

  const count = parseInt(values.count, 10);
  const seed = parseInt(values.seed, 10);
  const top = Math.max(1, parseInt(values.top, 10) || 10);
  if (!Number.isInteger(count) || count < 1 || count > 5000) throw new Error('--count must be 1–5000.');
  if (!Number.isInteger(seed)) throw new Error('--seed must be an integer.');
  if (!['mixed', 'hinglish', 'english'].includes(values.language)) throw new Error('--language must be mixed, hinglish or english.');

  console.log(`Generating ${count} unique horror scripts (seed=${seed}, language=${values.language})…`);
  let scripts = generateScripts({ count, seed, language: values.language, platform: values.platform, duration: values.duration });
  scripts = scoreScripts(scripts);
  const analysis = analyzeScripts(scripts);
  scripts.sort((a, b) => b.score.total - a.score.total);

  let trendAnalysis = null;
  if (values.trends) {
    const raw = JSON.parse(await readFile(resolve(values.trends), 'utf8'));
    trendAnalysis = analyzeTrends(Array.isArray(raw) ? raw : raw.trends);
    console.log(`Trend analysis: ${trendAnalysis.spread.chalega} chalega · ${trendAnalysis.spread.risky} risky · ${trendAnalysis.spread['nahi chalega']} nahi chalega`);
  }

  const dir = join(resolve(values.out), `horror-${new Date().toISOString().replace(/[:.]/g, '-')}`);
  await mkdir(dir, { recursive: true });

  await writeFile(join(dir, 'scripts.ndjson'), scripts.map(s => {
    const { _meta, ...clean } = s;
    return JSON.stringify(clean);
  }).join('\n') + '\n');
  await writeFile(join(dir, 'scripts.csv'), scriptsToCSV(scripts));
  await writeFile(join(dir, 'analysis.json'), JSON.stringify({ meta: { count, seed, language: values.language }, analysis, trendAnalysis }, null, 2));
  const meta = { count, seed, language: values.language, generatedAt: new Date().toISOString() };
  await writeFile(join(dir, 'report.md'), renderReport({ scripts, analysis, trendAnalysis, meta }));
  await writeFile(join(dir, 'flagship.md'), renderFlagship(analysis.topScript));
  if (trendAnalysis) await writeFile(join(dir, 'trends.csv'), trendsToCSV(trendAnalysis));

  console.log(`✓ Done. Report: ${join(dir, 'report.md')}`);
  console.log(`  Leaderboard (top ${Math.min(top, analysis.top.length)}):`);
  for (const s of analysis.top.slice(0, top)) {
    console.log(`   ${s.score.toString().padStart(5)}  ${VERDICT(s.verdict)} ${s.id}  ${s.title}`);
  }
  if (trendAnalysis) {
    console.log('  Trend verdicts:');
    for (const t of trendAnalysis.ranked) console.log(`   ${String(t.score).padStart(5)}  ${VERDICT(t.verdict)} ${t.name}`);
  }
}

function VERDICT(v) { return v === 'chalega' ? '🔥' : v === 'nahi chalega' ? '❌' : '⚠️'; }

main().catch(error => { console.error(`Error: ${error.message}`); process.exitCode = 1; });
