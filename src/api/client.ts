import { SdkResponse } from './contracts';
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

const extractApiErrorMessage = (payload: Record<string, any> | null): string | null => {
  const messageCandidates = [
    payload?.message,
    payload?.error,
    payload?.detail,
    payload?.data?.message,
    payload?.data?.error,
    payload?.data?.detail,
  ];

  const directMessage = messageCandidates.find(
    (candidate): candidate is string =>
      typeof candidate === 'string' && candidate.trim().length > 0,
  );

  if (directMessage) {
    return directMessage;
  }

  if (Array.isArray(payload?.errors)) {
    const joinedMessages = payload.errors
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry.trim();
        }

        if (typeof entry?.message === 'string') {
          return entry.message.trim();
        }

        return '';
      })
      .filter(Boolean)
      .join(', ');

    if (joinedMessages.length > 0) {
      return joinedMessages;
    }
  }

  return null;
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

    let responseJSON: Record<string, any> | null = null;
    if (response.headers.get('Content-Type')?.includes('application/json')) {
      try {
        responseJSON = (await response.json()) as Record<string, any>;
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
      }
    }

    const apiErrorMessage = extractApiErrorMessage(responseJSON);

    if (!response.ok) {
      throw new Error(apiErrorMessage ?? `HTTP error! status: ${response.status}`);
    }

    return [
      responseJSON?.success as boolean,
      responseJSON?.data ?? null,
      responseJSON?.success ? null : new Error(apiErrorMessage ?? 'Request failed'),
    ];
  } catch (error) {
    console.error('API Request Error:', error);
    return [false, null, error as Error]; // Explicitly cast error to Error type
  }
};
