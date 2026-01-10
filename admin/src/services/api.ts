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
import type {
  MenuExtra,
  MenuExtraCreateInput,
  MenuExtraUpdateInput,
  MenuExtrasListResponse,
} from '../types/menu-extras';

// TODO: Move to environment config
const API_BASE_URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://api.mojvis.hr';

/**
 * Make API request to admin endpoints
 *
 * Uses cookie-based session auth (credentials: 'include').
 * Redirects to /login on 401 responses.
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...options.headers as Record<string, string>,
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Send cookies with requests
  });

  // Handle auth errors - redirect to login
  if (response.status === 401 || response.status === 403) {
    // Avoid redirect loop if already on login page
    if (!window.location.pathname.startsWith('/login')) {
      window.location.href = '/login';
    }
    throw new Error('Not authenticated');
  }

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
    tags: normalizeTags(message.tags) as InboxMessage['tags'],
  };
}

/**
 * Admin Inbox API
 */
export const adminInboxApi = {
  /**
   * Get paginated list of inbox messages (admin view)
   *
   * @param page - Page number (1-indexed)
   * @param pageSize - Number of items per page
   * @param archived - Filter by archived status:
   *   - false (default): active messages only
   *   - true: archived messages only
   */
  async getMessages(
    page: number = 1,
    pageSize: number = 20,
    archived: boolean = false
  ): Promise<InboxListResponse> {
    const response = await apiRequest<InboxListResponse>(
      `/admin/inbox?page=${page}&page_size=${pageSize}&archived=${archived}`
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
   * Archive (soft delete) inbox message
   */
  async deleteMessage(id: string): Promise<void> {
    await apiRequest(`/admin/inbox/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Restore archived message
   */
  async restoreMessage(id: string): Promise<InboxMessage> {
    const message = await apiRequest<InboxMessage>(`/admin/inbox/${id}/restore`, {
      method: 'POST',
    });
    return normalizeInboxMessage(message);
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
 *
 * NOTE: Role/permission checks are now enforced by session on the backend.
 * All admins have equal privileges (supervisor role removed).
 */
export const adminStaticPagesApi = {
  /**
   * Get all pages (admin view)
   */
  async getPages(): Promise<StaticPageListResponse> {
    return apiRequest<StaticPageListResponse>('/admin/pages');
  },

  /**
   * Get single page by ID
   */
  async getPage(id: string): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${id}`);
  },

  /**
   * Create new page
   */
  async createPage(input: StaticPageCreateInput): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>('/admin/pages', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Update draft content
   */
  async updateDraft(
    id: string,
    input: StaticPageDraftUpdateInput
  ): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${id}/draft`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  /**
   * Update single block content (respects lock)
   */
  async updateBlockContent(
    pageId: string,
    blockId: string,
    content: BlockContent
  ): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${pageId}/blocks/${blockId}`, {
      method: 'PATCH',
      body: JSON.stringify({ content }),
    });
  },

  /**
   * Add block to page
   */
  async addBlock(pageId: string, input: AddBlockInput): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${pageId}/blocks`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Remove block from page
   */
  async removeBlock(pageId: string, blockId: string): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${pageId}/blocks/${blockId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Update block structure/locks
   */
  async updateBlockStructure(
    pageId: string,
    blockId: string,
    input: Omit<BlockStructureUpdateInput, 'block_id'>
  ): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${pageId}/blocks/${blockId}/structure`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  /**
   * Reorder blocks
   */
  async reorderBlocks(pageId: string, blockIds: string[]): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${pageId}/blocks/reorder`, {
      method: 'PUT',
      body: JSON.stringify({ block_ids: blockIds }),
    });
  },

  /**
   * Publish page
   */
  async publishPage(id: string): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${id}/publish`, {
      method: 'POST',
    });
  },

  /**
   * Unpublish page
   */
  async unpublishPage(id: string): Promise<StaticPageAdmin> {
    return apiRequest<StaticPageAdmin>(`/admin/pages/${id}/unpublish`, {
      method: 'POST',
    });
  },

  /**
   * Delete page
   */
  async deletePage(id: string): Promise<void> {
    await apiRequest(`/admin/pages/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Admin Feedback API
 *
 * NOTE: Municipality scoping is now enforced by session on the backend.
 */
export const adminFeedbackApi = {
  /**
   * Get paginated list of feedback (scoped by admin's municipality via session)
   */
  async getFeedback(
    page: number = 1,
    pageSize: number = 20
  ): Promise<FeedbackListResponse> {
    return apiRequest<FeedbackListResponse>(
      `/admin/feedback?page=${page}&page_size=${pageSize}`
    );
  },

  /**
   * Get single feedback detail by ID
   */
  async getFeedbackDetail(id: string): Promise<FeedbackDetail> {
    return apiRequest<FeedbackDetail>(`/admin/feedback/${id}`);
  },

  /**
   * Update feedback status
   */
  async updateStatus(
    id: string,
    status: FeedbackStatus
  ): Promise<FeedbackDetail> {
    return apiRequest<FeedbackDetail>(`/admin/feedback/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Add reply to feedback
   */
  async addReply(
    id: string,
    input: ReplyInput
  ): Promise<FeedbackDetail> {
    return apiRequest<FeedbackDetail>(`/admin/feedback/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};

/**
 * Admin Click & Fix API
 *
 * NOTE: Municipality scoping is now enforced by session on the backend.
 */
export const adminClickFixApi = {
  /**
   * Get paginated list of click fix issues (scoped by admin's municipality via session)
   */
  async getClickFixes(
    page: number = 1,
    pageSize: number = 20
  ): Promise<ClickFixListResponse> {
    return apiRequest<ClickFixListResponse>(
      `/admin/click-fix?page=${page}&page_size=${pageSize}`
    );
  },

  /**
   * Get single click fix detail by ID
   */
  async getClickFixDetail(id: string): Promise<ClickFixDetail> {
    return apiRequest<ClickFixDetail>(`/admin/click-fix/${id}`);
  },

  /**
   * Update click fix status
   */
  async updateStatus(
    id: string,
    status: ClickFixStatus
  ): Promise<ClickFixDetail> {
    return apiRequest<ClickFixDetail>(`/admin/click-fix/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  /**
   * Add reply to click fix
   */
  async addReply(
    id: string,
    input: ClickFixReplyInput
  ): Promise<ClickFixDetail> {
    return apiRequest<ClickFixDetail>(`/admin/click-fix/${id}/reply`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },
};

/**
 * Admin Menu Extras API
 */
export const adminMenuExtrasApi = {
  /**
   * Get all menu extras
   */
  async getExtras(): Promise<MenuExtrasListResponse> {
    return apiRequest<MenuExtrasListResponse>('/admin/menu/extras');
  },

  /**
   * Create a new menu extra
   */
  async createExtra(input: MenuExtraCreateInput): Promise<MenuExtra> {
    return apiRequest<MenuExtra>('/admin/menu/extras', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  },

  /**
   * Update an existing menu extra
   */
  async updateExtra(id: string, input: MenuExtraUpdateInput): Promise<MenuExtra> {
    return apiRequest<MenuExtra>(`/admin/menu/extras/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  },

  /**
   * Delete a menu extra
   */
  async deleteExtra(id: string): Promise<void> {
    await apiRequest(`/admin/menu/extras/${id}`, {
      method: 'DELETE',
    });
  },
};

/**
 * Admin Auth API
 *
 * Cookie-session based authentication.
 */
export interface AdminUser {
  id: string;
  username: string;
  municipality: 'vis' | 'komiza';
  notice_municipality_scope: 'vis' | 'komiza' | null; // Phase 3: which municipal notices admin can edit
  is_breakglass: boolean; // Breakglass admin bypasses municipal restrictions
}

export const adminAuthApi = {
  /**
   * Login with username and password
   * Sets session cookie on success
   */
  async login(username: string, password: string): Promise<{ ok: boolean; admin?: AdminUser; error?: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      return { ok: false, error: data.error || 'Login failed' };
    }

    return { ok: true, admin: data.admin };
  },

  /**
   * Logout - clears session cookie
   */
  async logout(): Promise<void> {
    await fetch(`${API_BASE_URL}/admin/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  },

  /**
   * Check current auth status
   * Returns admin info if authenticated, null otherwise
   */
  async checkAuth(): Promise<AdminUser | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/auth/me`, {
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return data.admin || null;
    } catch {
      return null;
    }
  },
};

export default adminInboxApi;
