import { SdkResponse } from './requests';
import { config } from './config';

// Define a type for API request options
interface ApiRequestOptions {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  authKey?: string;
  headers?: Record<string, string>;
  args?: Record<string, string | string[]>;
  body?: any;
}

const processArgs = (args: Record<string, string | string[]>): string => {
  const query = Object.entries(args)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return `${encodeURIComponent(key)}=${encodeURIComponent(value.join(','))}`;
      }
      return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
    })
    .join('&');
  return `?${query}`;
};

// Utility function to handle API requests
export const createApiRequest = async ({
  endpoint,
  method,
  authKey,
  headers = {},
  args = {},
  body,
}: ApiRequestOptions): Promise<SdkResponse<Record<string, any>>> => {
  try {
    const path = config.apiGatewayUrl + endpoint + processArgs(args);
    const response = await fetch(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authKey}`,
        ...headers,
      },
      body: body ? JSON.stringify(body) : null, // Ensure body is null when undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Attempt to parse JSON, return null if the body is empty
    let data = null;
    let success = false;
    try {
      const responseJSON = await response.json();
      data = responseJSON.data;
      success = responseJSON.success;
    } catch (jsonError) {
      if (response.headers.get('Content-Type')?.includes('application/json')) {
        console.error('Failed to parse JSON response:', jsonError);
      }
    }

    return [success, data, null];
  } catch (error) {
    console.error('API Request Error:', error);
    return [false, null, error as Error]; // Explicitly cast error to Error type
  }
};
