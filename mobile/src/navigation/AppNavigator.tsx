/**
 * App Navigator
 *
 * Root navigation structure for MOJ VIS app.
 *
 * Structure:
 * - Root Navigator
 *   - Onboarding Stack (first launch)
 *   - Main Stack (after onboarding)
 *
 * Phase 0: Basic skeleton, no persistence logic.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Types
import type { RootStackParamList, OnboardingStackParamList, MainStackParamList } from './types';

// Screens
import { LanguageSelectionScreen } from '../screens/onboarding/LanguageSelectionScreen';
import { UserModeSelectionScreen } from '../screens/onboarding/UserModeSelectionScreen';
import { MunicipalitySelectionScreen } from '../screens/onboarding/MunicipalitySelectionScreen';
import { HomeScreen } from '../screens/home/HomeScreen';

// Create navigators
const RootStack = createNativeStackNavigator<RootStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const MainStack = createNativeStackNavigator<MainStackParamList>();

/**
 * Onboarding Navigator
 * Language → User Mode → Municipality (if local) → Home
 */
function OnboardingNavigator(): React.JSX.Element {
  return (
    <OnboardingStack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <OnboardingStack.Screen
        name="LanguageSelection"
        component={LanguageSelectionScreen}
      />
      <OnboardingStack.Screen
        name="UserModeSelection"
        component={UserModeSelectionScreen}
      />
      <OnboardingStack.Screen
        name="MunicipalitySelection"
        component={MunicipalitySelectionScreen}
      />
    </OnboardingStack.Navigator>
  );
}

/**
 * Main Navigator
 * All screens after onboarding is complete.
 */
function MainNavigator(): React.JSX.Element {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerShown: false, // We use GlobalHeader component
        animation: 'slide_from_right',
      }}
    >
      <MainStack.Screen name="Home" component={HomeScreen} />
      {/* TODO: Add more screens in later phases */}
      {/* <MainStack.Screen name="Events" component={EventsScreen} /> */}
      {/* <MainStack.Screen name="Transport" component={TransportScreen} /> */}
      {/* <MainStack.Screen name="Inbox" component={InboxScreen} /> */}
    </MainStack.Navigator>
  );
}

/**
 * Root Navigator
 * Decides whether to show onboarding or main app.
 */
export function AppNavigator(): React.JSX.Element {
  // TODO: Check if onboarding is complete (stored locally)
  const hasCompletedOnboarding = false; // Phase 0: Always show onboarding

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {hasCompletedOnboarding ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

export default AppNavigator;
