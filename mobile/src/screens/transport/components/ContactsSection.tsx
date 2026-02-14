/**
 * ContactsSection Component
 *
 * Section displaying carrier contact information (phone, email, website).
 * Each contact card has neobrutalist offset shadow effect.
 *
 * Extracted from LineDetailScreen for reusability.
 */

import React from 'react';
import { View, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Label } from '../../../ui/Text';
import { Icon } from '../../../ui/Icon';
import { skin } from '../../../ui/skin';
import type { ContactInfo } from '../../../types/transport';

const { colors, spacing, components } = skin;
const lineDetail = components.transport.lineDetail;

interface ContactsSectionProps {
  contacts: ContactInfo[];
  sectionLabel: string;
}

/**
 * Contact cards section with phone, email, website links
 * Only renders when contacts exist
 */
export function ContactsSection({
  contacts,
  sectionLabel,
}: ContactsSectionProps): React.JSX.Element | null {
  if (!contacts || contacts.length === 0) {
    return null;
  }

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsitePress = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    Linking.openURL(url);
  };

  return (
    <View style={styles.section}>
      <Label style={styles.sectionLabel}>{sectionLabel}</Label>
      {contacts.map((contact, index) => (
        <View key={`${contact.operator}-${index}`} style={styles.cardWrapper}>
          <View style={styles.cardShadow} />
          <View style={styles.card}>
            <Label style={styles.operator}>{contact.operator}</Label>
            {contact.phone && (
              <TouchableOpacity
                style={styles.row}
                onPress={() => handlePhonePress(contact.phone!)}
              >
                <View style={styles.iconBox}>
                  <Icon name="phone" size="sm" colorToken="textPrimary" />
                </View>
                <Label style={styles.link}>{contact.phone}</Label>
              </TouchableOpacity>
            )}
            {contact.email && (
              <TouchableOpacity
                style={styles.row}
                onPress={() => handleEmailPress(contact.email!)}
              >
                <View style={styles.iconBox}>
                  <Icon name="mail" size="sm" colorToken="textPrimary" />
                </View>
                <Label style={styles.link}>{contact.email}</Label>
              </TouchableOpacity>
            )}
            {contact.website && (
              <TouchableOpacity
                style={styles.row}
                onPress={() => handleWebsitePress(contact.website!)}
              >
                <View style={styles.iconBox}>
                  <Icon name="globe" size="sm" colorToken="textPrimary" />
                </View>
                <Label style={styles.link}>{contact.website}</Label>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  sectionLabel: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  cardWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  cardShadow: {
    position: 'absolute',
    top: lineDetail.shadowOffsetY,
    left: lineDetail.shadowOffsetX,
    right: -lineDetail.shadowOffsetX,
    bottom: -lineDetail.shadowOffsetY,
    backgroundColor: lineDetail.shadowColor,
  },
  card: {
    backgroundColor: lineDetail.contactCardBackground,
    borderWidth: lineDetail.contactCardBorderWidth,
    borderColor: lineDetail.contactCardBorderColor,
    borderRadius: lineDetail.contactCardRadius,
    padding: lineDetail.contactCardPadding,
  },
  operator: {
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconBox: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  link: {
    flex: 1,
    color: colors.link,
  },
});
