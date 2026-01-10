/**
 * MOJ VIS Mobile App
 *
 * Root component for the React Native / Expo app.
 *
 * Phase 1: Added UnreadProvider for inbox state.
 * Phase 5.1: Added OnboardingProvider for onboarding persistence.
 * Phase 5.2: Added MenuProvider and MenuOverlay for hamburger menu.
 * Phase 7: Added PushProvider for push notification management.
 */

import React, { useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainerRef, CommonActions } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { UnreadProvider } from './src/contexts/UnreadContext';
import { OnboardingProvider, useOnboarding } from './src/contexts/OnboardingContext';
import { MenuProvider, useMenu } from './src/contexts/MenuContext';
import { PushProvider, usePush } from './src/contexts/PushContext';
import { LanguageProvider } from './src/i18n';
import { MenuOverlay } from './src/components/MenuOverlay';
import type { MainStackParamList } from './src/navigation/types';

// Navigation ref for menu to navigate
export const navigationRef = React.createRef<NavigationContainerRef<MainStackParamList>>();

/**
 * Navigate from outside NavigationContainer
 */
export function navigate(name: keyof MainStackParamList): void {
  navigationRef.current?.navigate(name as never);
}

/**
 * Navigate to InboxDetail from push notification
 */
function navigateToInboxDetail(messageId: string): void {
  // Navigate to Inbox first, then to detail
  // This ensures proper back navigation
  navigationRef.current?.navigate('Inbox' as never);
  setTimeout(() => {
    navigationRef.current?.dispatch(
      CommonActions.navigate({
        name: 'InboxDetail',
        params: { messageId },
      })
    );
  }, 100);
}

/**
 * App content with menu overlay and push notification handling
 */
function AppContent(): React.JSX.Element {
  const { isMenuOpen, closeMenu } = useMenu();
  const { isComplete } = useOnboarding();
  const { lastNotificationData, clearLastNotification } = usePush();

  // Handle push notification tap deep linking
  useEffect(() => {
    if (lastNotificationData?.inbox_message_id && isComplete) {
      const messageId = lastNotificationData.inbox_message_id;
      console.info('[App] Navigating to inbox message from push:', messageId);

      // Navigate to the message
      navigateToInboxDetail(messageId);

      // Clear so we don't navigate again
      clearLastNotification();
    }
  }, [lastNotificationData, isComplete, clearLastNotification]);

  const handleNavigate = useCallback((route: string) => {
    // Handle StaticPage routes with slug (format: "StaticPage:slug")
    if (route.startsWith('StaticPage:')) {
      const slug = route.substring('StaticPage:'.length);
      navigationRef.current?.dispatch(
        CommonActions.navigate({
          name: 'StaticPage',
          params: { slug },
        })
      );
    } else {
      navigate(route as keyof MainStackParamList);
    }
  }, []);

  return (
    <View style={styles.container}>
      <AppNavigator navigationRef={navigationRef} />
      {isComplete && (
        <MenuOverlay
          visible={isMenuOpen}
          onClose={closeMenu}
          onNavigate={handleNavigate}
        />
      )}
    </View>
  );
}

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <LanguageProvider>
          <PushProvider>
            <MenuProvider>
              <UnreadProvider>
                <StatusBar style="dark" />
                <AppContent />
              </UnreadProvider>
            </MenuProvider>
          </PushProvider>
        </LanguageProvider>
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
