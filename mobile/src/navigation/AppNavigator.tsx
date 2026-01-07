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
 * Phase 1: Added Inbox screens.
 * Phase 2: Added Events screens.
 * Phase 3: Added Static Pages screen.
 * Phase 4: Added Transport screens (hub, road, sea, line detail).
 * Phase 5: Added Feedback screens.
 * Phase 5.1: Fixed onboarding navigation with persistence.
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useOnboarding } from '../contexts/OnboardingContext';

// Types
import type { RootStackParamList, OnboardingStackParamList, MainStackParamList } from './types';

// Screens
import { LanguageSelectionScreen } from '../screens/onboarding/LanguageSelectionScreen';
import { UserModeSelectionScreen } from '../screens/onboarding/UserModeSelectionScreen';
import { MunicipalitySelectionScreen } from '../screens/onboarding/MunicipalitySelectionScreen';
import { HomeScreen } from '../screens/home/HomeScreen';
import { InboxListScreen } from '../screens/inbox/InboxListScreen';
import { InboxDetailScreen } from '../screens/inbox/InboxDetailScreen';
import { TransportHubScreen } from '../screens/transport/TransportHubScreen';
import { RoadTransportScreen } from '../screens/transport/RoadTransportScreen';
import { RoadLineDetailScreen } from '../screens/transport/RoadLineDetailScreen';
import { SeaTransportScreen } from '../screens/transport/SeaTransportScreen';
import { SeaLineDetailScreen } from '../screens/transport/SeaLineDetailScreen';
import { EventsScreen } from '../screens/events/EventsScreen';
import { EventDetailScreen } from '../screens/events/EventDetailScreen';
import { StaticPageScreen } from '../screens/pages/StaticPageScreen';
import { FeedbackFormScreen } from '../screens/feedback/FeedbackFormScreen';
import { FeedbackConfirmationScreen } from '../screens/feedback/FeedbackConfirmationScreen';
import { FeedbackDetailScreen } from '../screens/feedback/FeedbackDetailScreen';

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
      <MainStack.Screen name="Events" component={EventsScreen} />
      <MainStack.Screen name="EventDetail" component={EventDetailScreen} />
      <MainStack.Screen name="Inbox" component={InboxListScreen} />
      <MainStack.Screen name="InboxDetail" component={InboxDetailScreen} />
      <MainStack.Screen name="TransportHub" component={TransportHubScreen} />
      <MainStack.Screen name="RoadTransport" component={RoadTransportScreen} />
      <MainStack.Screen name="RoadLineDetail" component={RoadLineDetailScreen} />
      <MainStack.Screen name="SeaTransport" component={SeaTransportScreen} />
      <MainStack.Screen name="SeaLineDetail" component={SeaLineDetailScreen} />
      <MainStack.Screen name="FeedbackForm" component={FeedbackFormScreen} />
      <MainStack.Screen name="FeedbackConfirmation" component={FeedbackConfirmationScreen} />
      <MainStack.Screen name="FeedbackDetail" component={FeedbackDetailScreen} />
      <MainStack.Screen name="StaticPage" component={StaticPageScreen} />
    </MainStack.Navigator>
  );
}

/**
 * Root Navigator
 * Decides whether to show onboarding or main app.
 */
export function AppNavigator(): React.JSX.Element {
  const { isComplete, isLoading } = useOnboarding();

  // Show loading screen while checking onboarding status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000000" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isComplete ? (
          <RootStack.Screen name="Main" component={MainNavigator} />
        ) : (
          <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});

export default AppNavigator;
