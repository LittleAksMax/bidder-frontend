// src/api/client.ts

// Get API gateway URL from Vite environment variables, with fallback and validation
import { config } from './config';

export async function apiRequest(path: string, options?: RequestInit) {
  const baseUrl = config.apiGatewayUrl;
  const url = baseUrl.endsWith('/')
    ? `${baseUrl}${path.replace(/^\//, '')}`
    : `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }
  // Try to parse JSON, fallback to text if not JSON
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

// Usage example:
// apiRequest('/resource', { method: 'GET' })
