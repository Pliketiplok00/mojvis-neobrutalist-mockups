/**
 * Header Primitive
 *
 * Thin wrapper around GlobalHeader for consistent usage.
 * Does NOT change header behavior - just provides skin-aware wrapper.
 */

import React from 'react';
import { GlobalHeader, type HeaderType } from '../components/GlobalHeader';

interface HeaderProps {
  /** Type of header: 'root' | 'child' | 'inbox' */
  type: HeaderType;
  /** Menu press handler for root type */
  onMenuPress?: () => void;
  /** Unread count for badge */
  unreadCount?: number;
}

export function Header({
  type,
  onMenuPress,
  unreadCount,
}: HeaderProps): React.JSX.Element {
  return (
    <GlobalHeader
      type={type}
      onMenuPress={onMenuPress}
      unreadCount={unreadCount}
    />
  );
}

export default Header;
