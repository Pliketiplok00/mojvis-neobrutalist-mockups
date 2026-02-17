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
 * - API integration with fallback to hardcoded content
 *
 * Skin-pure: Uses skin tokens only (no hardcoded hex, no magic numbers).
 */

import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Linking, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalHeader } from '../../components/GlobalHeader';
import { ServicePageHeader } from '../../components/services/ServicePageHeader';
import { ServiceAccordionCard, type ServiceInfoRow, type ScheduledDateItem, type ServiceLocationItem } from '../../components/services/ServiceAccordionCard';
import { EmergencyTile } from '../../components/services/EmergencyTile';
import { javneUslugeContent } from '../../data/javneUslugeContent';
import { useTranslations } from '../../i18n';
import { skin } from '../../ui/skin';
import { Icon, type IconName } from '../../ui/Icon';
import { H2, Body } from '../../ui/Text';
import { publicServicesApi, type PublicService } from '../../services/api';
import { getServiceBadge, getServiceWarning } from '../../utils/publicServiceHelpers';

const { colors, spacing, borders } = skin;

/** Map API icon_bg_color to skin color keys */
const mapIconBgColor = (apiColor: string): string => {
  const colorMap: Record<string, keyof typeof colors> = {
    urgent: 'urgent',
    secondary: 'secondary',
    lavender: 'lavender',
    orange: 'orange',
    accent: 'accent',
    primary: 'primary',
    errorBackground: 'errorBackground',
    warningBackground: 'warningBackground',
    infoBackground: 'infoBackground',
    pendingBackground: 'pendingBackground',
  };
  return colors[colorMap[apiColor] ?? 'backgroundSecondary'];
};

/** Transform API service to ServiceAccordionCard props */
const transformServiceToCard = (
  service: PublicService,
  language: 'hr' | 'en'
): {
  id: string;
  icon: IconName;
  title: string;
  subtitle: string;
  badge?: string;
  iconBackgroundColor: string;
  infoRows: ServiceInfoRow[];
  note?: string;
  scheduledDates?: ScheduledDateItem[];
  locations?: ServiceLocationItem[];
} => {
  const infoRows: ServiceInfoRow[] = [];
  const isEn = language === 'en';

  // Address row
  if (service.address) {
    infoRows.push({
      icon: 'map-pin' as IconName,
      label: isEn ? 'Address' : 'Adresa',
      value: service.address,
    });
  }

  // Contacts rows
  service.contacts.forEach((contact) => {
    infoRows.push({
      icon: (contact.type === 'email' ? 'mail' : 'phone') as IconName,
      label: contact.type === 'email' ? 'Email' : (isEn ? 'Phone' : 'Telefon'),
      value: contact.value,
    });
  });

  // Working hours (combine into single row)
  if (service.working_hours.length > 0) {
    const hoursText = service.working_hours
      .map((wh) => `${wh.description}: ${wh.time}`)
      .join('\n');
    infoRows.push({
      icon: 'clock' as IconName,
      label: isEn ? 'Working hours' : 'Radno vrijeme',
      value: hoursText,
    });
  }

  // Get badge from helper
  const badge = getServiceBadge(service) ?? undefined;

  // Get note - either from API or warning helper
  const noteText = service.note || getServiceWarning(service, language) || undefined;

  // Transform scheduled dates for periodic services
  const scheduledDates: ScheduledDateItem[] | undefined =
    service.type === 'periodic' && service.scheduled_dates.length > 0
      ? service.scheduled_dates.map((sd) => ({
          date: sd.date,
          time_from: sd.time_from,
          time_to: sd.time_to,
        }))
      : undefined;

  // Transform locations for multi-location services
  const locations: ServiceLocationItem[] | undefined =
    service.locations && service.locations.length > 0
      ? service.locations.map((loc) => ({
          name: loc.name,
          address: loc.address,
          phone: loc.phone,
          hours: loc.hours,
        }))
      : undefined;

  return {
    id: service.id,
    icon: service.icon as IconName,
    title: service.title,
    subtitle: service.subtitle || '',
    badge,
    iconBackgroundColor: mapIconBgColor(service.icon_bg_color),
    infoRows,
    note: noteText,
    scheduledDates,
    locations,
  };
};

export function JavneUslugeScreen(): React.JSX.Element {
  const { language } = useTranslations();
  const { header, services: fallbackServices, emergency, usefulLinks } = javneUslugeContent;
  const isEn = language === 'en';

  // API state
  const [apiServices, setApiServices] = useState<PublicService[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch services from API
  useEffect(() => {
    let cancelled = false;

    async function fetchServices() {
      setLoading(true);
      setError(null);

      try {
        const response = await publicServicesApi.getAll(language);
        if (!cancelled) {
          setApiServices(response.services);
        }
      } catch (err) {
        if (!cancelled) {
          console.warn('Failed to fetch public services:', err);
          setError(err instanceof Error ? err.message : 'Failed to load');
          setApiServices(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void fetchServices();
    return () => { cancelled = true; };
  }, [language]);

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
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : apiServices ? (
            // Render from API
            apiServices.map((service) => {
              const cardProps = transformServiceToCard(service, language);
              return (
                <ServiceAccordionCard
                  key={cardProps.id}
                  icon={cardProps.icon}
                  title={cardProps.title}
                  subtitle={cardProps.subtitle}
                  badge={cardProps.badge}
                  iconBackgroundColor={cardProps.iconBackgroundColor}
                  infoRows={cardProps.infoRows}
                  note={cardProps.note}
                  scheduledDates={cardProps.scheduledDates}
                  locations={cardProps.locations}
                  language={language}
                />
              );
            })
          ) : (
            // Fallback to hardcoded data
            fallbackServices.map((service) => (
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
            ))
          )}
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
  loadingContainer: {
    paddingVertical: spacing.xxxl,
    alignItems: 'center',
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
