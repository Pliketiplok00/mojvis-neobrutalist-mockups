/**
 * Push Notification Context
 *
 * Phase 7: Manages push notification registration and settings.
 *
 * Key behaviors:
 * - Auto-registers token after onboarding completes
 * - Uses user's language from onboarding (NO fallback)
 * - Toggle in Settings to enable/disable push
 * - Handles notification tap for deep linking to Inbox
 *
 * Push is ONLY for hitno (emergency) Inbox messages.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { Platform, AppState, type AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { pushApi } from '../services/api';
import { useOnboarding } from './OnboardingContext';
import type { PushNotificationPayload } from '../types/push';

// Storage key for local opt-in state
const PUSH_OPT_IN_KEY = '@mojvis/push_opt_in';

// Configure notification handler for foreground notifications
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

// Context value type
interface PushContextValue {
  isRegistered: boolean;
  isOptIn: boolean;
  isLoading: boolean;
  error: string | null;
  setOptIn: (value: boolean) => Promise<void>;
  lastNotificationData: PushNotificationPayload | null;
  clearLastNotification: () => void;
}

// Default context value
const defaultValue: PushContextValue = {
  isRegistered: false,
  isOptIn: true, // Default ON per spec
  isLoading: true,
  error: null,
  setOptIn: async () => {},
  lastNotificationData: null,
  clearLastNotification: () => {},
};

// Create context
const PushContext = createContext<PushContextValue>(defaultValue);

// Provider props
interface PushProviderProps {
  children: ReactNode;
}

/**
 * Get Expo push token
 */
async function getExpoPushToken(): Promise<string | null> {
  // Must be a physical device
  if (!Device.isDevice) {
    console.warn('[Push] Push notifications require a physical device');
    return null;
  }

  // Check/request permissions
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.warn('[Push] Permission not granted');
    return null;
  }

  // Get token
  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId,
    });
    return tokenData.data;
  } catch (error) {
    console.error('[Push] Error getting token:', error);
    return null;
  }
}

/**
 * Push Notification Provider
 */
export function PushProvider({ children }: PushProviderProps): React.JSX.Element {
  const { isComplete, data } = useOnboarding();
  const [isRegistered, setIsRegistered] = useState(false);
  const [isOptIn, setIsOptInState] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastNotificationData, setLastNotificationData] = useState<PushNotificationPayload | null>(null);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);
  const appState = useRef(AppState.currentState);

  // Load local opt-in state
  useEffect(() => {
    const loadOptIn = async () => {
      try {
        const stored = await AsyncStorage.getItem(PUSH_OPT_IN_KEY);
        if (stored !== null) {
          setIsOptInState(stored === 'true');
        }
      } catch (err) {
        console.error('[Push] Error loading opt-in state:', err);
      }
    };
    void loadOptIn();
  }, []);

  // Register push token after onboarding
  useEffect(() => {
    if (!isComplete || !data) {
      setIsLoading(false);
      return;
    }

    const registerPush = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = await getExpoPushToken();
        if (!token) {
          setIsLoading(false);
          return;
        }

        const platform = Platform.OS as 'ios' | 'android';
        const language = data.language;

        console.info('[Push] Registering token:', {
          platform,
          language,
          token: token.slice(0, 30) + '...',
        });

        await pushApi.registerToken(token, platform, language);
        setIsRegistered(true);

        // Set Android notification channel
        if (Platform.OS === 'android') {
          await Notifications.setNotificationChannelAsync('emergency', {
            name: 'Hitne obavijesti',
            description: 'Emergency notifications from MOJ VIS',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }
      } catch (err) {
        console.error('[Push] Registration error:', err);
        setError(err instanceof Error ? err.message : 'Registration failed');
      } finally {
        setIsLoading(false);
      }
    };

    void registerPush();
  }, [isComplete, data]);

  // Listen for notifications
  useEffect(() => {
    // Foreground notifications
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification: Notifications.Notification) => {
        console.info('[Push] Notification received:', notification.request.content);
      }
    );

    // Notification tap (interaction)
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response: Notifications.NotificationResponse) => {
        const notificationData = response.notification.request.content.data as PushNotificationPayload;
        console.info('[Push] Notification tapped:', notificationData);

        if (notificationData.inbox_message_id) {
          setLastNotificationData(notificationData);
        }
      }
    );

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  // Handle app state changes (re-register on foreground)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        isComplete &&
        data
      ) {
        // App has come to foreground - could re-check registration
        console.info('[Push] App returned to foreground');
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [isComplete, data]);

  // Set opt-in preference
  const setOptIn = useCallback(async (value: boolean) => {
    try {
      setIsOptInState(value);
      await AsyncStorage.setItem(PUSH_OPT_IN_KEY, value.toString());

      if (isRegistered) {
        await pushApi.updateOptIn(value);
      }
    } catch (err) {
      console.error('[Push] Error updating opt-in:', err);
      // Revert on error
      setIsOptInState(!value);
      throw err;
    }
  }, [isRegistered]);

  // Clear last notification (after navigating)
  const clearLastNotification = useCallback(() => {
    setLastNotificationData(null);
  }, []);

  const value: PushContextValue = {
    isRegistered,
    isOptIn,
    isLoading,
    error,
    setOptIn,
    lastNotificationData,
    clearLastNotification,
  };

  return (
    <PushContext.Provider value={value}>
      {children}
    </PushContext.Provider>
  );
}

/**
 * Hook to access push context
 */
export function usePush(): PushContextValue {
  const context = useContext(PushContext);
  if (!context) {
    throw new Error('usePush must be used within PushProvider');
  }
  return context;
}

export default PushContext;
