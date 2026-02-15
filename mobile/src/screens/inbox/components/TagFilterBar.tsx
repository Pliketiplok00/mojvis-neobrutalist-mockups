/**
 * TagFilterBar Component
 *
 * Horizontal scrollable tag filter chips with neobrut styling.
 * Shows category-colored chips with shadow on selection.
 *
 * Extracted from InboxListScreen for reusability.
 */

import React from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Label } from '../../../ui/Text';
import { skin } from '../../../ui/skin';
import type { InboxTag } from '../../../types/inbox';

const { inbox: inboxTokens } = skin.components;

interface TagFilterBarProps {
  availableTags: InboxTag[];
  selectedTags: InboxTag[];
  onToggleTag: (tag: InboxTag) => void;
  /** Translation function */
  t: (key: string) => string;
}

/**
 * Horizontal scrollable tag filter chips
 */
export function TagFilterBar({
  availableTags,
  selectedTags,
  onToggleTag,
  t,
}: TagFilterBarProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {availableTags.map((tag) => {
          const isActive = selectedTags.includes(tag);
          // Per-tag background and text colors (always applied)
          const tagBackground = inboxTokens.tagFilter.chipBackgrounds[tag];
          const tagTextColor = inboxTokens.tagFilter.chipTextColors[tag];
          return (
            <View key={tag} style={styles.chipWrapper}>
              {/* Neobrut shadow layer - only visible when selected */}
              {isActive && <View style={styles.chipShadow} />}
              <Pressable
                style={[
                  styles.chip,
                  { backgroundColor: tagBackground },
                  isActive && styles.chipSelected,
                ]}
                onPress={() => onToggleTag(tag)}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Label style={[styles.chipText, { color: tagTextColor }]}>
                  {t(`inbox.tags.${tag}`)}
                </Label>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: inboxTokens.tagFilter.containerBackground,
    paddingVertical: inboxTokens.tagFilter.containerPadding,
    borderBottomWidth: skin.borders.widthThin,
    borderBottomColor: skin.colors.border,
  },
  scrollContent: {
    paddingLeft: inboxTokens.tagFilter.containerPadding,
    // Right padding: container padding + shadow offset to prevent clipping
    paddingRight: inboxTokens.tagFilter.containerPadding + inboxTokens.tagFilter.chipShadowOffset,
    // Bottom padding for shadow visibility (derived from shadow offset)
    paddingBottom: inboxTokens.tagFilter.chipShadowOffset,
    gap: inboxTokens.tagFilter.chipGap,
  },
  // Chip wrapper for shadow positioning
  chipWrapper: {
    position: 'relative',
  },
  // Neobrut shadow layer (visible only when selected)
  chipShadow: {
    position: 'absolute',
    top: inboxTokens.tagFilter.chipShadowOffset,
    left: inboxTokens.tagFilter.chipShadowOffset,
    right: -inboxTokens.tagFilter.chipShadowOffset,
    bottom: -inboxTokens.tagFilter.chipShadowOffset,
    backgroundColor: inboxTokens.tagFilter.chipShadowColor,
    borderRadius: inboxTokens.tagFilter.chipBorderRadius,
  },
  // Chip base style (category background applied via inline style)
  chip: {
    paddingHorizontal: inboxTokens.tagFilter.chipPaddingHorizontal,
    paddingVertical: inboxTokens.tagFilter.chipPaddingVertical,
    borderWidth: inboxTokens.tagFilter.chipBorderWidthDefault,
    borderColor: inboxTokens.tagFilter.chipBorderColor,
    borderRadius: inboxTokens.tagFilter.chipBorderRadius,
  },
  // Selected chip: thicker outline
  chipSelected: {
    borderWidth: inboxTokens.tagFilter.chipBorderWidthSelected,
  },
  // Chip text (color applied via inline style for per-tag legibility)
  chipText: {
    textTransform: 'uppercase',
  },
});
