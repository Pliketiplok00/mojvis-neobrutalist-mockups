/**
 * Mirror Contact Detail Screen (Design Mirror)
 *
 * Mirrors a Contact detail view using fixture data.
 * For visual auditing only - no navigation, no external links.
 *
 * Sections mirrored:
 * 1. Header with contact name + category badge
 * 2. Contact info tiles (phone, email, web, address)
 * 3. Working hours
 * 4. Notes section
 *
 * Rules:
 * - NO useNavigation import
 * - NO Linking.openURL calls
 * - All actions are NO-OP or toggle local state
 * - Skin tokens only
 *
 * Note: Production Contact Detail screen not found.
 * Design based on existing app patterns (StaticPageScreen ContactBlock).
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { skin } from '../../ui/skin';
import { Icon, type IconName } from '../../ui/Icon';
import { Card } from '../../ui/Card';
import { H1, H2, Body, Label, Meta, ButtonText } from '../../ui/Text';
import {
  contactDetailFixtures,
  contactsLabels,
  type ContactDetailFixture,
  type Contact,
} from '../fixtures/contacts';

/**
 * Mirror Contact Detail Screen
 * Uses contactDetailFixtures for visual state with in-screen fixture switcher
 */
export function MirrorContactDetailScreen(): React.JSX.Element {
  // Fixture switcher state
  const [fixtureIndex, setFixtureIndex] = useState(0);
  const currentFixture = contactDetailFixtures[fixtureIndex];
  const contact = currentFixture.contact;

  // NO-OP handlers - mirror screens don't open external links
  const handlePhonePress = (_phone: string): void => {
    // Does not call - visual only
  };

  const handleEmailPress = (_email: string): void => {
    // Does not open mail - visual only
  };

  const handleWebsitePress = (_url: string): void => {
    // Does not open browser - visual only
  };

  const handleBackPress = (): void => {
    // Does not navigate - visual only
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Mirror header with fixture switcher */}
      <View style={styles.mirrorHeader}>
        <H2 style={styles.mirrorHeaderTitle}>Contact Detail Mirror</H2>
        <Meta style={styles.mirrorHeaderMeta}>
          Fixture: {currentFixture.name}
        </Meta>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.fixtureSwitcher}
        >
          {contactDetailFixtures.map((fixture, index) => (
            <TouchableOpacity
              key={fixture.id}
              style={[
                styles.fixtureButton,
                index === fixtureIndex && styles.fixtureButtonActive,
              ]}
              onPress={() => setFixtureIndex(index)}
            >
              <Meta
                style={[
                  styles.fixtureButtonText,
                  index === fixtureIndex && styles.fixtureButtonTextActive,
                ]}
              >
                {fixture.name}
              </Meta>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <Meta style={styles.fixtureDescription}>
          {currentFixture.description}
        </Meta>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Back button (visual only) */}
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Icon name="chevron-left" size="sm" colorToken="textMuted" />
          <Body style={styles.backButtonText}>Natrag / Back</Body>
        </TouchableOpacity>

        {/* Contact Header */}
        <View
          style={[
            styles.contactHeader,
            contact.isEmergency && styles.contactHeaderEmergency,
          ]}
        >
          <View
            style={[
              styles.contactIconLarge,
              contact.isEmergency && styles.contactIconLargeEmergency,
            ]}
          >
            <Icon
              name={contact.icon}
              size="lg"
              colorToken={contact.isEmergency ? 'urgentText' : 'primaryText'}
            />
          </View>
          <H1
            style={[
              styles.contactName,
              contact.isEmergency && styles.contactNameEmergency,
            ]}
          >
            {contact.name}
          </H1>
          <View
            style={[
              styles.categoryBadge,
              contact.isEmergency && styles.categoryBadgeEmergency,
            ]}
          >
            <Meta
              style={[
                styles.categoryBadgeText,
                contact.isEmergency && styles.categoryBadgeTextEmergency,
              ]}
            >
              {contact.categoryLabelHr}
            </Meta>
          </View>
        </View>

        {/* Contact Info Section */}
        <View style={styles.section}>
          {/* Phone Numbers */}
          {contact.phones.length > 0 && (
            <View style={styles.infoGroup}>
              <Label style={styles.infoLabel}>{contactsLabels.phoneHr}</Label>
              {contact.phones.map((phone, index) => (
                <ActionRow
                  key={`phone-${index}`}
                  icon="phone"
                  label={phone}
                  isEmergency={contact.isEmergency}
                  onPress={() => handlePhonePress(phone)}
                />
              ))}
            </View>
          )}

          {/* Email */}
          {contact.email && (
            <View style={styles.infoGroup}>
              <Label style={styles.infoLabel}>{contactsLabels.emailHr}</Label>
              <ActionRow
                icon="mail"
                label={contact.email}
                onPress={() => handleEmailPress(contact.email!)}
              />
            </View>
          )}

          {/* Website */}
          {contact.website && (
            <View style={styles.infoGroup}>
              <Label style={styles.infoLabel}>{contactsLabels.websiteHr}</Label>
              <ActionRow
                icon="globe"
                label={contact.website}
                onPress={() => handleWebsitePress(contact.website!)}
              />
            </View>
          )}

          {/* Address */}
          {contact.address && (
            <View style={styles.infoGroup}>
              <Label style={styles.infoLabel}>{contactsLabels.addressHr}</Label>
              <Card variant="default" style={styles.infoCard}>
                <View style={styles.infoCardIconContainer}>
                  <Icon name="map-pin" size="md" colorToken="textPrimary" />
                </View>
                <Body style={styles.infoCardText}>{contact.address}</Body>
              </Card>
            </View>
          )}

          {/* Working Hours */}
          {contact.workingHours && (
            <View style={styles.infoGroup}>
              <Label style={styles.infoLabel}>
                {contactsLabels.workingHoursHr}
              </Label>
              <Card variant="default" style={styles.infoCard}>
                <View style={styles.infoCardIconContainer}>
                  <Icon name="clock" size="md" colorToken="textPrimary" />
                </View>
                <Body style={styles.infoCardText}>{contact.workingHours}</Body>
              </Card>
            </View>
          )}
        </View>

        {/* Notes Section */}
        {(contact.noteHr || contact.noteEn) && (
          <View style={styles.section}>
            <Label style={styles.infoLabel}>{contactsLabels.noteHr}</Label>
            <Card variant="default" style={styles.noteCard}>
              {contact.noteHr && (
                <Body style={styles.noteText}>{contact.noteHr}</Body>
              )}
              {contact.noteEn && (
                <Meta style={styles.noteTextEn}>{contact.noteEn}</Meta>
              )}
            </Card>
          </View>
        )}

        {/* Footer spacing */}
        <View style={styles.footer} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================
// Sub-components
// ============================================================

interface ActionRowProps {
  icon: IconName;
  label: string;
  isEmergency?: boolean;
  onPress: () => void;
}

function ActionRow({
  icon,
  label,
  isEmergency = false,
  onPress,
}: ActionRowProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.actionRow, isEmergency && styles.actionRowEmergency]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View
        style={[
          styles.actionIconContainer,
          isEmergency && styles.actionIconContainerEmergency,
        ]}
      >
        <Icon
          name={icon}
          size="md"
          colorToken={isEmergency ? 'urgentText' : 'primaryText'}
        />
      </View>
      <ButtonText
        style={[styles.actionLabel, isEmergency && styles.actionLabelEmergency]}
      >
        {label}
      </ButtonText>
      <Icon
        name="chevron-right"
        size="sm"
        colorToken={isEmergency ? 'urgentText' : 'primaryText'}
      />
    </TouchableOpacity>
  );
}

// ============================================================
// Styles
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: skin.colors.background,
  },
  mirrorHeader: {
    padding: skin.spacing.lg,
    borderBottomWidth: skin.borders.widthHeavy,
    borderBottomColor: skin.colors.border,
    backgroundColor: skin.colors.backgroundTertiary,
  },
  mirrorHeaderTitle: {
    marginBottom: skin.spacing.xs,
  },
  mirrorHeaderMeta: {
    color: skin.colors.textMuted,
  },
  fixtureSwitcher: {
    marginTop: skin.spacing.md,
    marginBottom: skin.spacing.sm,
  },
  fixtureButton: {
    paddingHorizontal: skin.spacing.md,
    paddingVertical: skin.spacing.sm,
    marginRight: skin.spacing.sm,
    backgroundColor: skin.colors.backgroundSecondary,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.border,
    borderRadius: skin.borders.radiusSmall,
  },
  fixtureButtonActive: {
    backgroundColor: skin.colors.primary,
    borderColor: skin.colors.primary,
  },
  fixtureButtonText: {
    color: skin.colors.textMuted,
  },
  fixtureButtonTextActive: {
    color: skin.colors.primaryText,
  },
  fixtureDescription: {
    fontStyle: 'italic',
    color: skin.colors.textDisabled,
  },
  content: {
    flex: 1,
  },

  // Back Button
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: skin.spacing.xs,
    padding: skin.spacing.lg,
    paddingBottom: skin.spacing.md,
  },
  backButtonText: {
    color: skin.colors.textMuted,
  },

  // Contact Header
  contactHeader: {
    alignItems: 'center',
    padding: skin.spacing.xxl,
    marginHorizontal: skin.spacing.lg,
    backgroundColor: skin.colors.primary,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    ...skin.shadows.card,
  },
  contactHeaderEmergency: {
    backgroundColor: skin.colors.urgent,
  },
  contactIconLarge: {
    width: 64,
    height: 64,
    backgroundColor: skin.colors.primaryText,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: skin.spacing.lg,
  },
  contactIconLargeEmergency: {
    backgroundColor: skin.colors.urgentText,
  },
  contactName: {
    color: skin.colors.primaryText,
    textAlign: 'center',
    marginBottom: skin.spacing.md,
  },
  contactNameEmergency: {
    color: skin.colors.urgentText,
  },
  categoryBadge: {
    backgroundColor: skin.colors.primaryText,
    paddingHorizontal: skin.spacing.md,
    paddingVertical: skin.spacing.xs,
    borderRadius: skin.borders.radiusSmall,
  },
  categoryBadgeEmergency: {
    backgroundColor: skin.colors.urgentText,
  },
  categoryBadgeText: {
    color: skin.colors.primary,
  },
  categoryBadgeTextEmergency: {
    color: skin.colors.urgent,
  },

  // Section
  section: {
    padding: skin.spacing.lg,
  },

  // Info Group
  infoGroup: {
    marginBottom: skin.spacing.lg,
  },
  infoLabel: {
    color: skin.colors.textMuted,
    marginBottom: skin.spacing.sm,
  },

  // Info Card
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: skin.spacing.md,
  },
  infoCardIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: skin.colors.backgroundSecondary,
    borderRadius: skin.borders.radiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: skin.spacing.md,
  },
  infoCardText: {
    flex: 1,
  },

  // Action Row
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: skin.spacing.md,
    backgroundColor: skin.colors.primary,
    borderRadius: skin.borders.radiusSmall,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    marginBottom: skin.spacing.sm,
    ...skin.shadows.card,
  },
  actionRowEmergency: {
    backgroundColor: skin.colors.urgent,
  },
  actionIconContainer: {
    width: 40,
    height: 40,
    backgroundColor: skin.colors.primaryText,
    borderRadius: skin.borders.radiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: skin.spacing.md,
  },
  actionIconContainerEmergency: {
    backgroundColor: skin.colors.urgentText,
  },
  actionLabel: {
    flex: 1,
    color: skin.colors.primaryText,
  },
  actionLabelEmergency: {
    color: skin.colors.urgentText,
  },

  // Note Card
  noteCard: {
    padding: skin.spacing.lg,
  },
  noteText: {
    marginBottom: skin.spacing.md,
  },
  noteTextEn: {
    fontStyle: 'italic',
    color: skin.colors.textMuted,
  },

  // Footer
  footer: {
    height: skin.spacing.xxl,
  },
});

export default MirrorContactDetailScreen;
