import test from 'node:test';
import assert from 'node:assert/strict';
import {
  dataAccuracyBackendError,
  forwardDataAccuracyResponse,
  requestDataAccuracyBackend,
} from '../../src/lib/data-accuracy/backend';

test('data accuracy backend proxy forwards session and authorization without caching', async (t) => {
  const originalUrl = process.env.NEXT_PUBLIC_API_URL;
  const originalFetch = global.fetch;
  process.env.NEXT_PUBLIC_API_URL = 'https://backend.test';
  let requestedUrl: URL | undefined;
  let requestedInit: RequestInit | undefined;
  global.fetch = (async (input, init) => {
    requestedUrl = new URL(String(input));
    requestedInit = init;
    return new Response('{"ok":true}', { status: 200 });
  }) as typeof fetch;
  t.after(() => {
    if (originalUrl === undefined) delete process.env.NEXT_PUBLIC_API_URL;
    else process.env.NEXT_PUBLIC_API_URL = originalUrl;
    global.fetch = originalFetch;
  });

  const request = new Request('https://frontend.test/api/data-accuracy/status', {
    headers: {
      cookie: 'theme=dark; ls_session=session-value',
      authorization: 'Bearer admin-token',
    },
  });
  const response = await requestDataAccuracyBackend(request, '/api/v1/data-qa/loop');

  assert.equal(response.status, 200);
  assert.equal(requestedUrl?.toString(), 'https://backend.test/api/v1/data-qa/loop');
  assert.equal(new Headers(requestedInit?.headers).get('cookie'), 'ls_session=session-value');
  assert.equal(new Headers(requestedInit?.headers).get('authorization'), 'Bearer admin-token');
  assert.equal(requestedInit?.cache, 'no-store');
  assert.ok(requestedInit?.signal);
});

test('data accuracy backend proxy requires its configured API URL', async (t) => {
  const originalUrl = process.env.NEXT_PUBLIC_API_URL;
  delete process.env.NEXT_PUBLIC_API_URL;
  t.after(() => {
    if (originalUrl !== undefined) process.env.NEXT_PUBLIC_API_URL = originalUrl;
  });

  await assert.rejects(
    requestDataAccuracyBackend(new Request('https://frontend.test/'), '/api/v1/data-qa/loop'),
    /NEXT_PUBLIC_API_URL is required/,
  );
});

test('data accuracy proxy preserves upstream status and response body', async () => {
  const response = await forwardDataAccuracyResponse(
    new Response('{"detail":"admin required"}', {
      status: 403,
      headers: { 'content-type': 'application/json' },
    }),
  );

  assert.equal(response.status, 403);
  assert.equal(response.headers.get('content-type'), 'application/json');
  assert.equal(await response.text(), '{"detail":"admin required"}');
});

test('data accuracy backend errors return an explicit unavailable response', async () => {
  const response = dataAccuracyBackendError(new Error('connection refused'), 'Backend unavailable');

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { error: 'connection refused' });
});
