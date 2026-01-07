/**
 * MOJ VIS Mobile App
 *
 * Root component for the React Native / Expo app.
 *
 * Phase 1: Added UnreadProvider for inbox state.
 * Phase 5.1: Added OnboardingProvider for onboarding persistence.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { UnreadProvider } from './src/contexts/UnreadContext';
import { OnboardingProvider } from './src/contexts/OnboardingContext';

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <OnboardingProvider>
        <UnreadProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </UnreadProvider>
      </OnboardingProvider>
    </SafeAreaProvider>
  );
}
