/**
 * Fauna Screen
 *
 * Educational screen about the fauna of Vis Island.
 * Subpage of "Flora & Fauna" section.
 *
 * Structure (mirrors Flora):
 * 1. Hero (no shadow)
 * 2. Why special (with shadow)
 * 3. Highlights (with shadow)
 * 4. Warning / guide card (with shadow) - introduces species list
 * 5. Species cards (with shadows)
 * 6. Sensitive areas (with shadow, image + white text)
 * 7. Closing note (no shadow, transport-note style)
 *
 * Skin-pure: Uses skin tokens only (no hardcoded colors).
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalHeader } from '../../components/GlobalHeader';
import { H1 } from '../../ui/Text';
import { skin } from '../../ui/skin';

const { colors, spacing } = skin;

export function FaunaScreen(): React.JSX.Element {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader type="child" />
      <View style={styles.placeholder}>
        <H1>Fauna Screen</H1>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
});

export default FaunaScreen;
