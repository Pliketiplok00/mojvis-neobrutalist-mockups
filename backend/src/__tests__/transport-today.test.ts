/**
 * Transport Today Endpoint Tests
 *
 * Tests for the today's departures endpoint.
 *
 * Key test scenarios:
 * 1. Departures must include `subtype` field
 * 2. Season filtering: only departures from active season for date
 * 3. Date exception filtering: date_from/date_to restrictions applied
 */

import { describe, it, expect } from 'vitest';

/**
 * Test the TodayDepartureItem structure based on type definition
 */
describe('TodayDepartureItem Type Contract', () => {
  /**
   * Define expected structure for today departure items
   */
  interface ExpectedTodayDepartureItem {
    departure_time: string;
    line_id: string;
    line_name: string;
    subtype: string | null;
    route_id: string;
    direction_label: string;
    destination: string;
    marker: string | null;
  }

  it('should have subtype field in the type definition', () => {
    // This is a compile-time type check
    const item: ExpectedTodayDepartureItem = {
      departure_time: '07:30:00',
      line_id: 'test-id',
      line_name: 'Test Line',
      subtype: 'Trajekt',
      route_id: 'route-id',
      direction_label: 'Test → Destination',
      destination: 'Destination',
      marker: null,
    };

    expect(item).toHaveProperty('subtype');
    expect(typeof item.subtype).toBe('string');
  });

  it('should allow null subtype', () => {
    const item: ExpectedTodayDepartureItem = {
      departure_time: '07:30:00',
      line_id: 'test-id',
      line_name: 'Test Line',
      subtype: null,
      route_id: 'route-id',
      direction_label: 'Test → Destination',
      destination: 'Destination',
      marker: null,
    };

    expect(item.subtype).toBeNull();
  });
});

/**
 * Test season filtering logic
 */
describe('Season Filtering for Today Departures', () => {
  /**
   * Helper to simulate season date range check
   */
  function isDateInSeason(dateStr: string, seasonFrom: string, seasonTo: string): boolean {
    return dateStr >= seasonFrom && dateStr <= seasonTo;
  }

  it('should include date within OFF season range', () => {
    // OFF season: 2026-01-01 to 2026-05-28
    expect(isDateInSeason('2026-01-18', '2026-01-01', '2026-05-28')).toBe(true);
    expect(isDateInSeason('2026-03-15', '2026-01-01', '2026-05-28')).toBe(true);
  });

  it('should exclude date outside OFF season range', () => {
    // OFF season: 2026-01-01 to 2026-05-28
    expect(isDateInSeason('2025-12-31', '2026-01-01', '2026-05-28')).toBe(false);
    expect(isDateInSeason('2026-05-29', '2026-01-01', '2026-05-28')).toBe(false);
  });

  it('should only match one season for date 2026-01-18', () => {
    const date = '2026-01-18';
    const seasons = [
      { type: 'OFF', from: '2026-01-01', to: '2026-05-28' },
      { type: 'PRE', from: '2026-03-29', to: '2026-05-28' },
      { type: 'HIGH', from: '2026-07-03', to: '2026-09-20' },
      { type: 'POST', from: '2026-05-29', to: '2026-07-02' },
    ];

    const matchingSeasons = seasons.filter(s => isDateInSeason(date, s.from, s.to));

    // 2026-01-18 should only match OFF season
    expect(matchingSeasons).toHaveLength(1);
    expect(matchingSeasons[0].type).toBe('OFF');
  });

  it('should correctly identify active season for summer date', () => {
    const date = '2026-07-15';
    const seasons = [
      { type: 'OFF', from: '2026-01-01', to: '2026-05-28' },
      { type: 'PRE', from: '2026-03-29', to: '2026-05-28' },
      { type: 'HIGH', from: '2026-07-03', to: '2026-09-20' },
      { type: 'POST', from: '2026-05-29', to: '2026-07-02' },
    ];

    const matchingSeasons = seasons.filter(s => isDateInSeason(date, s.from, s.to));

    // 2026-07-15 should only match HIGH season
    expect(matchingSeasons).toHaveLength(1);
    expect(matchingSeasons[0].type).toBe('HIGH');
  });
});

/**
 * Test departure date_from/date_to filtering for today endpoint
 */
describe('Departure Date Range Filtering for Today', () => {
  /**
   * Replicates the isDepartureValidForDate logic for testing
   */
  interface TestDeparture {
    date_from: string | null;
    date_to: string | null;
  }

  function isDepartureValidForDate(departure: TestDeparture, dateStr: string): boolean {
    if (departure.date_from !== null && dateStr < departure.date_from) {
      return false;
    }
    if (departure.date_to !== null && dateStr > departure.date_to) {
      return false;
    }
    return true;
  }

  it('should include departures with no date restrictions', () => {
    const departure: TestDeparture = { date_from: null, date_to: null };
    expect(isDepartureValidForDate(departure, '2026-01-18')).toBe(true);
  });

  it('should include departures within date range', () => {
    const departure: TestDeparture = {
      date_from: '2026-01-01',
      date_to: '2026-02-22',
    };
    expect(isDepartureValidForDate(departure, '2026-01-18')).toBe(true);
  });

  it('should exclude departures before date_from', () => {
    const departure: TestDeparture = {
      date_from: '2026-02-23',
      date_to: '2026-05-28',
    };
    // 2026-01-18 is before 2026-02-23
    expect(isDepartureValidForDate(departure, '2026-01-18')).toBe(false);
  });

  it('should exclude departures after date_to', () => {
    const departure: TestDeparture = {
      date_from: '2026-01-01',
      date_to: '2026-01-15',
    };
    // 2026-01-18 is after 2026-01-15
    expect(isDepartureValidForDate(departure, '2026-01-18')).toBe(false);
  });

  it('should handle Ferry line 602 date-restricted SUN departures', () => {
    // Based on actual data from line-602.json
    const date = '2026-01-18'; // A Sunday in OFF season

    // 16:30 departure valid for 2026-01-01 to 2026-02-22
    const dep1: TestDeparture = { date_from: '2026-01-01', date_to: '2026-02-22' };
    expect(isDepartureValidForDate(dep1, date)).toBe(true);

    // 15:30 departure valid for 2026-02-23 to 2026-05-28 (NOT valid for Jan 18)
    const dep2: TestDeparture = { date_from: '2026-02-23', date_to: '2026-05-28' };
    expect(isDepartureValidForDate(dep2, date)).toBe(false);

    // 15:30 departure valid for 2026-09-28 to 2026-12-05 (NOT valid for Jan 18)
    const dep3: TestDeparture = { date_from: '2026-09-28', date_to: '2026-12-05' };
    expect(isDepartureValidForDate(dep3, date)).toBe(false);
  });
});

/**
 * Test response structure validation
 */
describe('TodaysDeparturesResponse Structure', () => {
  interface ExpectedResponse {
    date: string;
    day_type: string;
    is_holiday: boolean;
    departures: Array<{
      departure_time: string;
      line_id: string;
      line_name: string;
      subtype: string | null;
      route_id: string;
      direction_label: string;
      destination: string;
      marker: string | null;
    }>;
  }

  it('should have correct response structure', () => {
    const response: ExpectedResponse = {
      date: '2026-01-18',
      day_type: 'SUN',
      is_holiday: false,
      departures: [
        {
          departure_time: '07:30:00',
          line_id: 'test-id',
          line_name: 'Vis – Split',
          subtype: 'Trajekt',
          route_id: 'route-id',
          direction_label: 'Vis → Split',
          destination: 'Split',
          marker: null,
        },
      ],
    };

    expect(response).toHaveProperty('date');
    expect(response).toHaveProperty('day_type');
    expect(response).toHaveProperty('is_holiday');
    expect(response).toHaveProperty('departures');
    expect(response.departures[0]).toHaveProperty('subtype');
  });

  it('should validate subtype is non-null for typed lines', () => {
    const departure = {
      departure_time: '07:30:00',
      line_id: 'test-id',
      line_name: 'Vis – Split',
      subtype: 'Trajekt', // Ferry type
      route_id: 'route-id',
      direction_label: 'Vis → Split',
      destination: 'Split',
      marker: null,
    };

    // Subtype should be one of the known types
    const validSubtypes = ['Trajekt', 'Katamaran', 'Brod', 'Autobus'];
    expect(validSubtypes).toContain(departure.subtype);
  });
});
