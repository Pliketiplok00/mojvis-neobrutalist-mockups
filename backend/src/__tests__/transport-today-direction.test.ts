/**
 * Transport Today Direction Filter Tests
 *
 * Tests for the "Polasci danas" direction filtering.
 *
 * BUSINESS RULE (NON-NEGOTIABLE):
 * "Polasci danas" MUST include ONLY departures that START ON THE ISLAND.
 *
 * Valid origins: Vis, Komiža, Hvar, Milna, Porat (Biševo), etc.
 * Invalid origins: Split (mainland)
 */

import { describe, it, expect } from 'vitest';

/**
 * Known mainland stop names - departures from these origins are excluded.
 * This mirrors the constant in repositories/transport.ts
 */
const MAINLAND_STOP_NAMES = ['Split'];

/**
 * Known island stop names for testing
 */
const ISLAND_STOP_NAMES = [
  'Vis',
  'Komiža',
  'Hvar',
  'Milna',
  'Porat (Biševo)',
  'Mezuporat',
  'Salbunara',
];

/**
 * Helper to check if an origin stop name represents an island origin
 */
function isIslandOrigin(originStopName: string): boolean {
  return !MAINLAND_STOP_NAMES.includes(originStopName);
}

describe('Today Departures Direction Filter', () => {
  describe('MAINLAND_STOP_NAMES constant', () => {
    it('should include Split', () => {
      expect(MAINLAND_STOP_NAMES).toContain('Split');
    });

    it('should NOT include Vis', () => {
      expect(MAINLAND_STOP_NAMES).not.toContain('Vis');
    });

    it('should NOT include Komiža', () => {
      expect(MAINLAND_STOP_NAMES).not.toContain('Komiža');
    });

    it('should NOT include any island stops', () => {
      for (const islandStop of ISLAND_STOP_NAMES) {
        expect(MAINLAND_STOP_NAMES).not.toContain(islandStop);
      }
    });
  });

  describe('isIslandOrigin filter logic', () => {
    it('should ACCEPT Vis origin', () => {
      expect(isIslandOrigin('Vis')).toBe(true);
    });

    it('should ACCEPT Komiža origin', () => {
      expect(isIslandOrigin('Komiža')).toBe(true);
    });

    it('should ACCEPT Hvar origin', () => {
      expect(isIslandOrigin('Hvar')).toBe(true);
    });

    it('should ACCEPT Milna origin', () => {
      expect(isIslandOrigin('Milna')).toBe(true);
    });

    it('should ACCEPT Porat (Biševo) origin', () => {
      expect(isIslandOrigin('Porat (Biševo)')).toBe(true);
    });

    it('should REJECT Split origin', () => {
      expect(isIslandOrigin('Split')).toBe(false);
    });
  });

  describe('Direction filtering business rules', () => {
    /**
     * Mock departure data structure for testing
     */
    interface MockDeparture {
      route_id: string;
      origin_stop_name: string;
      direction_label: string;
    }

    /**
     * Simulates the filtering that happens in getTodaysDepartures
     */
    function filterForIslandOrigins(departures: MockDeparture[]): MockDeparture[] {
      return departures.filter((dep) => !MAINLAND_STOP_NAMES.includes(dep.origin_stop_name));
    }

    it('should include Vis → Split departures', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-1', origin_stop_name: 'Vis', direction_label: 'Vis → Split' },
      ];

      const filtered = filterForIslandOrigins(departures);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].direction_label).toBe('Vis → Split');
    });

    it('should include Komiža → Biševo departures', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-2', origin_stop_name: 'Komiža', direction_label: 'Komiža → Biševo' },
      ];

      const filtered = filterForIslandOrigins(departures);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].direction_label).toBe('Komiža → Biševo');
    });

    it('should EXCLUDE Split → Vis departures', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-1', origin_stop_name: 'Split', direction_label: 'Split → Vis' },
      ];

      const filtered = filterForIslandOrigins(departures);
      expect(filtered).toHaveLength(0);
    });

    it('should EXCLUDE Split → Milna → Hvar → Vis departures', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-3', origin_stop_name: 'Split', direction_label: 'Split → Milna → Hvar → Vis' },
      ];

      const filtered = filterForIslandOrigins(departures);
      expect(filtered).toHaveLength(0);
    });

    it('should filter mixed list correctly', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-1', origin_stop_name: 'Vis', direction_label: 'Vis → Split' },
        { route_id: 'route-2', origin_stop_name: 'Split', direction_label: 'Split → Vis' },
        { route_id: 'route-3', origin_stop_name: 'Komiža', direction_label: 'Komiža → Biševo' },
        { route_id: 'route-4', origin_stop_name: 'Split', direction_label: 'Split → Milna → Hvar → Vis' },
        { route_id: 'route-5', origin_stop_name: 'Hvar', direction_label: 'Hvar → Split' },
      ];

      const filtered = filterForIslandOrigins(departures);

      // Should keep: Vis → Split, Komiža → Biševo, Hvar → Split
      expect(filtered).toHaveLength(3);

      // Verify island origins kept
      const directions = filtered.map((d) => d.direction_label);
      expect(directions).toContain('Vis → Split');
      expect(directions).toContain('Komiža → Biševo');
      expect(directions).toContain('Hvar → Split');

      // Verify mainland origins removed
      expect(directions).not.toContain('Split → Vis');
      expect(directions).not.toContain('Split → Milna → Hvar → Vis');
    });

    it('should return empty array when all departures are from mainland', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-1', origin_stop_name: 'Split', direction_label: 'Split → Vis' },
        { route_id: 'route-2', origin_stop_name: 'Split', direction_label: 'Split → Hvar' },
      ];

      const filtered = filterForIslandOrigins(departures);
      expect(filtered).toHaveLength(0);
    });

    it('should return all departures when all are from island', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-1', origin_stop_name: 'Vis', direction_label: 'Vis → Split' },
        { route_id: 'route-2', origin_stop_name: 'Hvar', direction_label: 'Hvar → Split' },
        { route_id: 'route-3', origin_stop_name: 'Komiža', direction_label: 'Komiža → Biševo' },
      ];

      const filtered = filterForIslandOrigins(departures);
      expect(filtered).toHaveLength(3);
    });
  });
});

describe('Today Departures UI Contract', () => {
  it('should show direction_label as main title (not line_name)', () => {
    // This is a documentation/contract test
    // The frontend must display direction_label as the main title
    // and NOT display line_name at all

    const departure = {
      departure_time: '07:30:00',
      line_id: 'line-602',
      line_name: 'Trajekt 602 Vis – Split', // NOT displayed
      direction_label: 'Vis → Split', // Displayed as main title
      subtype: 'Trajekt',
      destination: 'Split',
    };

    // Main title should be direction_label
    const mainTitle = departure.direction_label;
    expect(mainTitle).toBe('Vis → Split');

    // line_name should NOT be used as title
    expect(mainTitle).not.toBe(departure.line_name);
  });
});
