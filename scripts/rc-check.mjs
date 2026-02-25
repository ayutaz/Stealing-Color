import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import process, { stdout } from 'node:process';

const OUTPUT_DIR = resolve('artifacts');
const REPORT_JSON_PATH = resolve(OUTPUT_DIR, 'rc-report.json');
const REPORT_MD_PATH = resolve(OUTPUT_DIR, 'rc-report.md');
const KNOWN_ISSUES_PATH = resolve('docs', 'known-issues.json');
const PERF_REPORT_PATH = resolve(OUTPUT_DIR, 'perf-report.json');

const STEPS = [
  { id: 'lint', name: 'Lint', command: 'npm run lint' },
  { id: 'unit', name: 'Unit Test', command: 'npm run test' },
  { id: 'build', name: 'Build', command: 'npm run build' },
  { id: 'e2e', name: 'E2E', command: 'npm run test:e2e' },
  { id: 'audit', name: 'Audit High+', command: 'npm audit --audit-level=high' },
  { id: 'perf', name: 'Performance Sampling', command: 'npm run perf:measure' }
];

async function main() {
  const startedAt = new Date().toISOString();
  const commit = readGitCommit();
  const stepResults = [];

  stdout.write(`# RC Check Start (${startedAt})\n`);
  for (const step of STEPS) {
    const result = await runStep(step);
    stepResults.push(result);
  }

  const knownIssues = loadKnownIssues();
  const perfSummary = loadPerfSummary();
  const overallPassed = stepResults.every((step) => step.ok) && knownIssues.openHighCount === 0;

  const report = {
    generatedAt: new Date().toISOString(),
    commit,
    overallPassed,
    checks: stepResults,
    knownIssues,
    perfSummary
  };

  mkdirSync(OUTPUT_DIR, { recursive: true });
  writeFileSync(REPORT_JSON_PATH, `${JSON.stringify(report, null, 2)}\n`);
  writeFileSync(REPORT_MD_PATH, buildMarkdownReport(report));

  stdout.write(`\nRC report: ${REPORT_MD_PATH}\n`);
  if (!overallPassed) {
    stdout.write('RC gate failed.\n');
    process.exitCode = 1;
    return;
  }

  stdout.write('RC gate passed.\n');
}

function readGitCommit() {
  const result = spawnSync('git', ['rev-parse', '--short', 'HEAD'], {
    encoding: 'utf8'
  });

  if (result.status !== 0) {
    return 'unknown';
  }

  return result.stdout.trim() || 'unknown';
}

async function runStep(step) {
  stdout.write(`\n[RC] ${step.name}\n`);
  const started = Date.now();
  const exitCode = await runCommand(step.command);
  const durationMs = Date.now() - started;
  const ok = exitCode === 0;

  stdout.write(`[RC] ${step.name}: ${ok ? 'PASS' : 'FAIL'} (${durationMs}ms)\n`);
  return {
    id: step.id,
    name: step.name,
    ok,
    exitCode,
    durationMs
  };
}

function runCommand(command) {
  return new Promise((resolveExit) => {
    const child = spawn(command, {
      shell: true,
      stdio: 'inherit'
    });

    child.on('exit', (code) => {
      resolveExit(code ?? 1);
    });
    child.on('error', () => {
      resolveExit(1);
    });
  });
}

function loadKnownIssues() {
  let raw;
  try {
    raw = readFileSync(KNOWN_ISSUES_PATH, 'utf8');
  } catch {
    return {
      source: KNOWN_ISSUES_PATH,
      openHighCount: 1,
      openIssueCount: 1,
      warning: 'known-issues registry file is missing'
    };
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return {
      source: KNOWN_ISSUES_PATH,
      openHighCount: 1,
      openIssueCount: 1,
      warning: 'known-issues registry file is invalid JSON'
    };
  }

  const issues = Array.isArray(parsed.issues) ? parsed.issues : [];
  const openIssues = issues.filter((issue) => issue.status !== 'closed');
  const openHigh = openIssues.filter((issue) => {
    const severity = String(issue.severity ?? '').toLowerCase();
    return severity === 'high' || severity === 'critical';
  });

  return {
    source: KNOWN_ISSUES_PATH,
    updatedAt: parsed.updatedAt ?? null,
    openIssueCount: openIssues.length,
    openHighCount: openHigh.length
  };
}

function loadPerfSummary() {
  try {
    const raw = readFileSync(PERF_REPORT_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    const checkpoints = Array.isArray(parsed.checkpoints) ? parsed.checkpoints : [];
    const averageFps =
      checkpoints.length === 0
        ? null
        : checkpoints.reduce((sum, row) => sum + Number(row.fps ?? 0), 0) / checkpoints.length;
    return {
      source: PERF_REPORT_PATH,
      checkpointCount: checkpoints.length,
      averageFps: averageFps === null ? null : Number(averageFps.toFixed(2))
    };
  } catch {
    return {
      source: PERF_REPORT_PATH,
      checkpointCount: 0,
      averageFps: null
    };
  }
}

function buildMarkdownReport(report) {
  const lines = [
    '# RC Gate Report',
    '',
    `- generatedAt: ${report.generatedAt}`,
    `- commit: ${report.commit}`,
    `- overall: ${report.overallPassed ? 'PASS' : 'FAIL'}`,
    '',
    '## Checks',
    '',
    '| Check | Result | Duration (ms) | Exit |',
    '|---|---|---:|---:|',
    ...report.checks.map(
      (step) => `| ${step.name} | ${step.ok ? 'PASS' : 'FAIL'} | ${step.durationMs} | ${step.exitCode} |`
    ),
    '',
    '## Known Issues',
    '',
    `- open issues: ${report.knownIssues.openIssueCount}`,
    `- open high/critical: ${report.knownIssues.openHighCount}`,
    '',
    '## Performance Summary',
    '',
    `- checkpoints: ${report.perfSummary.checkpointCount}`,
    `- average fps: ${report.perfSummary.averageFps ?? 'n/a'}`,
    ''
  ];

  return `${lines.join('\n')}\n`;
}

void main();
