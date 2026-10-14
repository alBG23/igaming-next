import test from 'node:test';
import assert from 'node:assert';
import { cn, formatCurrency, formatNumber, formatPercentage, formatDate, formatDateTime } from '../../src/lib/utils';

test('Utils - cn() class merges correctly', () => {
  assert.strictEqual(cn('px-2', 'py-1'), 'px-2 py-1');
  assert.strictEqual(cn('px-2', 'px-4'), 'px-4');
  assert.strictEqual(cn('text-red-500', false && 'text-blue-500', undefined, null), 'text-red-500');
});

test('Utils - formatCurrency() handles amounts and default currency', () => {
  const resultEur = formatCurrency(1234.56);
  assert.match(resultEur, /1,234\.56/);

  const resultUsd = formatCurrency(50, 'USD');
  assert.match(resultUsd, /50\.00/);
});

test('Utils - formatNumber() formats with thousand separators', () => {
  assert.strictEqual(formatNumber(1000000), '1,000,000');
  assert.strictEqual(formatNumber(42), '42');
});

test('Utils - formatPercentage() computes percentage string correctly', () => {
  const result = formatPercentage(12.5);
  assert.match(result, /12\.50%/);
});

test('Utils - formatDate() formats valid date and returns dash for null', () => {
  assert.strictEqual(formatDate(null), '—');
  assert.strictEqual(formatDate(undefined), '—');
  const formatted = formatDate('2026-10-14T00:00:00Z');
  assert.match(formatted, /Oct 14, 2026/);
});

test('Utils - formatDateTime() handles valid timestamp and empty inputs', () => {
  assert.strictEqual(formatDateTime(null), '—');
  const formatted = formatDateTime('2026-10-14T12:30:00Z');
  assert.ok(formatted.includes('2026'));
});
