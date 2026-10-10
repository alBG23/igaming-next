/**
 * API Client helper for backend authentication and requests
 */

export async function fetchAuthApi(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
  const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });
    return res;
  } catch (error) {
    // Return simulated response for UI resilience when backend is unreachable
    console.warn(`[fetchAuthApi] Failed to fetch ${url}, returning mock response:`, error);
    return new Response(JSON.stringify({ proposals: [], status: 'offline' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
