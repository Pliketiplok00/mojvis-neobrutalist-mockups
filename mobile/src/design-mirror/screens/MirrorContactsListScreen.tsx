/**
 * Mirror Contacts List Screen (Design Mirror)
 *
 * Mirrors a Contacts list using fixture data.
 * For visual auditing only - no navigation, no API calls.
 *
 * Sections mirrored:
 * 1. Header (title + subtitle)
 * 2. Contact list (grouped by category)
 * 3. Empty state
 *
 * Rules:
 * - NO useNavigation import
 * - NO API calls or context
 * - All actions are NO-OP or toggle local state
 * - Skin tokens only
 *
 * Note: Production Contacts List screen not found.
 * Design based on existing app patterns.
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
import { Icon } from '../../ui/Icon';
import { Card } from '../../ui/Card';
import { H1, H2, Body, Label, Meta, ButtonText } from '../../ui/Text';
import {
  contactsListFixtures,
  contactsLabels,
  type ContactsListFixture,
  type Contact,
} from '../fixtures/contacts';

/**
 * Mirror Contacts List Screen
 * Uses contactsListFixtures for visual state with in-screen fixture switcher
 */
export function MirrorContactsListScreen(): React.JSX.Element {
  // Fixture switcher state
  const [fixtureIndex, setFixtureIndex] = useState(0);
  const currentFixture = contactsListFixtures[fixtureIndex];

  // NO-OP handlers - mirror screens don't navigate
  const handleContactPress = (_contact: Contact): void => {
    // Does not navigate - visual only
  };

  // Group contacts by category
  const emergencyContacts = currentFixture.contacts.filter((c) => c.isEmergency);
  const otherContacts = currentFixture.contacts.filter((c) => !c.isEmergency);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Mirror header with fixture switcher */}
      <View style={styles.mirrorHeader}>
        <H2 style={styles.mirrorHeaderTitle}>Contacts List Mirror</H2>
        <Meta style={styles.mirrorHeaderMeta}>
          Fixture: {currentFixture.name}
        </Meta>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.fixtureSwitcher}
        >
          {contactsListFixtures.map((fixture, index) => (
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
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <H1 style={styles.heroTitle}>{contactsLabels.titleHr}</H1>
          <Body style={styles.heroSubtitle}>{contactsLabels.subtitleHr}</Body>
        </View>

        {/* Empty State */}
        {currentFixture.contacts.length === 0 && (
          <View style={styles.emptyState}>
            <Icon name="phone" size="lg" colorToken="textDisabled" />
            <Body style={styles.emptyStateText}>
              {contactsLabels.emptyStateHr}
            </Body>
            <Meta style={styles.emptyStateTextEn}>
              {contactsLabels.emptyStateEn}
            </Meta>
          </View>
        )}

        {/* Emergency Contacts Section */}
        {emergencyContacts.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Icon name="alert-triangle" size="md" colorToken="urgent" />
              <H2 style={styles.sectionTitleUrgent}>
                {contactsLabels.emergencySectionHr}
              </H2>
            </View>
            <View style={styles.contactsList}>
              {emergencyContacts.map((contact) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  onPress={() => handleContactPress(contact)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Other Contacts Section */}
        {otherContacts.length > 0 && (
          <View style={styles.section}>
            <H2 style={styles.sectionTitle}>{contactsLabels.allContactsHr}</H2>
            <View style={styles.contactsList}>
              {otherContacts.map((contact) => (
                <ContactRow
                  key={contact.id}
                  contact={contact}
                  onPress={() => handleContactPress(contact)}
                />
              ))}
            </View>
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

interface ContactRowProps {
  contact: Contact;
  onPress: () => void;
}

function ContactRow({ contact, onPress }: ContactRowProps): React.JSX.Element {
  return (
    <Card
      variant="default"
      onPress={onPress}
      style={{
        ...styles.contactRow,
        ...(contact.isEmergency ? styles.contactRowEmergency : {}),
      }}
    >
      <View
        style={[
          styles.contactIconContainer,
          contact.isEmergency && styles.contactIconContainerEmergency,
        ]}
      >
        <Icon
          name={contact.icon}
          size="md"
          colorToken={contact.isEmergency ? 'urgentText' : 'textPrimary'}
        />
      </View>
      <View style={styles.contactContent}>
        <Label style={styles.contactName} numberOfLines={2}>
          {contact.name}
        </Label>
        <View style={styles.contactMeta}>
          <Meta
            style={[
              styles.contactCategory,
              contact.isEmergency && styles.contactCategoryEmergency,
            ]}
          >
            {contact.categoryLabelHr}
          </Meta>
          {contact.phones.length > 0 && (
            <Meta style={styles.contactPhone}>{contact.phones[0]}</Meta>
          )}
        </View>
      </View>
      <Icon name="chevron-right" size="md" colorToken="chevron" />
    </Card>
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

  // Hero Section
  heroSection: {
    backgroundColor: skin.colors.urgent,
    padding: skin.spacing.xxl,
    marginTop: skin.spacing.lg,
    marginHorizontal: skin.spacing.lg,
    borderRadius: skin.borders.radiusCard,
    borderWidth: skin.borders.widthCard,
    borderColor: skin.colors.border,
    ...skin.shadows.card,
  },
  heroTitle: {
    color: skin.colors.urgentText,
    marginBottom: skin.spacing.sm,
  },
  heroSubtitle: {
    color: skin.colors.urgentText,
    opacity: skin.opacity.strong,
  },

  // Section
  section: {
    padding: skin.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: skin.spacing.sm,
    marginBottom: skin.spacing.lg,
  },
  sectionTitle: {
    marginBottom: skin.spacing.lg,
  },
  sectionTitleUrgent: {
    color: skin.colors.urgent,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: skin.spacing.xxxl,
    margin: skin.spacing.lg,
    backgroundColor: skin.colors.backgroundSecondary,
    borderWidth: skin.borders.widthThin,
    borderColor: skin.colors.borderLight,
    borderStyle: 'dashed',
    borderRadius: skin.borders.radiusCard,
    gap: skin.spacing.md,
  },
  emptyStateText: {
    color: skin.colors.textDisabled,
    textAlign: 'center',
  },
  emptyStateTextEn: {
    color: skin.colors.textDisabled,
    fontStyle: 'italic',
    textAlign: 'center',
  },

  // Contact List
  contactsList: {
    gap: skin.spacing.md,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: skin.spacing.md,
  },
  contactRowEmergency: {
    borderColor: skin.colors.urgent,
    borderWidth: skin.borders.widthHeavy,
  },
  contactIconContainer: {
    width: 44,
    height: 44,
    backgroundColor: skin.colors.backgroundSecondary,
    borderRadius: skin.borders.radiusSmall,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: skin.spacing.md,
  },
  contactIconContainerEmergency: {
    backgroundColor: skin.colors.urgent,
  },
  contactContent: {
    flex: 1,
  },
  contactName: {
    marginBottom: skin.spacing.xs,
  },
  contactMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: skin.spacing.sm,
  },
  contactCategory: {
    color: skin.colors.textMuted,
    backgroundColor: skin.colors.backgroundTertiary,
    paddingHorizontal: skin.spacing.sm,
    paddingVertical: skin.spacing.xs,
    borderRadius: skin.borders.radiusSmall,
    overflow: 'hidden',
  },
  contactCategoryEmergency: {
    backgroundColor: skin.colors.urgent,
    color: skin.colors.urgentText,
  },
  contactPhone: {
    color: skin.colors.primary,
  },

  // Footer
  footer: {
    height: skin.spacing.xxl,
  },
});

export default MirrorContactsListScreen;
