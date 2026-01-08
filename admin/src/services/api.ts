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
import type {
  AdminEvent,
  AdminEventInput,
  AdminEventListResponse,
} from '../types/event';
import type {
  StaticPageAdmin,
  StaticPageCreateInput,
  StaticPageDraftUpdateInput,
  StaticPageListResponse,
  AddBlockInput,
  BlockStructureUpdateInput,
  BlockContent,
} from '../types/static-page';
import type {
  FeedbackListResponse,
  FeedbackDetail,
  FeedbackStatus,
  ReplyInput,
} from '../types/feedback';
import type {
  ClickFixListResponse,
  ClickFixDetail,
  ClickFixStatus,
  ReplyInput as ClickFixReplyInput,
} from '../types/click-fix';

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
 * Normalize tags field - API may return string or array
 */
function normalizeTags(tags: unknown): string[] {
  if (Array.isArray(tags)) {
    return tags;
  }
  if (typeof tags === 'string') {
    try {
      const parsed = JSON.parse(tags);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    } catch {
      // Not valid JSON
    }
  }
  return [];
}

/**
 * Normalize inbox message to ensure tags is always an array
 */
function normalizeInboxMessage(message: InboxMessage): InboxMessage {
  return {
    ...message,
    tags: normalizeTags(message.tags),
  };
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
    const response = await apiRequest<InboxListResponse>(
      `/admin/inbox?page=${page}&page_size=${pageSize}`
    );
    return {
      ...response,
      messages: response.messages.map(normalizeInboxMessage),
    };
  },

  /**
   * Get single inbox message by ID
   */
  async getMessage(id: string): Promise<InboxMessage> {
    const message = await apiRequest<InboxMessage>(`/admin/inbox/${id}`);
    return normalizeInboxMessage(message);
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

/**
 * Admin Events API
 */
export const adminEventsApi = {
  /**
   * Get paginated list of all events (admin view)
   */
  async getEvents(
    page: number = 1,
    pageSize: number = 20
  ): Promise<AdminEventListResponse> {
    return apiRequest<AdminEventListResponse>(
      `/admin/events?page=${page}&page_size=${pageSize}`
    );
  },

  /**
   * Get single event by ID
   */
  async getEvent(id: string): Promise<AdminEvent> {
    return apiRequest<AdminEvent>(`/admin/events/${id}`);
  },

  /**
   * Create new event
   */
  async createEvent(input: AdminEventInput): Promise<AdminEvent> {
    return apiRequest<AdminEvent>('/admin/events', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Update existing event
   */
  async updateEvent(
    id: string,
    input: Partial<AdminEventInput>
  ): Promise<AdminEvent> {
    return apiRequest<AdminEvent>(`/admin/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  /**
   * Delete event
   */
  async deleteEvent(id: string): Promise<void> {
    await apiRequest(`/admin/events/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Admin Static Pages API
 */
export const adminStaticPagesApi = {
  /**
   * Get all pages (admin view)
   */
  async getPages(role: 'admin' | 'supervisor' = 'admin'): Promise<StaticPageListResponse> {
    return apiRequest<StaticPageListResponse>('/admin/pages', {
      headers: { 'x-admin-role': role },
    });
  },

  /**
   * Get single page by ID
   */
  async getPage(id: string, role: 'admin' | 'supervisor' = 'admin'): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${id}`, {
      headers: { 'x-admin-role': role },
    });
  },

  /**
   * Create new page (supervisor only)
   */
  async createPage(input: StaticPageCreateInput): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>('/admin/pages', {
      method: 'POST',
      headers: { 'x-admin-role': 'supervisor' },
      body: JSON.stringify(input),
    });
  },

  /**
   * Update draft content (admin)
   */
  async updateDraft(
    id: string,
    input: StaticPageDraftUpdateInput,
    role: 'admin' | 'supervisor' = 'admin'
  ): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${id}/draft`, {
      method: 'PATCH',
      headers: { 'x-admin-role': role },
      body: JSON.stringify(input),
    });
  },

  /**
   * Update single block content (admin - respects lock)
   */
  async updateBlockContent(
    pageId: string,
    blockId: string,
    content: BlockContent,
    role: 'admin' | 'supervisor' = 'admin'
  ): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${pageId}/blocks/${blockId}`, {
      method: 'PATCH',
      headers: { 'x-admin-role': role },
      body: JSON.stringify({ content }),
    });
  },

  /**
   * Add block to page (supervisor only)
   */
  async addBlock(pageId: string, input: AddBlockInput): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${pageId}/blocks`, {
      method: 'POST',
      headers: { 'x-admin-role': 'supervisor' },
      body: JSON.stringify(input),
    });
  },

  /**
   * Remove block from page (supervisor only)
   */
  async removeBlock(pageId: string, blockId: string): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${pageId}/blocks/${blockId}`, {
      method: 'DELETE',
      headers: { 'x-admin-role': 'supervisor' },
    });
  },

  /**
   * Update block structure/locks (supervisor only)
   */
  async updateBlockStructure(
    pageId: string,
    blockId: string,
    input: Omit<BlockStructureUpdateInput, 'block_id'>
  ): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${pageId}/blocks/${blockId}/structure`, {
      method: 'PATCH',
      headers: { 'x-admin-role': 'supervisor' },
      body: JSON.stringify(input),
    });
  },

  /**
   * Reorder blocks (supervisor only)
   */
  async reorderBlocks(pageId: string, blockIds: string[]): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${pageId}/blocks/reorder`, {
      method: 'PUT',
      headers: { 'x-admin-role': 'supervisor' },
      body: JSON.stringify({ block_ids: blockIds }),
    });
  },

  /**
   * Publish page (supervisor only)
   */
  async publishPage(id: string): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${id}/publish`, {
      method: 'POST',
      headers: { 'x-admin-role': 'supervisor' },
    });
  },

  /**
   * Unpublish page (supervisor only)
   */
  async unpublishPage(id: string): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${id}/unpublish`, {
      method: 'POST',
      headers: { 'x-admin-role': 'supervisor' },
    });
  },

  /**
   * Delete page (supervisor only)
   */
  async deletePage(id: string): Promise<void> {
    await apiRequest(`/admin/pages/${id}`, {
      method: 'DELETE',
      headers: { 'x-admin-role': 'supervisor' },
    });
  },
};

/**
 * Admin Feedback API
 */
export const adminFeedbackApi = {
  /**
   * Get paginated list of feedback (scoped by municipality)
   */
  async getFeedback(
    page: number = 1,
    pageSize: number = 20,
    municipality?: string
  ): Promise<FeedbackListResponse> {
    const headers: Record<string, string> = {};
    if (municipality) {
      headers['X-Admin-Municipality'] = municipality;
    }
    return apiRequest<FeedbackListResponse>(
      `/admin/feedback?page=${page}&page_size=${pageSize}`,
      { headers }
    );
  },

  /**
   * Get single feedback detail by ID
   */
  async getFeedbackDetail(id: string, municipality?: string): Promise<FeedbackDetail> {
    const headers: Record<string, string> = {};
    if (municipality) {
      headers['X-Admin-Municipality'] = municipality;
    }
    return apiRequest<FeedbackDetail>(`/admin/feedback/${id}`, { headers });
  },

  /**
   * Update feedback status
   */
  async updateStatus(
    id: string,
    status: FeedbackStatus,
    municipality?: string
  ): Promise<FeedbackDetail> {
    const headers: Record<string, string> = {};
    if (municipality) {
      headers['X-Admin-Municipality'] = municipality;
    }
    return apiRequest<FeedbackDetail>(`/admin/feedback/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Add reply to feedback
   */
  async addReply(
    id: string,
    input: ReplyInput,
    municipality?: string
  ): Promise<FeedbackDetail> {
    const headers: Record<string, string> = {};
    if (municipality) {
      headers['X-Admin-Municipality'] = municipality;
    }
    return apiRequest<FeedbackDetail>(`/admin/feedback/${id}/reply`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });
  },
};

/**
 * Admin Click & Fix API
 */
export const adminClickFixApi = {
  /**
   * Get paginated list of click fix issues (scoped by municipality)
   */
  async getClickFixes(
    page: number = 1,
    pageSize: number = 20,
    municipality?: string
  ): Promise<ClickFixListResponse> {
    const headers: Record<string, string> = {};
    if (municipality) {
      headers['X-Admin-Municipality'] = municipality;
    }
    return apiRequest<ClickFixListResponse>(
      `/admin/click-fix?page=${page}&page_size=${pageSize}`,
      { headers }
    );
  },

  /**
   * Get single click fix detail by ID
   */
  async getClickFixDetail(id: string, municipality?: string): Promise<ClickFixDetail> {
    const headers: Record<string, string> = {};
    if (municipality) {
      headers['X-Admin-Municipality'] = municipality;
    }
    return apiRequest<ClickFixDetail>(`/admin/click-fix/${id}`, { headers });
  },

  /**
   * Update click fix status
   */
  async updateStatus(
    id: string,
    status: ClickFixStatus,
    municipality?: string
  ): Promise<ClickFixDetail> {
    const headers: Record<string, string> = {};
    if (municipality) {
      headers['X-Admin-Municipality'] = municipality;
    }
    return apiRequest<ClickFixDetail>(`/admin/click-fix/${id}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Add reply to click fix
   */
  async addReply(
    id: string,
    input: ClickFixReplyInput,
    municipality?: string
  ): Promise<ClickFixDetail> {
    const headers: Record<string, string> = {};
    if (municipality) {
      headers['X-Admin-Municipality'] = municipality;
    }
    return apiRequest<ClickFixDetail>(`/admin/click-fix/${id}/reply`, {
      method: 'POST',
      headers,
      body: JSON.stringify(input),
    });
  },
};

export default adminInboxApi;
