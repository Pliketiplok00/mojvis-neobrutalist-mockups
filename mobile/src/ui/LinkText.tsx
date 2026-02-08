/**
 * LinkText Component
 *
 * Renders text with automatic URL detection.
 * Any http:// or https:// URL is rendered as a clickable link.
 *
 * Usage:
 *   <LinkText style={styles.body}>{message.body}</LinkText>
 */

import React from 'react';
import {
  Text as RNText,
  Linking,
  StyleSheet,
  type StyleProp,
  type TextStyle,
  type TextProps as RNTextProps,
} from 'react-native';
import { skin } from './skin';

interface LinkTextProps extends Omit<RNTextProps, 'style' | 'children'> {
  /** Text content (may contain URLs) */
  children: string;
  /** Base text style */
  style?: StyleProp<TextStyle>;
  /** Link color override (defaults to skin.colors.link) */
  linkColor?: string;
}

/**
 * URL regex pattern
 * Matches http:// or https:// URLs, stopping at whitespace or common delimiters
 */
const URL_REGEX = /https?:\/\/[^\s<>"\[\](){}|\\^`]+/gi;

/**
 * Parse text into segments of plain text and URLs
 */
function parseTextWithLinks(text: string): Array<{ type: 'text' | 'link'; value: string }> {
  const segments: Array<{ type: 'text' | 'link'; value: string }> = [];
  let lastIndex = 0;

  // Reset regex state
  URL_REGEX.lastIndex = 0;

  let match;
  while ((match = URL_REGEX.exec(text)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        value: text.slice(lastIndex, match.index),
      });
    }

    // Add the URL
    segments.push({
      type: 'link',
      value: match[0],
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last URL
  if (lastIndex < text.length) {
    segments.push({
      type: 'text',
      value: text.slice(lastIndex),
    });
  }

  return segments;
}

/**
 * Handle link press - opens URL in browser
 */
async function handleLinkPress(url: string): Promise<void> {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    } else {
      console.warn('[LinkText] Cannot open URL:', url);
    }
  } catch (error) {
    console.error('[LinkText] Error opening URL:', error);
  }
}

/**
 * LinkText - renders text with clickable URLs
 */
export function LinkText({
  children,
  style,
  linkColor,
  ...props
}: LinkTextProps): React.JSX.Element {
  const resolvedLinkColor = linkColor ?? skin.colors.link;
  const segments = parseTextWithLinks(children);

  // If no links found, render as plain text
  if (segments.length === 1 && segments[0].type === 'text') {
    return (
      <RNText style={style} {...props}>
        {children}
      </RNText>
    );
  }

  return (
    <RNText style={style} {...props}>
      {segments.map((segment, index) => {
        if (segment.type === 'link') {
          return (
            <RNText
              key={index}
              style={[styles.link, { color: resolvedLinkColor }]}
              onPress={() => void handleLinkPress(segment.value)}
              accessibilityRole="link"
              accessibilityHint={`Opens ${segment.value} in browser`}
            >
              {segment.value}
            </RNText>
          );
        }
        return segment.value;
      })}
    </RNText>
  );
}

const styles = StyleSheet.create({
  link: {
    textDecorationLine: 'underline',
  },
});

export default LinkText;
