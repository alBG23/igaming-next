import test from 'node:test';
import assert from 'node:assert';
import {
  DATA_SOURCES,
  getDataSource,
  setDataSource,
  isPostgres,
  isSupabase,
  getActiveDataSourceMetadata,
} from '../../src/lib/data-source';

test('Data Source Flag - Metadata declarations are correct', () => {
  assert.ok(DATA_SOURCES.postgres);
  assert.ok(DATA_SOURCES.supabase);

  assert.strictEqual(DATA_SOURCES.postgres.id, 'postgres');
  assert.strictEqual(DATA_SOURCES.postgres.shortLabel, 'PostgreSQL');
  assert.strictEqual(DATA_SOURCES.postgres.defaultPort, 5432);

  assert.strictEqual(DATA_SOURCES.supabase.id, 'supabase');
  assert.strictEqual(DATA_SOURCES.supabase.shortLabel, 'Supabase');
  assert.strictEqual(DATA_SOURCES.supabase.defaultPort, 443);
});

test('Data Source Flag - Resolution defaults to postgres', () => {
  const originalEnv = process.env.NEXT_PUBLIC_DATA_SOURCE;
  delete process.env.NEXT_PUBLIC_DATA_SOURCE;

  const current = getDataSource();
  assert.strictEqual(current, 'postgres');
  assert.strictEqual(isPostgres(), true);
  assert.strictEqual(isSupabase(), false);

  const meta = getActiveDataSourceMetadata();
  assert.strictEqual(meta.id, 'postgres');

  if (originalEnv) {
    process.env.NEXT_PUBLIC_DATA_SOURCE = originalEnv;
  }
});

test('Data Source Flag - Env variable override to supabase', () => {
  const originalEnv = process.env.NEXT_PUBLIC_DATA_SOURCE;
  process.env.NEXT_PUBLIC_DATA_SOURCE = 'supabase';

  const current = getDataSource();
  assert.strictEqual(current, 'supabase');
  assert.strictEqual(isSupabase(), true);
  assert.strictEqual(isPostgres(), false);

  const meta = getActiveDataSourceMetadata();
  assert.strictEqual(meta.id, 'supabase');

  if (originalEnv !== undefined) {
    process.env.NEXT_PUBLIC_DATA_SOURCE = originalEnv;
  } else {
    delete process.env.NEXT_PUBLIC_DATA_SOURCE;
  }
});

test('Data Source Flag - setDataSource safely handles non-browser environment', () => {
  // Should execute cleanly without throwing in Node environment
  assert.doesNotThrow(() => {
    setDataSource('postgres');
  });
  assert.doesNotThrow(() => {
    setDataSource('supabase');
  });
});
