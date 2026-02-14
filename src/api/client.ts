import { SdkResponse } from './requests';
import { config } from './config';

// Define a type for API request options
interface ApiRequestOptions {
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

// Utility function to handle API requests
export const createApiRequest = async ({
  endpoint,
  method,
  headers = {},
  body,
}: ApiRequestOptions): Promise<SdkResponse<Record<string, any>>> => {
  try {
    const response = await fetch(config.apiGatewayUrl + endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : null, // Ensure body is null when undefined
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    // Attempt to parse JSON, return null if the body is empty
    let data = null;
    try {
      const responseJSON = await response.json();
      data = responseJSON.data;
    } catch (jsonError) {
      if (response.headers.get('Content-Type')?.includes('application/json')) {
        console.error('Failed to parse JSON response:', jsonError);
      }
    }

    return [data, null];
  } catch (error) {
    console.error('API Request Error:', error);
    return [null, error as Error]; // Explicitly cast error to Error type
  }
};
