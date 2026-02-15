/**
 * InboxTabs Component
 *
 * Poster-style tab bar for switching between received and sent items.
 * Features neobrut styling with icons and uppercase labels.
 *
 * Extracted from InboxListScreen for reusability.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { Label } from '../../../ui/Text';
import { Icon } from '../../../ui/Icon';
import { skin } from '../../../ui/skin';

const { inbox: inboxTokens } = skin.components;

export type TabType = 'received' | 'sent';

interface InboxTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  /** Translation function */
  t: (key: string) => string;
}

/**
 * Tab bar for switching between received and sent items
 */
export function InboxTabs({
  activeTab,
  onTabChange,
  t,
}: InboxTabsProps): React.JSX.Element {
  return (
    <View style={styles.container}>
      <Pressable
        style={[styles.tab, activeTab === 'received' && styles.tabActive]}
        onPress={() => onTabChange('received')}
      >
        <Icon
          name="inbox"
          size="sm"
          colorToken={activeTab === 'received' ? 'primaryText' : 'textPrimary'}
        />
        <Label
          style={[
            styles.tabText,
            activeTab === 'received' && styles.tabTextActive,
          ]}
        >
          {t('inbox.tabs.received')}
        </Label>
      </Pressable>
      <Pressable
        style={[styles.tab, activeTab === 'sent' && styles.tabActive]}
        onPress={() => onTabChange('sent')}
      >
        <Icon
          name="send"
          size="sm"
          colorToken={activeTab === 'sent' ? 'primaryText' : 'textPrimary'}
        />
        <Label
          style={[
            styles.tabText,
            activeTab === 'sent' && styles.tabTextActive,
          ]}
        >
          {t('inbox.tabs.sent')}
        </Label>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: inboxTokens.tabs.borderBottomWidth,
    borderBottomColor: inboxTokens.tabs.borderBottomColor,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: inboxTokens.tabs.iconGap,
    paddingVertical: inboxTokens.tabs.tabPadding,
    backgroundColor: inboxTokens.tabs.inactiveBackground,
    borderWidth: inboxTokens.tabs.inactiveBorderWidth,
    borderColor: inboxTokens.tabs.inactiveBorderColor,
    borderBottomWidth: 0,
  },
  tabActive: {
    backgroundColor: inboxTokens.tabs.activeBackground,
    borderWidth: inboxTokens.tabs.activeBorderWidth,
    borderColor: inboxTokens.tabs.activeBorderColor,
    borderBottomWidth: 0,
  },
  tabText: {
    color: inboxTokens.tabs.inactiveTextColor,
    textTransform: 'uppercase',
  },
  tabTextActive: {
    color: inboxTokens.tabs.activeTextColor,
  },
});
