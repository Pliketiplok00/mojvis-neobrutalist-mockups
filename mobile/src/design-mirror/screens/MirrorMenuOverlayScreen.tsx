/**
 * Mirror Menu Overlay Screen
 *
 * Dev-only mirror of the MenuOverlay component.
 * Uses fixture data instead of API calls.
 *
 * This screen displays the menu overlay in a full-screen view
 * for visual inspection and auditing.
 *
 * Skin-pure: Uses skin tokens only (no hardcoded hex, no magic numbers).
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Icon, type IconName } from '../../ui/Icon';
import { skin } from '../../ui/skin';
import { H1, Label, Meta } from '../../ui/Text';
import { menuItemsFixture } from '../fixtures/transport';
import type { MainStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU_WIDTH = SCREEN_WIDTH * 0.75;

export function MirrorMenuOverlayScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  // Mock active route for visual testing
  const currentRoute = 'Home';

  const handleBack = () => {
    navigation.goBack();
  };

  // For mirror, we don't actually navigate - just show visual feedback
  const handleItemPress = (route: string) => {
    // No-op for mirror - just for visual testing
    console.log('[MirrorMenuOverlay] Pressed:', route);
  };

  return (
    <View style={styles.container}>
      {/* Simulated Backdrop */}
      <View style={styles.backdrop} />

      {/* Menu Panel */}
      <View style={styles.menuPanel}>
        <SafeAreaView style={styles.menuContent}>
          {/* Header */}
          <View style={styles.header}>
            <H1 style={styles.headerTitle} color={skin.colors.primaryText}>MOJ VIS</H1>
            <Meta style={styles.headerSubtitle} color={skin.colors.primaryTextMuted}>Izbornik / Menu</Meta>
          </View>

          {/* Menu Items - Scrollable */}
          <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
            {menuItemsFixture.map((item, index) => {
              const isActive = currentRoute === item.route;
              const key = `${item.route}-${index}`;
              return (
                <TouchableOpacity
                  key={key}
                  style={[styles.menuItem, isActive && styles.menuItemActive]}
                  onPress={() => handleItemPress(item.route)}
                  accessibilityLabel={`${item.label} (${item.labelEn})`}
                  accessibilityRole="button"
                >
                  <View style={styles.menuIconContainer}>
                    <Icon name={item.icon as IconName} size="md" colorToken="textPrimary" />
                  </View>
                  <View style={styles.menuTextContainer}>
                    <Label style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                      {item.label}
                    </Label>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </SafeAreaView>
      </View>

      {/* Close Button (for navigation back) */}
      <TouchableOpacity style={styles.closeButton} onPress={handleBack}>
        <Icon name="close" size="lg" colorToken="textPrimary" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: skin.colors.background,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: skin.colors.overlay,
  },
  menuPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: MENU_WIDTH,
    backgroundColor: skin.colors.backgroundTertiary,
  },
  menuContent: {
    flex: 1,
  },
  header: {
    padding: skin.spacing.xl,
    paddingTop: skin.spacing.lg,
    backgroundColor: skin.colors.primary,
    borderBottomWidth: skin.borders.widthHeavy,
    borderBottomColor: skin.colors.border,
    marginBottom: skin.spacing.sm,
  },
  headerTitle: {
    marginBottom: skin.spacing.xs,
  },
  headerSubtitle: {
    // Typography handled by Meta primitive
  },
  menuList: {
    flex: 1,
    paddingHorizontal: skin.spacing.lg,
    paddingTop: skin.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: skin.spacing.md,
    borderRadius: skin.borders.radiusSharp,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    backgroundColor: skin.colors.background,
    marginBottom: skin.spacing.sm,
    ...skin.shadows.menuItemBox.inactive,
  },
  menuItemActive: {
    backgroundColor: skin.colors.accent,
    ...skin.shadows.menuItemBox.active,
  },
  menuIconContainer: {
    width: skin.icons.size.md,
    marginRight: skin.spacing.lg,
    alignItems: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuLabel: {
    textTransform: skin.typography.textTransform.uppercase,
    fontFamily: skin.typography.fontFamily.body.bold,
    color: skin.colors.textPrimary,
  },
  menuLabelActive: {
    // Active state handled by component
  },
  closeButton: {
    position: 'absolute',
    top: skin.spacing.xl,
    right: skin.spacing.lg,
    padding: skin.spacing.sm,
    backgroundColor: skin.colors.backgroundTertiary,
    borderRadius: skin.borders.radiusSharp,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
  },
});

export default MirrorMenuOverlayScreen;
