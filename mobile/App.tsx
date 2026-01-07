/**
 * MOJ VIS Mobile App
 *
 * Root component for the React Native / Expo app.
 *
 * Phase 1: Added UnreadProvider for inbox state.
 */

import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import { UnreadProvider } from './src/contexts/UnreadContext';

export default function App(): React.JSX.Element {
  return (
    <SafeAreaProvider>
      <UnreadProvider>
        <StatusBar style="dark" />
        <AppNavigator />
      </UnreadProvider>
    </SafeAreaProvider>
  );
}
