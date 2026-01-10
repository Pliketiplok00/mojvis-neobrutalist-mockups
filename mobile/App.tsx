/**
 * MOJ VIS Mobile App
 *
 * Root component for the React Native / Expo app.
 *
 * Phase 1: Added UnreadProvider for inbox state.
 * Phase 5.1: Added OnboardingProvider for onboarding persistence.
 * Phase 5.2: Added MenuProvider and MenuOverlay for hamburger menu.
 * Phase 7: Added PushProvider for push notification management.
 * Phase 2a: Added font loading with useAppFonts hook.
 */

import React, { useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainerRef, CommonActions } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { UnreadProvider } from './src/contexts/UnreadContext';
import { OnboardingProvider, useOnboarding } from './src/contexts/OnboardingContext';
import { MenuProvider, useMenu } from './src/contexts/MenuContext';
import { PushProvider, usePush } from './src/contexts/PushContext';
import { LanguageProvider } from './src/i18n';
import { MenuOverlay } from './src/components/MenuOverlay';
import { useAppFonts } from './src/ui/fonts';
import { skin } from './src/ui/skin';
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

/**
 * Font loading screen - shown while fonts are loading.
 * Uses skin tokens for styling (no hardcoded hex colors).
 */
function FontLoadingScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.loadingContainer}>
      <ActivityIndicator size="large" color={skin.colors.primary} />
      <Text style={styles.loadingText}>MOJ VIS</Text>
    </SafeAreaView>
  );
}

/**
 * Font error screen - shown if fonts fail to load.
 * Uses skin tokens for styling (no hardcoded hex colors).
 */
function FontErrorScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.loadingContainer}>
      <Text style={styles.errorText}>Font loading failed</Text>
      <Text style={styles.errorSubtext}>Please restart the app</Text>
    </SafeAreaView>
  );
}

export default function App(): React.JSX.Element {
  const [fontsLoaded, fontError] = useAppFonts();

  // Show loading screen while fonts are loading
  if (!fontsLoaded && !fontError) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <FontLoadingScreen />
      </SafeAreaProvider>
    );
  }

  // Show error screen if fonts failed to load
  if (fontError) {
    return (
      <SafeAreaProvider>
        <StatusBar style="dark" />
        <FontErrorScreen />
      </SafeAreaProvider>
    );
  }

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: skin.colors.background,
  },
  loadingText: {
    marginTop: skin.spacing.lg,
    fontSize: skin.typography.fontSize.xxl,
    fontWeight: skin.typography.fontWeight.bold,
    color: skin.colors.textPrimary,
  },
  errorText: {
    fontSize: skin.typography.fontSize.lg,
    fontWeight: skin.typography.fontWeight.semiBold,
    color: skin.colors.errorText,
    marginBottom: skin.spacing.sm,
  },
  errorSubtext: {
    fontSize: skin.typography.fontSize.md,
    color: skin.colors.textMuted,
  },
});
