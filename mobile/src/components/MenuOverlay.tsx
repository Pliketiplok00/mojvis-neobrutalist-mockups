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
  Text,
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
            <Text style={styles.headerTitle}>MOJ VIS</Text>
            <Text style={styles.headerSubtitle}>Izbornik / Menu</Text>
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
                    <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>
                      {item.label}
                    </Text>
                    <Text style={styles.menuLabelEn}>{item.labelEn}</Text>
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
    ...skin.shadows.soft,
  },
  menuContent: {
    flex: 1,
  },
  header: {
    padding: skin.spacing.xl,
    paddingTop: skin.spacing.lg,
    borderBottomWidth: skin.borders.widthThin,
    borderBottomColor: skin.colors.borderLight,
    marginBottom: skin.spacing.sm,
  },
  headerTitle: {
    fontSize: skin.typography.fontSize.xxl,
    fontWeight: skin.typography.fontWeight.bold,
    fontFamily: skin.typography.fontFamily.display.bold,
    color: skin.colors.textPrimary,
    marginBottom: skin.spacing.xs,
  },
  headerSubtitle: {
    fontSize: skin.typography.fontSize.md,
    fontFamily: skin.typography.fontFamily.body.regular,
    color: skin.colors.textMuted,
  },
  menuList: {
    flex: 1,
    paddingHorizontal: skin.spacing.md,
    paddingTop: skin.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: skin.spacing.md,
    borderRadius: skin.borders.radiusSmall,
    marginBottom: skin.spacing.xs,
  },
  menuItemActive: {
    backgroundColor: skin.colors.backgroundSecondary,
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
    fontSize: skin.typography.fontSize.lg,
    fontWeight: skin.typography.fontWeight.medium,
    fontFamily: skin.typography.fontFamily.body.regular,
    color: skin.colors.textPrimary,
  },
  menuLabelActive: {
    fontWeight: skin.typography.fontWeight.semiBold,
    fontFamily: skin.typography.fontFamily.body.bold,
  },
  menuLabelEn: {
    fontSize: skin.typography.fontSize.sm,
    fontFamily: skin.typography.fontFamily.body.regular,
    color: skin.colors.textMuted,
    marginTop: 2,
  },
});

export default MenuOverlay;
