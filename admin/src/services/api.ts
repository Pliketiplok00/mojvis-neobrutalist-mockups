/**
 * Admin API Service
 *
 * HTTP client for MOJ VIS admin backend API.
 */

import type {
  InboxMessage,
  InboxMessageInput,
  InboxListResponse,
} from '../types/inbox';

// TODO: Move to environment config
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://api.mojvis.hr';

/**
 * Make API request to admin endpoints
 *
 * NOTE: Admin panel will have supervisor login in future phases.
 * Currently no authentication is implemented.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // TODO: Add supervisor session token when implemented
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    // 'Authorization': `Bearer ${getToken()}`,
    ...options.headers as Record<string, string>,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API Error: ${response.status} - ${error}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Admin Inbox API
 */
export const adminInboxApi = {
  /**
   * Get paginated list of all inbox messages (admin view)
   */
  async getMessages(
    page: number = 1,
    pageSize: number = 20
  ): Promise<InboxListResponse> {
    return apiRequest<InboxListResponse>(
      `/admin/inbox?page=${page}&page_size=${pageSize}`
    );
  },

  /**
   * Get single inbox message by ID
   */
  async getMessage(id: string): Promise<InboxMessage> {
    return apiRequest<InboxMessage>(`/admin/inbox/${id}`);
  },

  /**
   * Create new inbox message
   */
  async createMessage(input: InboxMessageInput): Promise<InboxMessage> {
    return apiRequest<InboxMessage>('/admin/inbox', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Update existing inbox message
   */
  async updateMessage(
    id: string,
    input: Partial<InboxMessageInput>
  ): Promise<InboxMessage> {
    return apiRequest<InboxMessage>(`/admin/inbox/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  /**
   * Delete inbox message
   */
  async deleteMessage(id: string): Promise<void> {
    await apiRequest(`/admin/inbox/${id}`, {
      method: 'DELETE',
    });
  },
};

export default adminInboxApi;
