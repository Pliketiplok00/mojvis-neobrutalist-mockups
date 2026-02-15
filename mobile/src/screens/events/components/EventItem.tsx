/**
 * EventItem Component
 *
 * Single event list item with neobrut poster-style card.
 * Features dual-layer shadow, time/location rows with icons.
 *
 * Extracted from EventsScreen for reusability.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ButtonText, Meta } from '../../../ui/Text';
import { Icon } from '../../../ui/Icon';
import { skin } from '../../../ui/skin';
import { formatEventTime } from '../../../utils/dateFormat';
import { useTranslations } from '../../../i18n';
import type { Event } from '../../../types/event';
import type { MainStackParamList } from '../../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

interface EventItemProps {
  event: Event;
  allDayText: string;
}

/**
 * Event list item - V1 Poster style with icons and dual-layer shadow
 * Uses Pressable to avoid opacity dimming; shadow hides on press.
 */
export function EventItem({ event, allDayText }: EventItemProps): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const { language } = useTranslations();

  return (
    <View style={styles.wrapper}>
      <Pressable
        onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
      >
        {({ pressed }) => (
          <>
            {/* V1 Poster: Offset shadow layer - hidden when pressed */}
            {!pressed && <View style={styles.shadow} />}
            <View style={styles.card}>
              <View style={styles.content}>
                <ButtonText style={styles.title} numberOfLines={2}>
                  {event.title}
                </ButtonText>
                {/* V1 Poster: Time row with clock icon */}
                <View style={styles.metaRow}>
                  <Icon name="clock" size="xs" colorToken="textMuted" />
                  <Meta style={styles.metaText} numberOfLines={1}>
                    {formatEventTime(event.start_datetime, event.is_all_day, allDayText, language)}
                  </Meta>
                </View>
                {/* V1 Poster: Location row with map-pin icon */}
                {event.location && (
                  <View style={styles.metaRow}>
                    <Icon name="map-pin" size="xs" colorToken="textMuted" />
                    <Meta style={styles.metaText} numberOfLines={1}>
                      {event.location}
                    </Meta>
                  </View>
                )}
              </View>
              <Icon name="chevron-right" size="sm" colorToken="chevron" />
            </View>
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // V1 Poster: Event cards with thick borders and dual-layer shadow
  wrapper: {
    position: 'relative',
    marginBottom: skin.components.events.card.marginBottom,
  },
  // Offset shadow layer (poster-style dual-layer effect)
  shadow: {
    position: 'absolute',
    top: skin.components.events.card.shadowOffsetY,
    left: skin.components.events.card.shadowOffsetX,
    right: -skin.components.events.card.shadowOffsetX,
    bottom: -skin.components.events.card.shadowOffsetY,
    backgroundColor: skin.components.events.card.shadowColor,
    borderRadius: skin.components.events.card.borderRadius,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: skin.components.events.card.background,
    borderWidth: skin.components.events.card.borderWidth,
    borderColor: skin.components.events.card.borderColor,
    borderRadius: skin.components.events.card.borderRadius,
    padding: skin.components.events.card.padding,
  },
  content: {
    flex: 1,
  },
  title: {
    marginBottom: skin.spacing.sm,
    textTransform: 'uppercase',
  },
  // V1 Poster: Meta row with icon + text (horizontal layout)
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: skin.spacing.sm, // Increased gap for better readability
    marginTop: skin.spacing.xs,
  },
  metaText: {
    flex: 1,
    // Ensure text doesn't push icon to new line
    flexShrink: 1,
  },
});
