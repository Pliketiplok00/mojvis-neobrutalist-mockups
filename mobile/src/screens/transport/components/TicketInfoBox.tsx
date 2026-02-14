/**
 * TicketInfoBox Component
 *
 * Displays ticket purchase information for transport lines.
 * Shows carrier name with link to ticket booking site when available.
 *
 * Extracted from LineDetailScreen for reusability.
 */

import React from 'react';
import { View, TouchableOpacity, Linking, StyleSheet } from 'react-native';
import { Meta, Body, Label } from '../../../ui/Text';
import { Icon } from '../../../ui/Icon';
import { skin } from '../../../ui/skin';
import {
  CARRIER_TICKET_URLS,
  SEA_LINE_CARRIERS,
} from '../../../constants/carriers';
import type { ContactInfo } from '../../../types/transport';

const { colors, spacing, components } = skin;
const { note } = components.transport;

interface TicketInfoBoxProps {
  lineNumber: string | null;
  contacts: ContactInfo[];
  titleText: string;
  bodyText: string;
  boardingOnlyText: string;
  fallbackText: string;
}

/**
 * Ticket info box with carrier link
 * Resolves carrier from line number or contacts
 */
export function TicketInfoBox({
  lineNumber,
  contacts,
  titleText,
  bodyText,
  boardingOnlyText,
  fallbackText,
}: TicketInfoBoxProps): React.JSX.Element {
  // Determine carrier info: prefer sea line mapping, fall back to contacts
  const seaCarrier = lineNumber ? SEA_LINE_CARRIERS[lineNumber] : undefined;
  const contactOperator = contacts[0]?.operator;
  const contactTicketUrl = contactOperator
    ? CARRIER_TICKET_URLS[contactOperator]
    : undefined;

  // Resolve carrier name and ticket URL
  const carrierName = seaCarrier?.name ?? contactOperator ?? null;
  const ticketUrl = seaCarrier?.ticketUrl ?? contactTicketUrl ?? null;
  const isBoardingOnly = seaCarrier && seaCarrier.ticketUrl === null;

  // Determine body text
  let displayBodyText: string;
  if (isBoardingOnly) {
    displayBodyText = boardingOnlyText;
  } else if (ticketUrl) {
    displayBodyText = bodyText;
  } else {
    displayBodyText = fallbackText;
  }

  const handleWebsitePress = (url: string) => {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    Linking.openURL(fullUrl);
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Meta style={styles.title}>{titleText}</Meta>
        <Body style={styles.body}>{displayBodyText}</Body>
        {carrierName && ticketUrl && (
          <TouchableOpacity
            style={styles.link}
            onPress={() => handleWebsitePress(ticketUrl)}
          >
            <Icon name="globe" size="sm" colorToken="link" />
            <Label style={styles.linkText}>{carrierName}</Label>
          </TouchableOpacity>
        )}
        {carrierName && !ticketUrl && (
          <View style={styles.carrierPlain}>
            <Label style={styles.carrierText}>{carrierName}</Label>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  box: {
    borderWidth: note.noteBorderWidth,
    borderColor: note.noteBorderColor,
    backgroundColor: note.noteBackground,
    borderRadius: note.noteRadius,
    padding: note.notePadding,
  },
  title: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  body: {
    color: note.noteTextColor,
    marginBottom: spacing.md,
  },
  link: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  linkText: {
    color: colors.link,
  },
  carrierPlain: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  carrierText: {
    color: colors.textSecondary,
  },
});
