import test from 'node:test';
import assert from 'node:assert';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';

const REPO_ROOT = path.resolve(__dirname, '../..');
const LOCAL_SCRIPT = path.join(REPO_ROOT, 'scripts/self_healing_precommit.py');
const PARENT_SCRIPT = path.resolve(REPO_ROOT, '../scripts/self_healing_precommit.py');
const SCRIPT_PATH = fs.existsSync(LOCAL_SCRIPT) ? LOCAL_SCRIPT : PARENT_SCRIPT;
const SCRIPTS_DIR = path.dirname(SCRIPT_PATH);

test('Self-Healing Engine - Script exists and is executable', () => {
  assert.ok(fs.existsSync(SCRIPT_PATH), `self_healing_precommit.py must exist at ${SCRIPT_PATH}`);
  const stat = fs.statSync(SCRIPT_PATH);
  const isExecutable = Boolean(stat.mode & 0o111);
  assert.ok(isExecutable, 'self_healing_precommit.py must have executable permission (+x)');
});

test('Self-Healing Engine - CLI responds to --help with all flags', () => {
  const result = spawnSync('python3', [SCRIPT_PATH, '--help'], { encoding: 'utf-8' });
  assert.strictEqual(result.status, 0, 'Should exit with code 0 on --help');
  assert.ok(result.stdout.includes('Intelligent Pre-Commit Self-Healing Build Runner'));
  assert.ok(result.stdout.includes('--frontend'));
  assert.ok(result.stdout.includes('--backend'));
  assert.ok(result.stdout.includes('--max-passes'));
});

test('Self-Healing Engine - BuildErrorClassifier identifies Next.js cache and prerender issues', () => {
  const pyCode = `
import sys
sys.path.insert(0, '${SCRIPTS_DIR}')
from self_healing_precommit import BuildErrorClassifier

# Test 1: Cache error
cache_issues = BuildErrorClassifier.classify_frontend("WebpackError in .next/cache/webpack/chunks")
assert any(i.issue_type == "NEXT_CACHE_CORRUPTION" for i in cache_issues)

# Test 2: Prerender missing force-dynamic
prerender_issues = BuildErrorClassifier.classify_frontend("Error occurred prerendering page \\"/api/reports\\"")
assert any(i.issue_type == "MISSING_FORCE_DYNAMIC" for i in prerender_issues)

print("CLASSIFIER_OK")
`;
  const result = spawnSync('python3', ['-c', pyCode], { encoding: 'utf-8' });
  assert.strictEqual(result.status, 0, result.stderr || 'Classifier verification failed');
  assert.ok(result.stdout.includes('CLASSIFIER_OK'));
});
