/**
 * Javne Usluge Screen
 *
 * Public Services page displaying essential services info for Vis island.
 * Replaces the generic "Info za posjetitelje" static page.
 *
 * Features:
 * - ServicePageHeader (teal background, icon, title/subtitle)
 * - ServiceAccordionCard list (expandable service info)
 * - EmergencyTile row (quick-dial emergency numbers)
 *
 * Skin-pure: Uses skin tokens only (no hardcoded hex, no magic numbers).
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalHeader } from '../../components/GlobalHeader';
import { ServicePageHeader } from '../../components/services/ServicePageHeader';
import { ServiceAccordionCard } from '../../components/services/ServiceAccordionCard';
import { EmergencyTile } from '../../components/services/EmergencyTile';
import { javneUslugeContent } from '../../data/javneUslugeContent';
import { useTranslations } from '../../i18n';
import { skin } from '../../ui/skin';
import { Icon } from '../../ui/Icon';
import { H2, Body } from '../../ui/Text';

const { colors, spacing, borders } = skin;

export function JavneUslugeScreen(): React.JSX.Element {
  const { language } = useTranslations();
  const { header, services, emergency, usefulLinks } = javneUslugeContent;
  const isEn = language === 'en';

  const handleLinkPress = (url: string) => {
    void Linking.openURL(url);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader type="child" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Page Header */}
        <ServicePageHeader
          title={isEn ? header.titleEn : header.title}
          subtitle={isEn ? header.subtitleEn : header.subtitle}
          icon={header.icon}
        />

        {/* Services List */}
        <View style={styles.servicesSection}>
          {services.map((service) => (
            <ServiceAccordionCard
              key={service.id}
              icon={service.icon}
              title={isEn ? service.titleEn : service.title}
              subtitle={isEn ? service.subtitleEn : service.subtitle}
              badge={service.badge}
              iconBackgroundColor={colors[service.iconBackgroundColor]}
              infoRows={service.infoRows.map(row => ({
                icon: row.icon,
                label: isEn ? row.labelEn : row.label,
                value: isEn ? row.valueEn : row.value,
              }))}
              note={isEn ? service.noteEn : service.note}
            />
          ))}
        </View>

        {/* Emergency Numbers Section */}
        <View style={styles.emergencySection}>
          <H2 style={styles.emergencyTitle}>{isEn ? emergency.titleEn : emergency.title}</H2>
          <View style={styles.emergencyTiles}>
            {emergency.numbers.map((num) => (
              <EmergencyTile
                key={num.id}
                icon={num.icon}
                name={isEn ? num.nameEn : num.name}
                phoneNumber={num.phoneNumber}
                backgroundColor={colors[num.backgroundColor]}
                textColor={num.textColor ? colors[num.textColor] : undefined}
              />
            ))}
          </View>
        </View>

        {/* Useful Links Section */}
        <View style={styles.linksSection}>
          <H2 style={styles.linksTitle}>{isEn ? usefulLinks.titleEn : usefulLinks.title}</H2>
          <View style={styles.linksList}>
            {usefulLinks.links.map((link) => (
              <Pressable
                key={link.id}
                style={styles.linkItem}
                onPress={() => handleLinkPress(link.url)}
                accessibilityRole="link"
                accessibilityLabel={isEn ? link.titleEn : link.title}
              >
                <Icon name={link.icon} size="sm" colorToken="textMuted" />
                <Body style={styles.linkText}>{isEn ? link.titleEn : link.title}</Body>
                <Icon name="globe" size="sm" colorToken="chevron" />
              </Pressable>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: spacing.xxxl,
  },
  servicesSection: {
    padding: spacing.lg,
  },
  emergencySection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  emergencyTitle: {
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  emergencyTiles: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  linksSection: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  linksTitle: {
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  linksList: {
    backgroundColor: colors.background,
    borderWidth: borders.widthThin,
    borderColor: colors.border,
  },
  linkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderBottomWidth: borders.widthHairline,
    borderBottomColor: colors.borderLight,
    gap: spacing.md,
  },
  linkText: {
    flex: 1,
    color: colors.textPrimary,
  },
});

export default JavneUslugeScreen;
