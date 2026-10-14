import test from 'node:test';
import assert from 'node:assert';
import {
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_ADMIN_NAME,
  ADMIN_EMAIL,
  ADMIN_NAME,
  DEFAULT_ANALYST_EMAIL,
  DEFAULT_ANALYST_NAME,
  ANALYST_EMAIL,
  ANALYST_NAME,
  DEFAULT_GEMINI_LOG_MODEL,
  DEFAULT_PR_BRANCH_PREFIX,
  DEFAULT_GITHUB_REPO,
} from '../../src/lib/constants';

test('Constants - Persona emails and names are valid', () => {
  assert.ok(DEFAULT_ADMIN_EMAIL.includes('@'));
  assert.strictEqual(ADMIN_EMAIL, DEFAULT_ADMIN_EMAIL);
  assert.ok(DEFAULT_ADMIN_NAME.length > 0);
  assert.strictEqual(ADMIN_NAME, DEFAULT_ADMIN_NAME);

  assert.ok(DEFAULT_ANALYST_EMAIL.includes('@'));
  assert.strictEqual(ANALYST_EMAIL, DEFAULT_ANALYST_EMAIL);
  assert.ok(DEFAULT_ANALYST_NAME.length > 0);
  assert.strictEqual(ANALYST_NAME, DEFAULT_ANALYST_NAME);
});

test('Constants - Tooling defaults are present', () => {
  assert.strictEqual(DEFAULT_GEMINI_LOG_MODEL, 'gemini-2.5-flash');
  assert.strictEqual(DEFAULT_PR_BRANCH_PREFIX, 'gemini/fix-');
  assert.strictEqual(DEFAULT_GITHUB_REPO, 'alBG23/igaming-backend');
});
