/**
 * API Service
 *
 * HTTP client for MOJ VIS backend API.
 */

import type {
  InboxListResponse,
  InboxMessage,
  BannerResponse,
  UserMode,
  Municipality,
  ScreenContext,
} from '../types/inbox';
import type {
  Event,
  EventListResponse,
  EventDatesResponse,
  SubscriptionStatusResponse,
} from '../types/event';
import type {
  StaticPageResponse,
  PageListResponse,
} from '../types/static-page';
import type {
  TransportType,
  LinesListResponse,
  LineDetailResponse,
  DeparturesListResponse,
  TodaysDeparturesResponse,
  LineContactsResponse,
} from '../types/transport';
import type {
  SubmitFeedbackRequest,
  FeedbackSubmitResponse,
  FeedbackDetailResponse,
  SentItemsListResponse,
} from '../types/feedback';

// TODO: Move to config/environment
const API_BASE_URL = __DEV__
  ? 'http://localhost:3000'
  : 'https://api.mojvis.hr';

/**
 * Get device ID for anonymous identification
 * TODO: Store persistently using AsyncStorage
 */
function getDeviceId(): string {
  // Placeholder - should be generated and stored on first launch
  return 'mobile-device-placeholder';
}

/**
 * Get current language preference
 * TODO: Get from app settings/context
 */
function getLanguage(): 'hr' | 'en' {
  // Default to Croatian
  return 'hr';
}

/**
 * User context for API requests
 */
interface UserContext {
  userMode: UserMode;
  municipality: Municipality;
}

/**
 * Make API request with proper headers
 */
async function apiRequest<T>(
  endpoint: string,
  context: UserContext,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Device-ID': getDeviceId(),
    'X-User-Mode': context.userMode,
    'Accept-Language': getLanguage(),
  };

  if (context.municipality) {
    headers['X-Municipality'] = context.municipality;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<T>;
}

/**
 * Inbox API
 */
export const inboxApi = {
  /**
   * Get paginated inbox messages
   */
  async getMessages(
    context: UserContext,
    page: number = 1,
    pageSize: number = 20
  ): Promise<InboxListResponse> {
    return apiRequest<InboxListResponse>(
      `/inbox?page=${page}&page_size=${pageSize}`,
      context
    );
  },

  /**
   * Get single inbox message by ID
   */
  async getMessage(
    context: UserContext,
    id: string
  ): Promise<InboxMessage> {
    return apiRequest<InboxMessage>(`/inbox/${id}`, context);
  },

  /**
   * Get active banners for a specific screen context
   *
   * Banner placement rules (per spec):
   * - Home: hitno, opcenito, vis/komiza (for matching locals)
   * - Road Transport: cestovni_promet OR hitno ONLY
   * - Sea Transport: pomorski_promet OR hitno ONLY
   */
  async getActiveBanners(
    context: UserContext,
    screenContext: ScreenContext
  ): Promise<BannerResponse> {
    return apiRequest<BannerResponse>(
      `/banners/active?screen=${screenContext}`,
      context
    );
  },
};

/**
 * Events API
 */
export const eventsApi = {
  /**
   * Get paginated events or events for a specific date
   */
  async getEvents(
    page: number = 1,
    pageSize: number = 20,
    date?: string
  ): Promise<EventListResponse> {
    const params = new URLSearchParams({
      page: String(page),
      page_size: String(pageSize),
    });
    if (date) {
      params.set('date', date);
    }

    const url = `${API_BASE_URL}/events?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': getLanguage(),
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<EventListResponse>;
  },

  /**
   * Get single event by ID
   */
  async getEvent(id: string): Promise<Event> {
    const url = `${API_BASE_URL}/events/${id}`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': getLanguage(),
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<Event>;
  },

  /**
   * Get dates with events for a month (for calendar view)
   */
  async getEventDates(year: number, month: number): Promise<EventDatesResponse> {
    const url = `${API_BASE_URL}/events/dates?year=${year}&month=${month}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<EventDatesResponse>;
  },

  /**
   * Subscribe to event reminder
   */
  async subscribe(eventId: string): Promise<SubscriptionStatusResponse> {
    const url = `${API_BASE_URL}/events/${eventId}/subscribe`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Device-ID': getDeviceId(),
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<SubscriptionStatusResponse>;
  },

  /**
   * Unsubscribe from event reminder
   */
  async unsubscribe(eventId: string): Promise<SubscriptionStatusResponse> {
    const url = `${API_BASE_URL}/events/${eventId}/subscribe`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-Device-ID': getDeviceId(),
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<SubscriptionStatusResponse>;
  },

  /**
   * Get subscription status for an event
   */
  async getSubscriptionStatus(eventId: string): Promise<SubscriptionStatusResponse> {
    const url = `${API_BASE_URL}/events/${eventId}/subscription`;
    const response = await fetch(url, {
      headers: {
        'X-Device-ID': getDeviceId(),
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<SubscriptionStatusResponse>;
  },
};

/**
 * Static Pages API
 */
export const staticPagesApi = {
  /**
   * Get list of published pages (for menu)
   */
  async getPages(): Promise<PageListResponse> {
    const url = `${API_BASE_URL}/pages`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': getLanguage(),
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<PageListResponse>;
  },

  /**
   * Get published page by slug (with notice injection)
   */
  async getPage(
    slug: string,
    context: UserContext
  ): Promise<StaticPageResponse> {
    const url = `${API_BASE_URL}/pages/${slug}`;

    const headers: Record<string, string> = {
      'Accept-Language': getLanguage(),
      'X-Device-ID': getDeviceId(),
      'X-User-Mode': context.userMode,
    };

    if (context.municipality) {
      headers['X-Municipality'] = context.municipality;
    }

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<StaticPageResponse>;
  },
};

/**
 * Transport API
 *
 * Read-only transport timetables (Phase 4).
 * Direction is resolved via route_id (direction: 0 or 1).
 */
export const transportApi = {
  /**
   * Get lines for a transport type
   */
  async getLines(type: TransportType): Promise<LinesListResponse> {
    const url = `${API_BASE_URL}/transport/${type}/lines`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': getLanguage(),
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<LinesListResponse>;
  },

  /**
   * Get line detail with routes and contacts
   */
  async getLine(type: TransportType, id: string): Promise<LineDetailResponse> {
    const url = `${API_BASE_URL}/transport/${type}/lines/${id}`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': getLanguage(),
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<LineDetailResponse>;
  },

  /**
   * Get departures for a line on a specific date and direction
   * Direction: 0 or 1 (resolved via route_id)
   */
  async getDepartures(
    type: TransportType,
    lineId: string,
    date: string,
    direction: number
  ): Promise<DeparturesListResponse> {
    const params = new URLSearchParams({
      date,
      direction: String(direction),
    });
    const url = `${API_BASE_URL}/transport/${type}/lines/${lineId}/departures?${params.toString()}`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': getLanguage(),
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<DeparturesListResponse>;
  },

  /**
   * Get today's departures for a transport type
   */
  async getTodaysDepartures(
    type: TransportType,
    date?: string
  ): Promise<TodaysDeparturesResponse> {
    const params = date ? `?date=${date}` : '';
    const url = `${API_BASE_URL}/transport/${type}/today${params}`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': getLanguage(),
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<TodaysDeparturesResponse>;
  },

  /**
   * Get contacts for a specific line
   */
  async getLineContacts(
    type: TransportType,
    lineId: string
  ): Promise<LineContactsResponse> {
    const url = `${API_BASE_URL}/transport/${type}/lines/${lineId}/contacts`;
    const response = await fetch(url, {
      headers: {
        'Accept-Language': getLanguage(),
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<LineContactsResponse>;
  },
};

/**
 * Feedback API
 *
 * Phase 5: User feedback submission and retrieval.
 * Anonymous (device-based), integrates with Inbox.
 */
export const feedbackApi = {
  /**
   * Submit new feedback
   */
  async submit(
    context: UserContext,
    data: SubmitFeedbackRequest
  ): Promise<FeedbackSubmitResponse> {
    const url = `${API_BASE_URL}/feedback`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'X-Device-ID': getDeviceId(),
      'X-User-Mode': context.userMode,
      'Accept-Language': getLanguage(),
    };

    if (context.municipality) {
      headers['X-Municipality'] = context.municipality;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    if (response.status === 429) {
      // Rate limit exceeded
      const errorData = await response.json();
      throw new Error(errorData.error || 'Rate limit exceeded');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    return response.json() as Promise<FeedbackSubmitResponse>;
  },

  /**
   * Get feedback detail by ID
   */
  async getDetail(id: string): Promise<FeedbackDetailResponse> {
    const url = `${API_BASE_URL}/feedback/${id}`;

    const headers: Record<string, string> = {
      'X-Device-ID': getDeviceId(),
      'Accept-Language': getLanguage(),
    };

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<FeedbackDetailResponse>;
  },

  /**
   * Get sent items (for Inbox → Sent tab)
   */
  async getSentItems(
    page: number = 1,
    pageSize: number = 20
  ): Promise<SentItemsListResponse> {
    const url = `${API_BASE_URL}/feedback/sent?page=${page}&page_size=${pageSize}`;

    const headers: Record<string, string> = {
      'X-Device-ID': getDeviceId(),
      'Accept-Language': getLanguage(),
    };

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<SentItemsListResponse>;
  },
};

export default inboxApi;
