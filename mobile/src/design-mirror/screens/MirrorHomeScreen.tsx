/**
 * Mirror Home Screen
 *
 * Dev-only entry point for the Design Mirror sandbox.
 * Lists all available mirror screens for visual auditing.
 *
 * Skin-pure: Uses skin tokens only (no hardcoded hex, no magic numbers).
 */

import React from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { skin } from '../../ui/skin';
import { H1, H2, Label, Body, Meta } from '../../ui/Text';
import { Icon, type IconName } from '../../ui/Icon';
import type { MirrorStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MirrorStackParamList>;

interface MirrorLink {
  title: string;
  description: string;
  icon: IconName;
  route: keyof MirrorStackParamList;
}

/**
 * Available mirror screens
 */
const MIRROR_LINKS: MirrorLink[] = [
  {
    title: 'Menu Overlay',
    description: 'Mirror of MenuOverlay component with fixture data',
    icon: 'menu',
    route: 'MirrorMenuOverlay',
  },
  {
    title: 'Sea Transport',
    description: 'Mirror of SeaTransportScreen with fixture data',
    icon: 'anchor',
    route: 'MirrorTransportSea',
  },
  {
    title: 'Road Transport',
    description: 'Mirror of RoadTransportScreen with fixture data',
    icon: 'bus',
    route: 'MirrorTransportRoad',
  },
  // Phase 3A mirrors
  {
    title: 'Transport Hub',
    description: 'Mirror of TransportHubScreen with fixture banners',
    icon: 'globe',
    route: 'MirrorTransportHub',
  },
  {
    title: 'Static Page',
    description: 'Mirror of StaticPageScreen with all 8 block types',
    icon: 'file-text',
    route: 'MirrorStaticPage',
  },
  {
    title: 'Settings',
    description: 'Mirror of SettingsScreen with fixture state',
    icon: 'settings',
    route: 'MirrorSettings',
  },
  // Phase 3B mirrors - Feedback family
  {
    title: 'Feedback Form',
    description: 'Mirror of FeedbackFormScreen with fixture data',
    icon: 'message-circle',
    route: 'MirrorFeedbackForm',
  },
  {
    title: 'Feedback Confirmation',
    description: 'Mirror of FeedbackConfirmationScreen',
    icon: 'check',
    route: 'MirrorFeedbackConfirmation',
  },
  {
    title: 'Feedback Detail',
    description: 'Mirror of FeedbackDetailScreen with replies',
    icon: 'mail-open',
    route: 'MirrorFeedbackDetail',
  },
  // Phase 3D mirrors - Inbox family
  {
    title: 'Inbox List',
    description: 'Mirror of InboxListScreen with tabs + messages',
    icon: 'inbox',
    route: 'MirrorInboxList',
  },
  {
    title: 'Inbox Detail',
    description: 'Mirror of InboxDetailScreen with tags + urgency',
    icon: 'mail',
    route: 'MirrorInboxDetail',
  },
  // Phase 3E mirrors - Events family
  {
    title: 'Events Calendar',
    description: 'Mirror of EventsScreen with calendar + event list',
    icon: 'calendar',
    route: 'MirrorEvents',
  },
  {
    title: 'Event Detail',
    description: 'Mirror of EventDetailScreen with info tiles + CTAs',
    icon: 'info',
    route: 'MirrorEventDetail',
  },
  // Phase 3F mirrors - Transport Detail family
  {
    title: 'Road Line Detail',
    description: 'Mirror of RoadLineDetailScreen with departures + timeline',
    icon: 'bus',
    route: 'MirrorRoadLineDetail',
  },
  {
    title: 'Sea Line Detail',
    description: 'Mirror of SeaLineDetailScreen with departures + timeline',
    icon: 'ship',
    route: 'MirrorSeaLineDetail',
  },
  // Phase 3G mirrors - Onboarding family
  {
    title: 'Language Selection',
    description: 'Mirror of LanguageSelectionScreen with HR/EN toggle',
    icon: 'globe',
    route: 'MirrorLanguageSelection',
  },
  {
    title: 'User Mode Selection',
    description: 'Mirror of UserModeSelectionScreen with visitor/local cards',
    icon: 'user',
    route: 'MirrorUserModeSelection',
  },
  {
    title: 'Municipality Selection',
    description: 'Mirror of MunicipalitySelectionScreen with Vis/Komiža',
    icon: 'home',
    route: 'MirrorMunicipalitySelection',
  },
  // Phase 3H mirrors - Home Composite
  {
    title: 'Home Composite',
    description: 'Mirror of HomeScreen with banners, events, categories + fixture switcher',
    icon: 'home',
    route: 'MirrorHomeComposite',
  },
  // Phase 3I mirrors - Info + Contacts family
  {
    title: 'Info Hub',
    description: 'Mirror of Info hub with categories + quick links',
    icon: 'info',
    route: 'MirrorInfoHub',
  },
  {
    title: 'Contacts List',
    description: 'Mirror of Contacts list with emergency + general contacts',
    icon: 'phone',
    route: 'MirrorContactsList',
  },
  {
    title: 'Contact Detail',
    description: 'Mirror of Contact detail with phone/email/web buttons',
    icon: 'user',
    route: 'MirrorContactDetail',
  },
  // Phase 3C mirrors - Click & Fix family
  {
    title: 'Click & Fix Form',
    description: 'Mirror of ClickFixFormScreen with location + photos',
    icon: 'alert-triangle',
    route: 'MirrorClickFixForm',
  },
  {
    title: 'Click & Fix Confirmation',
    description: 'Mirror of ClickFixConfirmationScreen',
    icon: 'check',
    route: 'MirrorClickFixConfirmation',
  },
  {
    title: 'Click & Fix Detail',
    description: 'Mirror of ClickFixDetailScreen with photos + replies',
    icon: 'map-pin',
    route: 'MirrorClickFixDetail',
  },
];

export function MirrorHomeScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();

  const handleNavigate = (route: keyof MirrorStackParamList) => {
    navigation.navigate(route as never);
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Icon name="chevron-left" size="md" colorToken="textPrimary" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <H1 style={styles.headerTitle}>Design Mirror</H1>
          <Meta style={styles.headerSubtitle}>DEV ONLY - Visual Auditing</Meta>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Info Section */}
        <View style={styles.infoSection}>
          <Body style={styles.infoText}>
            Mirror screens use deterministic fixtures instead of API calls.
            Use these for visual inspection and UI polishing.
          </Body>
        </View>

        {/* Mirror Links */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Available Mirrors</H2>
          {MIRROR_LINKS.map((link) => (
            <TouchableOpacity
              key={link.route}
              style={styles.linkRow}
              onPress={() => handleNavigate(link.route)}
              activeOpacity={0.7}
            >
              <View style={styles.linkIconContainer}>
                <Icon name={link.icon} size="md" colorToken="textPrimary" />
              </View>
              <View style={styles.linkContent}>
                <Label style={styles.linkTitle}>{link.title}</Label>
                <Body style={styles.linkDescription}>{link.description}</Body>
              </View>
              <Icon name="chevron-right" size="md" colorToken="chevron" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Meta style={styles.footerText}>
            This screen is only visible in __DEV__ builds
          </Meta>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: skin.colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: skin.spacing.lg,
    backgroundColor: skin.colors.primary,
    borderBottomWidth: skin.borders.widthHeavy,
    borderBottomColor: skin.colors.border,
  },
  backButton: {
    marginRight: skin.spacing.md,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerTitle: {
    color: skin.colors.primaryText,
  },
  headerSubtitle: {
    color: skin.colors.primaryTextMuted,
  },
  content: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: skin.colors.backgroundTertiary,
    margin: skin.spacing.lg,
    padding: skin.spacing.lg,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
  },
  infoText: {
    color: skin.colors.textMuted,
  },
  section: {
    backgroundColor: skin.colors.backgroundTertiary,
    marginHorizontal: skin.spacing.lg,
    marginBottom: skin.spacing.lg,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    padding: skin.spacing.lg,
    ...skin.shadows.card,
  },
  sectionTitle: {
    marginBottom: skin.spacing.lg,
  },
  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: skin.spacing.md,
    borderBottomWidth: skin.borders.widthHairline,
    borderBottomColor: skin.colors.borderLight,
  },
  linkIconContainer: {
    width: skin.icons.size.lg,
    marginRight: skin.spacing.md,
    alignItems: 'center',
  },
  linkContent: {
    flex: 1,
  },
  linkTitle: {
    marginBottom: skin.spacing.xs,
  },
  linkDescription: {
    color: skin.colors.textMuted,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: skin.spacing.xxl,
  },
  footerText: {
    color: skin.colors.textDisabled,
  },
});

export default MirrorHomeScreen;
