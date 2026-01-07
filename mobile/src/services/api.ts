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

export default inboxApi;
