/**
 * ListRow Primitive
 *
 * Row with optional chevron/right accessory.
 * Used for message items, menu items, etc.
 */

import React from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { Icon } from './Icon';
import { skin } from './skin';

interface ListRowProps {
  children: React.ReactNode;
  /** Press handler */
  onPress?: () => void;
  /** Show chevron indicator */
  showChevron?: boolean;
  /** Right accessory (overrides chevron) */
  rightAccessory?: React.ReactNode;
  /** Highlight/unread state */
  highlighted?: boolean;
  /** Additional style */
  style?: ViewStyle;
}

export function ListRow({
  children,
  onPress,
  showChevron = true,
  rightAccessory,
  highlighted = false,
  style,
}: ListRowProps): React.JSX.Element {
  const content = (
    <>
      <View style={styles.content}>{children}</View>
      {rightAccessory ?? (showChevron && (
        <View style={styles.chevronContainer}>
          <Icon name="chevron-right" size="md" stroke="regular" colorToken="chevron" />
        </View>
      ))}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        style={[styles.container, highlighted && styles.highlighted, style]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View style={[styles.container, highlighted && styles.highlighted, style]}>
      {content}
    </View>
  );
}

const { components, colors } = skin;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: components.listRow.paddingVertical,
    paddingHorizontal: components.listRow.paddingHorizontal,
    borderBottomWidth: components.listRow.borderBottomWidth,
    borderBottomColor: components.listRow.borderBottomColor,
  },
  highlighted: {
    backgroundColor: colors.backgroundUnread,
  },
  content: {
    flex: 1,
  },
  chevronContainer: {
    marginLeft: skin.spacing.sm,
  },
});

export default ListRow;
