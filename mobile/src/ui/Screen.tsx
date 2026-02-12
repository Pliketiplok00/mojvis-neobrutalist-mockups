/**
 * Screen Primitive
 *
 * Handles background + safe padding + scroll container options.
 * Wraps SafeAreaView and optional ScrollView.
 */

import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Text,
  type ViewStyle,
  type ScrollViewProps,
} from 'react-native';
import { skin, SKIN_TEST_MODE } from './skin';

interface ScreenProps {
  children: React.ReactNode;
  /** Enable scrolling (default: true) */
  scroll?: boolean;
  /** Additional ScrollView props when scroll=true */
  scrollViewProps?: Omit<ScrollViewProps, 'style' | 'contentContainerStyle'>;
  /** Apply standard content padding (default: true) */
  padded?: boolean;
  /** Additional style for the container */
  style?: ViewStyle;
  /** Additional style for content container */
  contentStyle?: ViewStyle;
}

export function Screen({
  children,
  scroll = true,
  scrollViewProps,
  padded = true,
  style,
  contentStyle,
}: ScreenProps): React.JSX.Element {
  const containerStyle = [
    styles.container,
    { backgroundColor: skin.colors.background },
    style,
  ];

  const contentContainerStyle = [
    padded && styles.paddedContent,
    contentStyle,
  ];

  // TEST MODE watermark - absolute positioned, doesn't block touches
  const testModeWatermark = SKIN_TEST_MODE ? (
    <View style={styles.watermarkContainer} pointerEvents="none">
      <Text style={styles.watermarkText}>TEST MODE</Text>
    </View>
  ) : null;

  if (scroll) {
    return (
      <SafeAreaView style={containerStyle}>
        {testModeWatermark}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={contentContainerStyle}
          {...scrollViewProps}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={containerStyle}>
      {testModeWatermark}
      <View style={[styles.staticContent, padded && styles.paddedContent, contentStyle]}>
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  staticContent: {
    flex: 1,
  },
  paddedContent: {
    padding: skin.spacing.lg,
    paddingBottom: skin.spacing.xxxl,
  },
  watermarkContainer: {
    position: 'absolute',
    top: 50,
    right: 8,
    zIndex: 9999,
    backgroundColor: skin.colors.testWatermarkBg,
    borderWidth: 3,
    borderColor: skin.colors.testWatermarkText,
    borderRadius: skin.borders.radiusSharp,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  watermarkText: {
    color: skin.colors.testWatermarkText,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
});

export default Screen;
