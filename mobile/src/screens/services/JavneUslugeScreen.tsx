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
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalHeader } from '../../components/GlobalHeader';
import { ServicePageHeader } from '../../components/services/ServicePageHeader';
import { ServiceAccordionCard } from '../../components/services/ServiceAccordionCard';
import { EmergencyTile } from '../../components/services/EmergencyTile';
import { javneUslugeContent } from '../../data/javneUslugeContent';
import { skin } from '../../ui/skin';
import { H2 } from '../../ui/Text';

const { colors, spacing } = skin;

export function JavneUslugeScreen(): React.JSX.Element {
  const { header, services, emergency } = javneUslugeContent;

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
          title={header.title}
          subtitle={header.subtitle}
          icon={header.icon}
        />

        {/* Services List */}
        <View style={styles.servicesSection}>
          {services.map((service) => (
            <ServiceAccordionCard
              key={service.id}
              icon={service.icon}
              title={service.title}
              subtitle={service.subtitle}
              badge={service.badge}
              iconBackgroundColor={colors[service.iconBackgroundColor]}
              infoRows={service.infoRows}
              note={service.note}
            />
          ))}
        </View>

        {/* Emergency Numbers Section */}
        <View style={styles.emergencySection}>
          <H2 style={styles.emergencyTitle}>{emergency.title}</H2>
          <View style={styles.emergencyTiles}>
            {emergency.numbers.map((num) => (
              <EmergencyTile
                key={num.id}
                icon={num.icon}
                name={num.name}
                phoneNumber={num.phoneNumber}
                backgroundColor={colors[num.backgroundColor]}
                textColor={num.textColor ? colors[num.textColor] : undefined}
              />
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
});

export default JavneUslugeScreen;
