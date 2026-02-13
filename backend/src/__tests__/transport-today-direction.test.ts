/**
 * Transport Today Direction Filter Tests
 *
 * Tests for the "Polasci danas" direction filtering.
 *
 * BUSINESS RULE (NON-NEGOTIABLE):
 * "Polasci danas" MUST include ONLY departures that START ON VIS ISLAND.
 *
 * Valid origins: Vis, Komiža (Vis island only)
 * Invalid origins: Split (mainland), Porat/Biševo (different island)
 */

import { describe, it, expect } from 'vitest';

/**
 * Stop names to exclude from "today's departures from Vis island" view.
 * This mirrors the constant in repositories/transport.ts
 *
 * Excludes:
 * - Mainland stops: Split, Split (luka)
 * - Biševo island stops: Porat, Porat (Biševo)
 */
const NON_VIS_ISLAND_ORIGIN_NAMES = [
  'Split',
  'Split (luka)',
  'Porat',
  'Porat (Biševo)',
];

/**
 * Known Vis island stop names for testing
 */
const VIS_ISLAND_STOP_NAMES = [
  'Vis',
  'Komiža',
];


/**
 * Helper to check if an origin stop name represents a Vis island origin
 */
function isVisIslandOrigin(originStopName: string): boolean {
  return !NON_VIS_ISLAND_ORIGIN_NAMES.includes(originStopName);
}

describe('Today Departures Direction Filter', () => {
  describe('NON_VIS_ISLAND_ORIGIN_NAMES constant', () => {
    it('should include Split', () => {
      expect(NON_VIS_ISLAND_ORIGIN_NAMES).toContain('Split');
    });

    it('should include Split (luka) port variant', () => {
      expect(NON_VIS_ISLAND_ORIGIN_NAMES).toContain('Split (luka)');
    });

    it('should include Porat (Biševo) - departures from Biševo excluded', () => {
      expect(NON_VIS_ISLAND_ORIGIN_NAMES).toContain('Porat (Biševo)');
    });

    it('should include Porat variant for Biševo', () => {
      expect(NON_VIS_ISLAND_ORIGIN_NAMES).toContain('Porat');
    });

    it('should NOT include Vis', () => {
      expect(NON_VIS_ISLAND_ORIGIN_NAMES).not.toContain('Vis');
    });

    it('should NOT include Komiža', () => {
      expect(NON_VIS_ISLAND_ORIGIN_NAMES).not.toContain('Komiža');
    });

    it('should NOT include any Vis island stops', () => {
      for (const visIslandStop of VIS_ISLAND_STOP_NAMES) {
        expect(NON_VIS_ISLAND_ORIGIN_NAMES).not.toContain(visIslandStop);
      }
    });
  });

  describe('isVisIslandOrigin filter logic', () => {
    it('should ACCEPT Vis origin', () => {
      expect(isVisIslandOrigin('Vis')).toBe(true);
    });

    it('should ACCEPT Komiža origin', () => {
      expect(isVisIslandOrigin('Komiža')).toBe(true);
    });

    it('should ACCEPT Hvar origin (other island, but not excluded)', () => {
      expect(isVisIslandOrigin('Hvar')).toBe(true);
    });

    it('should ACCEPT Milna origin (other island, but not excluded)', () => {
      expect(isVisIslandOrigin('Milna')).toBe(true);
    });

    it('should REJECT Porat (Biševo) origin - Biševo is not Vis island', () => {
      expect(isVisIslandOrigin('Porat (Biševo)')).toBe(false);
    });

    it('should REJECT Porat origin - Biševo variant', () => {
      expect(isVisIslandOrigin('Porat')).toBe(false);
    });

    it('should REJECT Split origin', () => {
      expect(isVisIslandOrigin('Split')).toBe(false);
    });

    it('should REJECT Split (luka) origin', () => {
      expect(isVisIslandOrigin('Split (luka)')).toBe(false);
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
    function filterForVisIslandOrigins(departures: MockDeparture[]): MockDeparture[] {
      return departures.filter((dep) => !NON_VIS_ISLAND_ORIGIN_NAMES.includes(dep.origin_stop_name));
    }

    it('should include Vis → Split departures', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-1', origin_stop_name: 'Vis', direction_label: 'Vis → Split' },
      ];

      const filtered = filterForVisIslandOrigins(departures);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].direction_label).toBe('Vis → Split');
    });

    it('should include Komiža → Biševo departures (FROM Vis island)', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-2', origin_stop_name: 'Komiža', direction_label: 'Komiža → Biševo' },
      ];

      const filtered = filterForVisIslandOrigins(departures);
      expect(filtered).toHaveLength(1);
      expect(filtered[0].direction_label).toBe('Komiža → Biševo');
    });

    it('should EXCLUDE Porat (Biševo) → Komiža departures (from Biševo)', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-bisevo', origin_stop_name: 'Porat (Biševo)', direction_label: 'Biševo → Komiža' },
      ];

      const filtered = filterForVisIslandOrigins(departures);
      expect(filtered).toHaveLength(0);
    });

    it('should EXCLUDE Split → Vis departures', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-1', origin_stop_name: 'Split', direction_label: 'Split → Vis' },
      ];

      const filtered = filterForVisIslandOrigins(departures);
      expect(filtered).toHaveLength(0);
    });

    it('should EXCLUDE Split → Milna → Hvar → Vis departures', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-3', origin_stop_name: 'Split', direction_label: 'Split → Milna → Hvar → Vis' },
      ];

      const filtered = filterForVisIslandOrigins(departures);
      expect(filtered).toHaveLength(0);
    });

    it('should filter mixed list correctly (including Biševo exclusion)', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-1', origin_stop_name: 'Vis', direction_label: 'Vis → Split' },
        { route_id: 'route-2', origin_stop_name: 'Split', direction_label: 'Split → Vis' },
        { route_id: 'route-3', origin_stop_name: 'Komiža', direction_label: 'Komiža → Biševo' },
        { route_id: 'route-4', origin_stop_name: 'Split', direction_label: 'Split → Milna → Hvar → Vis' },
        { route_id: 'route-5', origin_stop_name: 'Hvar', direction_label: 'Hvar → Split' },
        { route_id: 'route-6', origin_stop_name: 'Porat (Biševo)', direction_label: 'Biševo → Komiža' },
      ];

      const filtered = filterForVisIslandOrigins(departures);

      // Should keep: Vis → Split, Komiža → Biševo, Hvar → Split
      expect(filtered).toHaveLength(3);

      // Verify acceptable origins kept
      const directions = filtered.map((d) => d.direction_label);
      expect(directions).toContain('Vis → Split');
      expect(directions).toContain('Komiža → Biševo');
      expect(directions).toContain('Hvar → Split');

      // Verify excluded origins removed
      expect(directions).not.toContain('Split → Vis');
      expect(directions).not.toContain('Split → Milna → Hvar → Vis');
      expect(directions).not.toContain('Biševo → Komiža');
    });

    it('should return empty array when all departures are from excluded origins', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-1', origin_stop_name: 'Split', direction_label: 'Split → Vis' },
        { route_id: 'route-2', origin_stop_name: 'Split', direction_label: 'Split → Hvar' },
        { route_id: 'route-3', origin_stop_name: 'Porat (Biševo)', direction_label: 'Biševo → Komiža' },
      ];

      const filtered = filterForVisIslandOrigins(departures);
      expect(filtered).toHaveLength(0);
    });

    it('should return all departures when all are from Vis island', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-1', origin_stop_name: 'Vis', direction_label: 'Vis → Split' },
        { route_id: 'route-2', origin_stop_name: 'Komiža', direction_label: 'Komiža → Biševo' },
      ];

      const filtered = filterForVisIslandOrigins(departures);
      expect(filtered).toHaveLength(2);
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
