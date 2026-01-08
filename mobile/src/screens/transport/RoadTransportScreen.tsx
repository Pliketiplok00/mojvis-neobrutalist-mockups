/**
 * Road Transport Screen
 *
 * Shows road transport lines with active banners.
 * Phase 4: Full lines list with today's departures and contacts.
 *
 * Banner placement rules (per spec):
 * - ONLY cestovni_promet OR hitno tags
 * - NO opcenito, kultura, or municipal-only messages
 *
 * Sections:
 * - A: Lines list
 * - B: Today's departures (aggregated)
 * - C: (Contacts shown in line detail)
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { GlobalHeader } from '../../components/GlobalHeader';
import { BannerList } from '../../components/Banner';
import { inboxApi, transportApi } from '../../services/api';
import type { InboxMessage } from '../../types/inbox';
import type { LineListItem, TodayDepartureItem, DayType } from '../../types/transport';
import type { MainStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

const DAY_TYPE_LABELS: Record<DayType, string> = {
  MON: 'Ponedjeljak',
  TUE: 'Utorak',
  WED: 'Srijeda',
  THU: 'Cetvrtak',
  FRI: 'Petak',
  SAT: 'Subota',
  SUN: 'Nedjelja',
  PRAZNIK: 'Praznik',
};

export function RoadTransportScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp>();
  const [banners, setBanners] = useState<InboxMessage[]>([]);
  const [lines, setLines] = useState<LineListItem[]>([]);
  const [todaysDepartures, setTodaysDepartures] = useState<TodayDepartureItem[]>([]);
  const [dayType, setDayType] = useState<DayType | null>(null);
  const [isHoliday, setIsHoliday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // TODO: Get from user context
  const userContext = { userMode: 'visitor' as const, municipality: null };

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const [bannersRes, linesRes, todayRes] = await Promise.all([
        inboxApi.getActiveBanners(userContext, 'transport_road'),
        transportApi.getLines('road'),
        transportApi.getTodaysDepartures('road'),
      ]);

      setBanners(bannersRes.banners);
      setLines(linesRes.lines);
      setTodaysDepartures(todayRes.departures);
      setDayType(todayRes.day_type);
      setIsHoliday(todayRes.is_holiday);
    } catch (err) {
      console.error('[RoadTransport] Error fetching data:', err);
      setError('Greska pri ucitavanju podataka');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void fetchData();
  }, [fetchData]);

  const handleLinePress = (lineId: string) => {
    navigation.navigate('RoadLineDetail', { lineId });
  };

  const formatDuration = (minutes: number | null): string => {
    if (!minutes) return '';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <GlobalHeader type="child" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#000000" />
          <Text style={styles.loadingText}>Ucitavanje...</Text>
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
        {/* Banners */}
        {banners.length > 0 && (
          <View style={styles.bannerSection}>
            <BannerList banners={banners} />
          </View>
        )}

        {/* Title */}
        <View style={styles.titleSection}>
          <Text style={styles.title}>Cestovni promet</Text>
          {dayType && (
            <Text style={styles.dayInfo}>
              {DAY_TYPE_LABELS[dayType]}
              {isHoliday && ' (blagdan)'}
            </Text>
          )}
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={handleRefresh} style={styles.retryButton}>
              <Text style={styles.retryText}>Pokusaj ponovo</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Section A: Lines List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Linije</Text>
          {lines.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nema dostupnih linija</Text>
            </View>
          ) : (
            lines.map((line) => (
              <TouchableOpacity
                key={line.id}
                style={styles.lineCard}
                onPress={() => handleLinePress(line.id)}
                activeOpacity={0.7}
              >
                <View style={styles.lineHeader}>
                  <Text style={styles.lineName} numberOfLines={2}>
                    {line.name}
                  </Text>
                  {line.subtype && (
                    <View style={styles.subtypeBadge}>
                      <Text style={styles.subtypeText}>{line.subtype}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.lineStops} numberOfLines={1}>
                  {line.stops_summary}
                </Text>
                <View style={styles.lineFooter}>
                  <Text style={styles.lineInfo}>
                    {line.stops_count} stanica
                    {line.typical_duration_minutes
                      ? ` • ${formatDuration(line.typical_duration_minutes)}`
                      : ''}
                  </Text>
                  <Text style={styles.chevron}>{'>'}</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Section B: Today's Departures */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Polasci danas</Text>
          {todaysDepartures.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nema polazaka danas</Text>
            </View>
          ) : (
            todaysDepartures.slice(0, 10).map((dep, index) => (
              <TouchableOpacity
                key={`${dep.line_id}-${dep.departure_time}-${index}`}
                style={styles.departureCard}
                onPress={() => handleLinePress(dep.line_id)}
                activeOpacity={0.7}
              >
                <Text style={styles.departureTime}>{dep.departure_time}</Text>
                <View style={styles.departureInfo}>
                  <Text style={styles.departureLine} numberOfLines={1}>
                    {dep.line_name}
                  </Text>
                  <Text style={styles.departureDirection} numberOfLines={1}>
                    {dep.direction_label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
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
  bannerSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  titleSection: {
    padding: 16,
    paddingBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
  },
  dayInfo: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  section: {
    padding: 16,
    paddingTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  errorContainer: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFF3CD',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    color: '#856404',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#000000',
    borderRadius: 4,
  },
  retryText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
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
  lineCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#000000',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  lineHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  lineName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginRight: 8,
  },
  subtypeBadge: {
    backgroundColor: '#E0E0E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  subtypeText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '500',
  },
  lineStops: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 8,
  },
  lineFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lineInfo: {
    fontSize: 12,
    color: '#888888',
  },
  chevron: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
  },
  departureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  departureTime: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    width: 60,
  },
  departureInfo: {
    flex: 1,
    marginLeft: 12,
  },
  departureLine: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
  },
  departureDirection: {
    fontSize: 12,
    color: '#666666',
    marginTop: 2,
  },
});

export default RoadTransportScreen;
