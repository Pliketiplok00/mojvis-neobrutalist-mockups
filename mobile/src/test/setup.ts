/**
 * Jest Test Setup
 *
 * Common mocks for React Native component testing.
 * Uses jest-expo preset for React Native mocks.
 */


// Mock Icon component
jest.mock('../ui/Icon', () => ({
  Icon: ({ name }: { name: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, { testID: `icon-${name}` }, `[${name}]`);
  },
}));

// Mock Text components
jest.mock('../ui/Text', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    H1: ({ children, style, ...props }: { children: React.ReactNode; style?: object }) =>
      React.createElement(Text, { ...props, style }, children),
    H2: ({ children, style, ...props }: { children: React.ReactNode; style?: object }) =>
      React.createElement(Text, { ...props, style }, children),
    Label: ({ children, style, numberOfLines, ...props }: { children: React.ReactNode; style?: object; numberOfLines?: number }) =>
      React.createElement(Text, { ...props, style, numberOfLines }, children),
    ButtonText: ({ children, style, numberOfLines, ...props }: { children: React.ReactNode; style?: object; numberOfLines?: number }) =>
      React.createElement(Text, { ...props, style, numberOfLines }, children),
    Meta: ({ children, style, numberOfLines, ...props }: { children: React.ReactNode; style?: object; numberOfLines?: number }) =>
      React.createElement(Text, { ...props, style, numberOfLines }, children),
    Body: ({ children, style, ...props }: { children: React.ReactNode; style?: object }) =>
      React.createElement(Text, { ...props, style }, children),
  };
});

// Mock navigation (only for component tests)
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
}));

// Mock i18n (only for component tests)
jest.mock('../i18n', () => ({
  useTranslations: () => ({
    t: (key: string) => key,
    language: 'hr',
  }),
}));

// Mock dateFormat utilities (only for component tests - not utility tests)
jest.mock('../utils/dateFormat', () => ({
  formatDayWithDate: () => 'Ponedjeljak, 15. veljače',
  formatEventTime: (_datetime: string, isAllDay: boolean, allDayText: string) =>
    isAllDay ? allDayText : '10:00',
  formatDateISO: () => '2026-02-15',
}));

// Add lineDetail tokens to skin mock
jest.mock('../ui/skin', () => ({
  skin: {
    colors: {
      textPrimary: '#000000',
      textSecondary: '#666666',
      textMuted: '#999999',
      border: '#000000',
      borderMuted: '#CCCCCC',
      primary: '#2563EB',
      primaryText: '#FFFFFF',
      background: '#FFFFFF',
      backgroundSecondary: '#F5F5F5',
      link: '#2563EB',
    },
    spacing: {
      xs: 4,
      sm: 8,
      md: 12,
      lg: 16,
      xl: 24,
      xxl: 32,
    },
    borders: {
      widthThin: 1,
      widthMedium: 2,
      widthThick: 3,
      radiusCard: 0,
    },
    typography: {
      fontSize: {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 20,
        xxl: 24,
      },
      fontWeight: {
        normal: '400',
        medium: '500',
        bold: '700',
      },
      fontFamily: {
        body: {
          regular: 'System',
          medium: 'System',
          bold: 'System',
        },
        display: {
          regular: 'System',
          bold: 'System',
        },
      },
    },
    components: {
      inbox: {
        tabs: {
          borderBottomWidth: 2,
          borderBottomColor: '#000000',
          iconGap: 8,
          tabPadding: 12,
          inactiveBackground: '#FFFFFF',
          inactiveBorderWidth: 1,
          inactiveBorderColor: '#000000',
          activeBackground: '#2563EB',
          activeBorderWidth: 2,
          activeBorderColor: '#000000',
          inactiveTextColor: '#000000',
          activeTextColor: '#FFFFFF',
        },
        tagFilter: {
          containerBackground: '#F5F5F5',
          containerPadding: 12,
          chipGap: 8,
          chipShadowOffset: 3,
          chipShadowColor: '#000000',
          chipBorderRadius: 4,
          chipPaddingHorizontal: 12,
          chipPaddingVertical: 8,
          chipBorderWidthDefault: 1,
          chipBorderWidthSelected: 2,
          chipBorderColor: '#000000',
          chipBackgrounds: {
            hitno: '#EF4444',
            promet: '#3B82F6',
            kultura: '#8B5CF6',
            opcenito: '#6B7280',
            vis: '#10B981',
            komiza: '#F59E0B',
          },
          chipTextColors: {
            hitno: '#FFFFFF',
            promet: '#FFFFFF',
            kultura: '#FFFFFF',
            opcenito: '#FFFFFF',
            vis: '#FFFFFF',
            komiza: '#000000',
          },
        },
        listItem: {
          marginBottom: 12,
          marginHorizontal: 16,
          shadowOffsetX: 3,
          shadowOffsetY: 3,
          shadowColor: '#000000',
          borderRadius: 0,
          background: '#FFFFFF',
          borderWidth: 2,
          borderColor: '#000000',
          padding: 12,
          iconSlabSize: 48,
          iconSlabGap: 12,
          iconSlabBorderWidth: 2,
          iconSlabBorderColor: '#000000',
          iconSlabBackgroundDefault: '#E5E7EB',
          iconSlabBackgroundUrgent: '#EF4444',
          iconSlabBackgroundTransport: '#3B82F6',
          iconSlabBackgroundCulture: '#8B5CF6',
          iconSlabBackgroundGeneral: '#10B981',
          titleMarginBottom: 4,
          snippetMarginBottom: 8,
          newBadgeBackground: '#EF4444',
          newBadgePadding: 4,
          newBadgeBorderWidth: 1,
          newBadgeBorderColor: '#000000',
          newBadgeTextColor: '#FFFFFF',
          chevronBoxSize: 32,
        },
      },
      events: {
        card: {
          marginBottom: 12,
          shadowOffsetX: 3,
          shadowOffsetY: 3,
          shadowColor: '#000000',
          borderRadius: 0,
          background: '#FFFFFF',
          borderWidth: 2,
          borderColor: '#000000',
          padding: 12,
        },
        detail: {
          heroImageAspectRatio: 16 / 9,
          heroImageBorderWidth: 2,
          heroImageBorderColor: '#000000',
          titlePadding: 16,
          titleBorderWidth: 3,
          titleBorderColor: '#000000',
          titleBackground: '#FFE500',
          infoSectionPadding: 16,
          infoSectionDividerWidth: 1,
          infoSectionDividerColor: '#000000',
          infoTilePadding: 16,
          infoTileGap: 12,
          infoTileIconBoxSize: 40,
          infoLabelMarginBottom: 4,
          secondaryValueMarginTop: 4,
          descriptionLineHeight: 22,
          ctaShadowOffsetX: 3,
          ctaShadowOffsetY: 3,
          ctaShadowColor: '#000000',
          reminderCardRadius: 0,
          reminderCardPadding: 16,
          reminderCardBackground: '#FFFFFF',
          reminderCardBorderWidth: 2,
          reminderCardBorderColor: '#000000',
          reminderHintMarginTop: 4,
        },
      },
      badge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 0,
        borderWidth: 1,
        borderColor: '#000000',
        backgroundDefault: '#E5E7EB',
        textColorDefault: '#000000',
        fontSize: 10,
        fontWeight: '700',
      },
      transport: {
        lineDetail: {
          shadowOffsetX: 3,
          shadowOffsetY: 3,
          shadowColor: '#000000',
          dateSelectorBackground: '#FFFFFF',
          dateSelectorBorderWidth: 2,
          dateSelectorBorderColor: '#000000',
          dateSelectorRadius: 0,
          directionTabBorderWidth: 2,
          directionTabBorderColor: '#000000',
          directionTabRadius: 0,
          directionTabPadding: 12,
          directionTabInactiveBackground: '#FFFFFF',
          directionTabInactiveText: '#000000',
          directionTabActiveText: '#FFFFFF',
          departureRowGap: 8,
          contactCardBackground: '#FFFFFF',
          contactCardBorderWidth: 2,
          contactCardBorderColor: '#000000',
          contactCardRadius: 0,
          contactCardPadding: 12,
          headerPadding: 16,
          headerBorderWidth: 2,
          headerBorderColor: '#000000',
          headerIconBoxSize: 48,
          headerTitleColor: '#FFFFFF',
          headerMetaColor: '#FFFFFF',
        },
        note: {
          noteBorderWidth: 2,
          noteBorderColor: '#000000',
          noteBackground: '#FFFBEB',
          noteRadius: 0,
          notePadding: 12,
          noteTextColor: '#000000',
        },
        list: {
          lineCardHeaderBackgroundHighlight: '#F59E0B',
          lineCardGap: 12,
          lineCardShadowOffsetX: 3,
          lineCardShadowOffsetY: 3,
          lineCardShadowColor: '#000000',
          lineCardBorderWidth: 2,
          lineCardBorderColor: '#000000',
          lineCardRadius: 0,
          lineCardPressedOffsetX: 3,
          lineCardPressedOffsetY: 3,
          lineCardHeaderPadding: 12,
          lineCardHeaderIconBoxSize: 40,
          lineCardHeaderIconGap: 8,
          lineCardHeaderTitleColor: '#1A1A1A',
          lineCardBodyBackground: '#FFFFFF',
          lineCardBodyPadding: 12,
          lineCardBodyBorderTopWidth: 2,
          lineCardBodyBorderColor: '#000000',
          lineCardMetaGap: 4,
          lineCardChevronBoxSize: 32,
          lineCardChevronGap: 8,
          todaySetShadowOffsetX: 3,
          todaySetShadowOffsetY: 3,
          todaySetShadowColor: '#000000',
          todaySetBackground: '#FFFFFF',
          todaySetBorderWidth: 2,
          todaySetBorderColor: '#000000',
          todaySetRadius: 0,
          todayRowBackground: '#FFFFFF',
          todayRowDividerWidth: 1,
          todayRowDividerColor: '#000000',
          todayRowPressedOffsetX: 2,
          todayRowPressedOffsetY: 2,
          todayTimeBlockWidth: 72,
          todayTimeBlockBorderWidth: 2,
          todayTimeBlockBorderColor: '#000000',
          todayTimeBlockPadding: 12,
          todayTimeBlockTextColor: '#FFFFFF',
          todayRowPadding: 12,
        },
      },
    },
  },
}));
