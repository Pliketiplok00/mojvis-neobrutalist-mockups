/**
 * MOJ VIS Mobile App
 *
 * Root component for the React Native / Expo app.
 *
 * Phase 1: Added UnreadProvider for inbox state.
 * Phase 5.1: Added OnboardingProvider for onboarding persistence.
 * Phase 5.2: Added MenuProvider and MenuOverlay for hamburger menu.
 */

import React, { useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainerRef } from '@react-navigation/native';
import { AppNavigator } from './src/navigation/AppNavigator';
import { UnreadProvider } from './src/contexts/UnreadContext';
import { OnboardingProvider, useOnboarding } from './src/contexts/OnboardingContext';
import { MenuProvider, useMenu } from './src/contexts/MenuContext';
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
 * App content with menu overlay
 */
function AppContent(): React.JSX.Element {
  const { isMenuOpen, closeMenu } = useMenu();
  const { isComplete } = useOnboarding();

  const handleNavigate = useCallback((route: string) => {
    navigate(route as keyof MainStackParamList);
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
        <MenuProvider>
          <UnreadProvider>
            <StatusBar style="dark" />
            <AppContent />
          </UnreadProvider>
        </MenuProvider>
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
