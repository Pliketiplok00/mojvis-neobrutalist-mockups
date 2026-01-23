/**
 * Menu Overlay Component
 *
 * A simple slide-in menu that overlays the screen.
 * Uses React Native's built-in Animated API - no native modules required.
 *
 * Core menu items are hardcoded.
 * Additional items (extras) are fetched from backend and appended after core items.
 *
 * This replaces the DrawerNavigator approach which required
 * react-native-reanimated and caused native binary mismatch issues.
 *
 * Skin-pure: Uses Icon primitive and skin tokens (no emoji, no hardcoded hex).
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableWithoutFeedback,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { menuExtrasApi } from '../services/api';
import type { MenuExtra } from '../types/menu-extras';
import { Icon, type IconName } from '../ui/Icon';
import { skin } from '../ui/skin';
import { H1, Label, Meta } from '../ui/Text';

const SCREEN_WIDTH = Dimensions.get('window').width;
const MENU_WIDTH = SCREEN_WIDTH * 0.75;

interface MenuItem {
  label: string;
  labelEn: string;
  icon: IconName;
  route: string;
}

/**
 * Core menu items - these are hardcoded and never change.
 * DO NOT modify this array unless explicitly required.
 */
const CORE_MENU_ITEMS: MenuItem[] = [
  { label: 'Početna', labelEn: 'Home', icon: 'home', route: 'Home' },
  { label: 'Događaji', labelEn: 'Events', icon: 'calendar', route: 'Events' },
  { label: 'Vozni redovi', labelEn: 'Timetables', icon: 'bus', route: 'TransportHub' },
  { label: 'Flora i fauna', labelEn: 'Flora & Fauna', icon: 'leaf', route: 'StaticPage:flora-fauna' },
  { label: 'Info za posjetitelje', labelEn: 'Visitor info', icon: 'info', route: 'StaticPage:visitor-info' },
  { label: 'Prijavi problem', labelEn: 'Click & Fix', icon: 'wrench', route: 'ClickFixForm' },
  { label: 'Pošalji prijedlog', labelEn: 'Feedback', icon: 'message-circle', route: 'FeedbackForm' },
  { label: 'Važni kontakti', labelEn: 'Important contacts', icon: 'phone', route: 'StaticPage:important-contacts' },
  { label: 'Postavke', labelEn: 'Settings', icon: 'settings', route: 'Settings' },
];

interface MenuOverlayProps {
  visible: boolean;
  onClose: () => void;
  onNavigate: (route: string) => void;
  currentRoute?: string;
}

export function MenuOverlay({
  visible,
  onClose,
  onNavigate,
  currentRoute,
}: MenuOverlayProps): React.JSX.Element | null {
  const slideAnim = useRef(new Animated.Value(-MENU_WIDTH)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Server-driven menu extras (appended after core items)
  const [extras, setExtras] = useState<MenuExtra[]>([]);
  const [extrasFetched, setExtrasFetched] = useState(false);

  // Fetch extras once on mount
  const fetchExtras = useCallback(async () => {
    if (extrasFetched) return;

    try {
      const response = await menuExtrasApi.getExtras();
      setExtras(response.extras);
    } catch (error) {
      // Silently fail - core menu items will still work
      console.warn('[MenuOverlay] Failed to fetch menu extras:', error);
    } finally {
      setExtrasFetched(true);
    }
  }, [extrasFetched]);

  // Fetch extras when menu becomes visible for the first time
  useEffect(() => {
    if (visible && !extrasFetched) {
      void fetchExtras();
    }
  }, [visible, extrasFetched, fetchExtras]);

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide out
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -MENU_WIDTH,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  const handleItemPress = (route: string): void => {
    onClose();
    // Small delay to allow close animation
    setTimeout(() => {
      onNavigate(route);
    }, 100);
  };

  if (!visible) {
    return null;
  }

  // Convert extras to menu items
  const extraMenuItems: MenuItem[] = extras.map((extra) => ({
    label: extra.labelHr,
    labelEn: extra.labelEn,
    icon: 'file-text' as IconName, // Default icon for extras (static page)
    route: extra.target,
  }));

  // Combined menu: core items + extras
  const allMenuItems = [...CORE_MENU_ITEMS, ...extraMenuItems];

  return (
    <View style={styles.container}>
      {/* Backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <Animated.View style={[styles.backdrop, { opacity: fadeAnim }]} />
      </TouchableWithoutFeedback>

      {/* Menu Panel */}
      <Animated.View
        style={[
          styles.menuPanel,
          { transform: [{ translateX: slideAnim }] },
        ]}
      >
        <SafeAreaView style={styles.menuContent}>
          {/* Header */}
          <View style={styles.header}>
            <H1 style={styles.headerTitle}>MOJ VIS</H1>
            <Meta style={styles.headerSubtitle}>Izbornik / Menu</Meta>
          </View>

          {/* Menu Items - Scrollable */}
          <ScrollView style={styles.menuList} showsVerticalScrollIndicator={false}>
            {allMenuItems.map((item, index) => {
              const isActive = currentRoute === item.route;
              // Use index as part of key for extras that might have duplicate routes
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
                    <Icon name={item.icon} size="md" colorToken="textPrimary" />
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
          {/* Footer removed per UI contract (2026-01-09) */}
        </SafeAreaView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
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
    color: skin.colors.primaryText,
  },
  headerSubtitle: {
    color: skin.colors.primaryTextMuted,
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
});

export default MenuOverlay;
