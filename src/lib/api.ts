/**
 * API Client helper for backend authentication and requests
 */

export async function fetchAuthApi(endpoint: string, options: RequestInit = {}): Promise<Response> {
  if (!endpoint.startsWith('/api/v1/curator/')) {
    throw new Error('fetchAuthApi only supports curator API requests.');
  }

  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  return fetch(endpoint, {
    ...options,
    headers,
    credentials: 'same-origin',
    cache: 'no-store',
  });
}
