/**
 * Line Detail Screen
 *
 * Displays full details for a transport line.
 * Shared component for both Road and Sea transport.
 *
 * Sections:
 * - Header: Line name, subtype
 * - Date selector: Single date (default today)
 * - Direction toggle: 0 or 1 (resolved via route)
 * - Departures list: Expandable with stop times
 * - Contacts: BY LINE
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlobalHeader } from '../../components/GlobalHeader';
import { DepartureItem } from '../../components/DepartureItem';
import { useTranslations } from '../../i18n';
import { transportApi } from '../../services/api';
import type {
  TransportType,
  LineDetailResponse,
  DeparturesListResponse,
  RouteInfo,
  DayType,
} from '../../types/transport';

interface LineDetailScreenProps {
  lineId: string;
  transportType: TransportType;
}

export function LineDetailScreen({
  lineId,
  transportType,
}: LineDetailScreenProps): React.JSX.Element {
  const { t } = useTranslations();

  const DAY_TYPE_LABELS: Record<DayType, string> = {
    MON: t('transport.dayTypes.MON'),
    TUE: t('transport.dayTypes.TUE'),
    WED: t('transport.dayTypes.WED'),
    THU: t('transport.dayTypes.THU'),
    FRI: t('transport.dayTypes.FRI'),
    SAT: t('transport.dayTypes.SAT'),
    SUN: t('transport.dayTypes.SUN'),
    PRAZNIK: t('transport.dayTypes.PRAZNIK'),
  };

  const [lineDetail, setLineDetail] = useState<LineDetailResponse | null>(null);
  const [departures, setDepartures] = useState<DeparturesListResponse | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getTodayString());
  const [selectedDirection, setSelectedDirection] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [departuresLoading, setDeparturesLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch line detail
  const fetchLineDetail = useCallback(async () => {
    setError(null);
    try {
      const detail = await transportApi.getLine(transportType, lineId);
      setLineDetail(detail);
    } catch (err) {
      console.error('[LineDetail] Error fetching line:', err);
      setError(t('transport.lineDetail.error'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [lineId, transportType]);

  // Fetch departures for selected date and direction
  const fetchDepartures = useCallback(async () => {
    setDeparturesLoading(true);
    try {
      const deps = await transportApi.getDepartures(
        transportType,
        lineId,
        selectedDate,
        selectedDirection
      );
      setDepartures(deps);
    } catch (err) {
      console.error('[LineDetail] Error fetching departures:', err);
      // Don't set error - just show empty departures
    } finally {
      setDeparturesLoading(false);
    }
  }, [lineId, transportType, selectedDate, selectedDirection]);

  useEffect(() => {
    void fetchLineDetail();
  }, [fetchLineDetail]);

  useEffect(() => {
    if (lineDetail) {
      void fetchDepartures();
    }
  }, [lineDetail, fetchDepartures]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchLineDetail();
  }, [fetchLineDetail]);

  // Get routes for direction toggle
  const routes: RouteInfo[] = lineDetail?.routes || [];
  const currentRoute = routes.find((r) => r.direction === selectedDirection);

  // Date navigation
  const adjustDate = (days: number) => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + days);
    setSelectedDate(formatDateString(date));
  };

  const handlePhonePress = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handleEmailPress = (email: string) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleWebsitePress = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !lineDetail) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error || t('transport.lineDetail.notFound')}</Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
            <Text style={styles.retryText}>{t('common.retry')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <GlobalHeader type="child" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Line Header */}
        <View style={styles.headerSection}>
          <Text style={styles.lineName}>{lineDetail.name}</Text>
          {lineDetail.subtype && (
            <View style={styles.subtypeBadge}>
              <Text style={styles.subtypeText}>{lineDetail.subtype}</Text>
            </View>
          )}
        </View>

        {/* Date Selector */}
        <View style={styles.dateSection}>
          <TouchableOpacity
            style={styles.dateArrow}
            onPress={() => adjustDate(-1)}
          >
            <Text style={styles.dateArrowText}>{'<'}</Text>
          </TouchableOpacity>
          <View style={styles.dateInfo}>
            <Text style={styles.dateText}>{formatDisplayDate(selectedDate)}</Text>
            {departures && (
              <Text style={styles.dayTypeText}>
                {DAY_TYPE_LABELS[departures.day_type]}
                {departures.is_holiday && ` (${t('transport.holiday')})`}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.dateArrow}
            onPress={() => adjustDate(1)}
          >
            <Text style={styles.dateArrowText}>{'>'}</Text>
          </TouchableOpacity>
        </View>

        {/* Direction Toggle */}
        {routes.length > 1 && (
          <View style={styles.directionSection}>
            {routes.map((route) => (
              <TouchableOpacity
                key={route.id}
                style={[
                  styles.directionButton,
                  selectedDirection === route.direction && styles.directionButtonActive,
                ]}
                onPress={() => setSelectedDirection(route.direction)}
              >
                <Text
                  style={[
                    styles.directionText,
                    selectedDirection === route.direction && styles.directionTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {route.direction_label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Route Info */}
        {currentRoute && (
          <View style={styles.routeInfo}>
            <Text style={styles.routeLabel}>
              {currentRoute.origin} → {currentRoute.destination}
            </Text>
            {currentRoute.typical_duration_minutes && (
              <Text style={styles.routeDuration}>
                Trajanje: {formatDuration(currentRoute.typical_duration_minutes)}
              </Text>
            )}
          </View>
        )}

        {/* Departures */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Polasci</Text>
          {departuresLoading ? (
            <View style={styles.departuresLoading}>
              <ActivityIndicator size="small" color="#666666" />
            </View>
          ) : departures && departures.departures.length > 0 ? (
            departures.departures.map((dep) => (
              <DepartureItem key={dep.id} departure={dep} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nema polazaka za odabrani dan
              </Text>
            </View>
          )}
        </View>

        {/* Contacts */}
        {lineDetail.contacts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Kontakt</Text>
            {lineDetail.contacts.map((contact, index) => (
              <View key={`${contact.operator}-${index}`} style={styles.contactCard}>
                <Text style={styles.contactOperator}>{contact.operator}</Text>
                {contact.phone && (
                  <TouchableOpacity
                    style={styles.contactRow}
                    onPress={() => handlePhonePress(contact.phone!)}
                  >
                    <Text style={styles.contactLabel}>Tel:</Text>
                    <Text style={styles.contactLink}>{contact.phone}</Text>
                  </TouchableOpacity>
                )}
                {contact.email && (
                  <TouchableOpacity
                    style={styles.contactRow}
                    onPress={() => handleEmailPress(contact.email!)}
                  >
                    <Text style={styles.contactLabel}>Email:</Text>
                    <Text style={styles.contactLink}>{contact.email}</Text>
                  </TouchableOpacity>
                )}
                {contact.website && (
                  <TouchableOpacity
                    style={styles.contactRow}
                    onPress={() => handleWebsitePress(contact.website!)}
                  >
                    <Text style={styles.contactLabel}>Web:</Text>
                    <Text style={styles.contactLink}>{contact.website}</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

// Helper functions
function getTodayString(): string {
  const today = new Date();
  return formatDateString(today);
}

function formatDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateString: string): string {
  const date = new Date(dateString);
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${day}.${month}.${year}.`;
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#856404',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#000000',
    borderRadius: 8,
  },
  retryText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  headerSection: {
    padding: 16,
    paddingBottom: 8,
  },
  lineName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  subtypeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 4,
  },
  subtypeText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    borderRadius: 8,
  },
  dateArrow: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateArrowText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000000',
  },
  dateInfo: {
    flex: 1,
    alignItems: 'center',
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  dayTypeText: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
  directionSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    gap: 8,
  },
  directionButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  directionButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  directionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666666',
    textAlign: 'center',
  },
  directionTextActive: {
    color: '#FFFFFF',
  },
  routeInfo: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  routeLabel: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  routeDuration: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  section: {
    padding: 16,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  departuresLoading: {
    padding: 24,
    alignItems: 'center',
  },
  emptyState: {
    padding: 24,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666666',
  },
  contactCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  contactOperator: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  contactRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  contactLabel: {
    fontSize: 14,
    color: '#666666',
    width: 50,
  },
  contactLink: {
    flex: 1,
    fontSize: 14,
    color: '#0066CC',
    textDecorationLine: 'underline',
  },
});

export default LineDetailScreen;
