/**
 * UI Inventory Screen (DEV ONLY)
 *
 * Comprehensive catalog of existing visual elements used across the app.
 * Shows component samples with their names, variants, and token references.
 *
 * Access: Settings -> "UI Inventory (DEV)" (only visible in __DEV__ builds)
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalHeader } from '../../components/GlobalHeader';
import { H1, H2, Label, Body, Meta, ButtonText } from '../../ui/Text';
import { Icon, type IconName, type IconSize } from '../../ui/Icon';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Input } from '../../ui/Input';
import { skin } from '../../ui/skin';

const { colors, spacing, borders, typography, icons, shadows } = skin;

// ============================================================================
// Helper Components
// ============================================================================

interface SampleBlockProps {
  title: string;
  description?: string;
  tokens?: string[];
  children: React.ReactNode;
}

/**
 * Container for a single sample with title, description, and token references.
 */
function SampleBlock({ title, description, tokens, children }: SampleBlockProps): React.JSX.Element {
  return (
    <View style={styles.sampleBlock}>
      <View style={styles.sampleHeader}>
        <Label style={styles.sampleTitle}>{title}</Label>
        {description && <Meta style={styles.sampleDescription}>{description}</Meta>}
      </View>
      {tokens && tokens.length > 0 && (
        <View style={styles.tokenList}>
          {tokens.map((token, index) => (
            <Meta key={index} style={styles.tokenText}>{token}</Meta>
          ))}
        </View>
      )}
      <View style={styles.sampleContent}>
        {children}
      </View>
    </View>
  );
}

interface ColorSwatchProps {
  name: string;
  colorToken: string;
  colorValue: string;
}

/**
 * Single color swatch with token name.
 */
function ColorSwatch({ name, colorToken, colorValue }: ColorSwatchProps): React.JSX.Element {
  const isLight = colorValue === 'white' || colorValue.includes('96)') || colorValue.includes('98)');
  return (
    <View style={styles.swatchContainer}>
      <View style={[styles.swatch, { backgroundColor: colorValue }]}>
        {isLight && <View style={styles.swatchInner} />}
      </View>
      <Meta style={styles.swatchName}>{name}</Meta>
      <Meta style={styles.swatchToken}>{colorToken}</Meta>
    </View>
  );
}

interface SpacingBlockProps {
  name: string;
  value: number;
}

/**
 * Visual representation of a spacing value.
 */
function SpacingBlock({ name, value }: SpacingBlockProps): React.JSX.Element {
  return (
    <View style={styles.spacingRow}>
      <View style={[styles.spacingVisual, { width: value }]} />
      <Meta style={styles.spacingLabel}>{name}: {value}px</Meta>
    </View>
  );
}

// ============================================================================
// Main Screen Component
// ============================================================================

export function UiInventoryScreen(): React.JSX.Element {
  const [inputValue, setInputValue] = useState('');

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader type="child" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Page Title */}
        <View style={styles.pageHeader}>
          <H1>UI Inventory</H1>
          <Meta style={styles.pageSubtitle}>DEV-ONLY component catalog</Meta>
        </View>

        {/* ================================================================ */}
        {/* SECTION: Typography */}
        {/* ================================================================ */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Typography</H2>

          <SampleBlock
            title="H1 - Hero Title"
            tokens={[
              'fontSize: typography.fontSize.xxxl (28)',
              'fontFamily: display.bold (Space Grotesk)',
              'color: textPrimary',
            ]}
          >
            <H1>Hero Title</H1>
          </SampleBlock>

          <SampleBlock
            title="H2 - Section Title"
            tokens={[
              'fontSize: typography.fontSize.xl (18)',
              'fontFamily: display.semiBold (Space Grotesk)',
              'color: textPrimary',
            ]}
          >
            <H2>Section Title</H2>
          </SampleBlock>

          <SampleBlock
            title="Label - UI Label"
            tokens={[
              'fontSize: typography.fontSize.md (14)',
              'fontFamily: body.regular (Space Mono)',
              'color: textSecondary',
            ]}
          >
            <Label>UI Label Text</Label>
          </SampleBlock>

          <SampleBlock
            title="Label - Section Subtitle (uppercase)"
            description="Used for section headers in transport screens"
            tokens={[
              'component: Label',
              'style: textTransform uppercase',
              'color: textSecondary',
            ]}
          >
            <Label style={styles.sectionSubtitle}>LINIJE</Label>
            <Label style={styles.sectionSubtitle}>POLASCI DANAS</Label>
          </SampleBlock>

          <SampleBlock
            title="Body - Body Text"
            tokens={[
              'fontSize: typography.fontSize.lg (16)',
              'fontFamily: body.regular (Space Mono)',
              'color: textSecondary',
            ]}
          >
            <Body>Body text for longer content and descriptions.</Body>
          </SampleBlock>

          <SampleBlock
            title="Meta - Small Meta Text"
            tokens={[
              'fontSize: typography.fontSize.sm (12)',
              'fontFamily: body.regular (Space Mono)',
              'color: textDisabled',
            ]}
          >
            <Meta>Meta text for timestamps, captions, etc.</Meta>
          </SampleBlock>

          <SampleBlock
            title="ButtonText - Button Label"
            tokens={[
              'fontSize: typography.fontSize.lg (16)',
              'fontFamily: body.bold (Space Mono)',
              'color: textPrimary',
            ]}
          >
            <ButtonText>Button Label</ButtonText>
          </SampleBlock>
        </View>

        {/* ================================================================ */}
        {/* SECTION: Color Tokens */}
        {/* ================================================================ */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Color Tokens</H2>

          <View style={styles.swatchGrid}>
            <ColorSwatch name="Background" colorToken="colors.background" colorValue={colors.background} />
            <ColorSwatch name="Secondary BG" colorToken="colors.backgroundSecondary" colorValue={colors.backgroundSecondary} />
            <ColorSwatch name="Tertiary BG" colorToken="colors.backgroundTertiary" colorValue={colors.backgroundTertiary} />
            <ColorSwatch name="Border" colorToken="colors.border" colorValue={colors.border} />
            <ColorSwatch name="Text Primary" colorToken="colors.textPrimary" colorValue={colors.textPrimary} />
            <ColorSwatch name="Text Secondary" colorToken="colors.textSecondary" colorValue={colors.textSecondary} />
            <ColorSwatch name="Primary" colorToken="colors.primary" colorValue={colors.primary} />
            <ColorSwatch name="Primary Text" colorToken="colors.primaryText" colorValue={colors.primaryText} />
            <ColorSwatch name="Success" colorToken="colors.successAccent" colorValue={colors.successAccent} />
            <ColorSwatch name="Warning" colorToken="colors.warningBackground" colorValue={colors.warningBackground} />
            <ColorSwatch name="Error" colorToken="colors.errorText" colorValue={colors.errorText} />
            <ColorSwatch name="Teal" colorToken="colors.teal" colorValue={colors.teal} />
          </View>
        </View>

        {/* ================================================================ */}
        {/* SECTION: Icons */}
        {/* ================================================================ */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Icons</H2>

          <SampleBlock
            title="Icon Sizes"
            tokens={[
              'xs: 14px, sm: 18px, md: 24px, lg: 32px, xl: 40px',
              'strokeWidth: light (1.5), regular (2), strong (2.5)',
            ]}
          >
            <View style={styles.iconRow}>
              {(['xs', 'sm', 'md', 'lg', 'xl'] as IconSize[]).map((size) => (
                <View key={size} style={styles.iconSample}>
                  <Icon name="home" size={size} colorToken="textPrimary" />
                  <Meta style={styles.iconLabel}>{size}</Meta>
                </View>
              ))}
            </View>
          </SampleBlock>

          <SampleBlock
            title="Icon Examples"
            tokens={['colorToken: textPrimary | textSecondary | primary']}
          >
            <View style={styles.iconRow}>
              {(['home', 'calendar', 'bus', 'ship', 'inbox', 'settings', 'phone', 'mail', 'clock', 'map-pin'] as IconName[]).map((name) => (
                <View key={name} style={styles.iconSample}>
                  <Icon name={name} size="md" colorToken="textPrimary" />
                  <Meta style={styles.iconLabel}>{name}</Meta>
                </View>
              ))}
            </View>
          </SampleBlock>
        </View>

        {/* ================================================================ */}
        {/* SECTION: Badges */}
        {/* ================================================================ */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Badges</H2>

          <SampleBlock
            title="Badge Variants"
            tokens={[
              'component: Badge',
              'variants: urgent, info, success, warning, pending, type, default',
              'tokens: components.badge.*',
            ]}
          >
            <View style={styles.badgeRow}>
              <Badge variant="default">DEFAULT</Badge>
              <Badge variant="info">INFO</Badge>
              <Badge variant="success">SUCCESS</Badge>
              <Badge variant="warning">WARNING</Badge>
              <Badge variant="urgent">URGENT</Badge>
              <Badge variant="pending">PENDING</Badge>
              <Badge variant="type">TYPE</Badge>
            </View>
          </SampleBlock>
        </View>

        {/* ================================================================ */}
        {/* SECTION: Buttons */}
        {/* ================================================================ */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Buttons</H2>

          <SampleBlock
            title="Button Variants"
            tokens={[
              'component: Button',
              'variants: primary, secondary, danger',
              'tokens: components.button.*',
            ]}
          >
            <View style={styles.buttonColumn}>
              <Button variant="primary" onPress={() => {}}>Primary Button</Button>
              <Button variant="secondary" onPress={() => {}}>Secondary Button</Button>
              <Button variant="danger" onPress={() => {}}>Danger Button</Button>
            </View>
          </SampleBlock>

          <SampleBlock
            title="Button States"
            tokens={['props: disabled, loading']}
          >
            <View style={styles.buttonColumn}>
              <Button variant="primary" onPress={() => {}} disabled>Disabled Primary</Button>
              <Button variant="primary" onPress={() => {}} loading>Loading...</Button>
            </View>
          </SampleBlock>
        </View>

        {/* ================================================================ */}
        {/* SECTION: Inputs */}
        {/* ================================================================ */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Inputs</H2>

          <SampleBlock
            title="Text Input"
            tokens={[
              'component: Input',
              'tokens: components.input.*',
              'fontFamily: body.regular',
            ]}
          >
            <Input
              value={inputValue}
              onChangeText={setInputValue}
              placeholder="Enter text..."
            />
          </SampleBlock>

          <SampleBlock
            title="Input States"
            tokens={['props: error, disabled, multiline']}
          >
            <View style={styles.inputColumn}>
              <Input value="" onChangeText={() => {}} placeholder="Normal" />
              <Input value="" onChangeText={() => {}} placeholder="Error state" error />
              <Input value="" onChangeText={() => {}} placeholder="Disabled" disabled />
              <Input value="" onChangeText={() => {}} placeholder="Multiline..." multiline numberOfLines={3} />
            </View>
          </SampleBlock>
        </View>

        {/* ================================================================ */}
        {/* SECTION: Spacing Scale */}
        {/* ================================================================ */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Spacing Scale</H2>

          <SampleBlock
            title="Spacing Tokens"
            tokens={['tokens: spacing.xs through spacing.xxxl']}
          >
            <View style={styles.spacingColumn}>
              <SpacingBlock name="xs" value={spacing.xs} />
              <SpacingBlock name="sm" value={spacing.sm} />
              <SpacingBlock name="md" value={spacing.md} />
              <SpacingBlock name="lg" value={spacing.lg} />
              <SpacingBlock name="xl" value={spacing.xl} />
              <SpacingBlock name="xxl" value={spacing.xxl} />
              <SpacingBlock name="xxxl" value={spacing.xxxl} />
            </View>
          </SampleBlock>
        </View>

        {/* ================================================================ */}
        {/* SECTION: Borders */}
        {/* ================================================================ */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Borders</H2>

          <SampleBlock
            title="Border Widths"
            tokens={[
              'hairline: 1px, thin: 2px, card: 3px, heavy: 4px',
              'radiusSharp: 0, radiusSoft: 4, radiusPill: 9999',
            ]}
          >
            <View style={styles.borderRow}>
              <View style={[styles.borderSample, { borderWidth: borders.widthHairline }]}>
                <Meta>hairline</Meta>
              </View>
              <View style={[styles.borderSample, { borderWidth: borders.widthThin }]}>
                <Meta>thin</Meta>
              </View>
              <View style={[styles.borderSample, { borderWidth: borders.widthCard }]}>
                <Meta>card</Meta>
              </View>
              <View style={[styles.borderSample, { borderWidth: borders.widthHeavy }]}>
                <Meta>heavy</Meta>
              </View>
            </View>
          </SampleBlock>
        </View>

        {/* ================================================================ */}
        {/* SECTION: Shadows */}
        {/* ================================================================ */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Shadows</H2>

          <SampleBlock
            title="Shadow Tokens"
            tokens={[
              'shadows.card - offset shadow for cards',
              'shadows.none - no shadow',
            ]}
          >
            <View style={styles.shadowRow}>
              <View style={[styles.shadowSample, shadows.none]}>
                <Meta>none</Meta>
              </View>
              <View style={[styles.shadowSample, shadows.card]}>
                <Meta>card</Meta>
              </View>
            </View>
          </SampleBlock>

          <SampleBlock
            title="Poster Shadow Pattern"
            description="Dual-layer offset shadow (absolute positioned)"
            tokens={[
              'pattern: View (shadow) + View (content)',
              'offset: 4px diagonal',
            ]}
          >
            <View style={styles.posterShadowDemo}>
              <View style={styles.posterShadow} />
              <View style={styles.posterCard}>
                <Label style={styles.posterCardText}>Poster Card</Label>
              </View>
            </View>
          </SampleBlock>
        </View>

        {/* ================================================================ */}
        {/* SECTION: Transport Elements */}
        {/* ================================================================ */}
        <View style={styles.section}>
          <H2 style={styles.sectionTitle}>Transport Elements</H2>

          <SampleBlock
            title="Transport Hub Tile (Sea)"
            description="Poster slab layout: icon slab + divider + content"
            tokens={[
              'tokens: components.transport.tiles.*',
              'background: tileSeaBackground (primary)',
              'divider: tileDividerWidth, tileDividerColor',
            ]}
          >
            <View style={styles.tileDemoWrapper}>
              <View style={styles.tileDemoShadow} />
              <View style={[styles.tileDemo, styles.tileDemoSea]}>
                <View style={styles.tileDemoIconSlab}>
                  <Icon name="ship" size="lg" colorToken="primaryText" />
                </View>
                <View style={styles.tileDemoDivider} />
                <View style={styles.tileDemoContent}>
                  <Label style={styles.tileDemoTitle}>POMORSKI PROMET</Label>
                  <Meta style={styles.tileDemoSubtitle}>Trajekti i katamarani</Meta>
                </View>
                <View style={styles.tileDemoChevron}>
                  <Icon name="chevron-right" size="md" colorToken="primaryText" />
                </View>
              </View>
            </View>
          </SampleBlock>

          <SampleBlock
            title="Transport Hub Tile (Road)"
            tokens={['background: tileRoadBackground (secondary/green)']}
          >
            <View style={styles.tileDemoWrapper}>
              <View style={styles.tileDemoShadow} />
              <View style={[styles.tileDemo, styles.tileDemoRoad]}>
                <View style={styles.tileDemoIconSlab}>
                  <Icon name="bus" size="lg" colorToken="primaryText" />
                </View>
                <View style={styles.tileDemoDivider} />
                <View style={styles.tileDemoContent}>
                  <Label style={styles.tileDemoTitle}>CESTOVNI PROMET</Label>
                  <Meta style={styles.tileDemoSubtitle}>Autobusne linije</Meta>
                </View>
                <View style={styles.tileDemoChevron}>
                  <Icon name="chevron-right" size="md" colorToken="primaryText" />
                </View>
              </View>
            </View>
          </SampleBlock>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Meta>End of UI Inventory</Meta>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  pageHeader: {
    padding: spacing.lg,
    backgroundColor: colors.background,
    borderBottomWidth: borders.widthCard,
    borderBottomColor: colors.border,
  },
  pageSubtitle: {
    marginTop: spacing.xs,
  },

  // Section
  section: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.lg,
    backgroundColor: colors.backgroundTertiary,
    borderRadius: borders.radiusCard,
    borderWidth: borders.widthCard,
    borderColor: colors.border,
    padding: spacing.lg,
    ...shadows.card,
  },
  sectionTitle: {
    marginBottom: spacing.lg,
    paddingBottom: spacing.sm,
    borderBottomWidth: borders.widthThin,
    borderBottomColor: colors.border,
  },

  // Sample Block
  sampleBlock: {
    marginBottom: spacing.xl,
  },
  sampleHeader: {
    marginBottom: spacing.sm,
  },
  sampleTitle: {
    color: colors.textPrimary,
  },
  sampleDescription: {
    marginTop: spacing.xs,
  },
  tokenList: {
    backgroundColor: colors.backgroundSecondary,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderRadius: borders.radiusSmall,
  },
  tokenText: {
    fontFamily: typography.fontFamily.body.regular,
  },
  sampleContent: {
    marginTop: spacing.sm,
  },

  // Section subtitle demo
  sectionSubtitle: {
    color: colors.textSecondary,
    textTransform: 'uppercase',
    marginBottom: spacing.sm,
  },

  // Color swatches
  swatchGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  swatchContainer: {
    alignItems: 'center',
    width: 70,
  },
  swatch: {
    width: 48,
    height: 48,
    borderRadius: borders.radiusSmall,
    borderWidth: borders.widthThin,
    borderColor: colors.border,
  },
  swatchInner: {
    flex: 1,
    margin: spacing.micro,
    borderWidth: borders.widthHairline,
    borderColor: colors.borderLight,
    borderRadius: borders.radiusSmall - 2,
  },
  swatchName: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  swatchToken: {
    textAlign: 'center',
    fontSize: typography.fontSize.xs,
  },

  // Icons
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.lg,
  },
  iconSample: {
    alignItems: 'center',
    minWidth: 50,
  },
  iconLabel: {
    marginTop: spacing.xs,
  },

  // Badges
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  // Buttons
  buttonColumn: {
    gap: spacing.md,
  },

  // Inputs
  inputColumn: {
    gap: spacing.md,
  },

  // Spacing
  spacingColumn: {
    gap: spacing.sm,
  },
  spacingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  spacingVisual: {
    height: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: borders.radiusSmall,
  },
  spacingLabel: {
    minWidth: 80,
  },

  // Borders
  borderRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  borderSample: {
    width: 60,
    height: 60,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },

  // Shadows
  shadowRow: {
    flexDirection: 'row',
    gap: spacing.xl,
  },
  shadowSample: {
    width: 80,
    height: 80,
    backgroundColor: colors.background,
    borderWidth: borders.widthCard,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Poster shadow demo
  posterShadowDemo: {
    position: 'relative',
    height: 60,
    marginBottom: spacing.md,
  },
  posterShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: colors.border,
  },
  posterCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    borderWidth: borders.widthCard,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  posterCardText: {
    color: colors.primaryText,
  },

  // Transport tile demo
  tileDemoWrapper: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  tileDemoShadow: {
    position: 'absolute',
    top: 4,
    left: 4,
    right: -4,
    bottom: -4,
    backgroundColor: colors.border,
  },
  tileDemo: {
    flexDirection: 'row',
    alignItems: 'stretch',
    borderWidth: borders.widthCard,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  tileDemoSea: {
    backgroundColor: colors.primary,
  },
  tileDemoRoad: {
    backgroundColor: colors.successAccent,
  },
  tileDemoIconSlab: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  tileDemoDivider: {
    width: borders.widthThin,
    backgroundColor: colors.border,
  },
  tileDemoContent: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.md,
  },
  tileDemoTitle: {
    color: colors.primaryText,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  tileDemoSubtitle: {
    color: colors.primaryText,
  },
  tileDemoChevron: {
    justifyContent: 'center',
    paddingRight: spacing.md,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
});

export default UiInventoryScreen;
