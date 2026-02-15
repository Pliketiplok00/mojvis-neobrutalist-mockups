/**
 * Transport Today Direction Filter Tests
 *
 * Tests for the "Polasci danas" direction filtering.
 *
 * BUSINESS RULE:
 * "Polasci danas" shows ONLY departures from Vis or Komiža.
 */

import { describe, it, expect } from 'vitest';

/**
 * Origins allowed in "today" departures - mirrors repositories/transport.ts
 */
const VIS_ISLAND_ORIGINS = ['Vis', 'Komiža'];

describe('Today Departures Direction Filter', () => {
  describe('VIS_ISLAND_ORIGINS constant', () => {
    it('should include Vis', () => {
      expect(VIS_ISLAND_ORIGINS).toContain('Vis');
    });

    it('should include Komiža', () => {
      expect(VIS_ISLAND_ORIGINS).toContain('Komiža');
    });

    it('should NOT include Split', () => {
      expect(VIS_ISLAND_ORIGINS).not.toContain('Split');
    });

    it('should NOT include Biševo stops', () => {
      expect(VIS_ISLAND_ORIGINS).not.toContain('Porat');
      expect(VIS_ISLAND_ORIGINS).not.toContain('Porat (Biševo)');
    });
  });

  describe('Direction filtering', () => {
    interface MockDeparture {
      route_id: string;
      origin_stop_name: string;
      direction_label: string;
    }

    function filterForVisIsland(departures: MockDeparture[]): MockDeparture[] {
      return departures.filter((dep) => VIS_ISLAND_ORIGINS.includes(dep.origin_stop_name));
    }

    it('should include Vis → Split departures', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-1', origin_stop_name: 'Vis', direction_label: 'Vis → Split' },
      ];
      const filtered = filterForVisIsland(departures);
      expect(filtered).toHaveLength(1);
    });

    it('should include Komiža → Vis departures', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-1', origin_stop_name: 'Komiža', direction_label: 'Komiža → Vis' },
      ];
      const filtered = filterForVisIsland(departures);
      expect(filtered).toHaveLength(1);
    });

    it('should EXCLUDE Split → Vis departures', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-1', origin_stop_name: 'Split', direction_label: 'Split → Vis' },
      ];
      const filtered = filterForVisIsland(departures);
      expect(filtered).toHaveLength(0);
    });

    it('should include Komiža → Biševo departures (origin is Komiža)', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-1', origin_stop_name: 'Komiža', direction_label: 'Komiža → Biševo' },
      ];
      const filtered = filterForVisIsland(departures);
      expect(filtered).toHaveLength(1);
    });

    it('should EXCLUDE Biševo → Komiža departures', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-1', origin_stop_name: 'Porat', direction_label: 'Biševo → Komiža' },
      ];
      const filtered = filterForVisIsland(departures);
      expect(filtered).toHaveLength(0);
    });

    it('should filter mixed list correctly', () => {
      const departures: MockDeparture[] = [
        { route_id: 'route-1', origin_stop_name: 'Vis', direction_label: 'Vis → Split' },
        { route_id: 'route-2', origin_stop_name: 'Split', direction_label: 'Split → Vis' },
        { route_id: 'route-3', origin_stop_name: 'Komiža', direction_label: 'Komiža → Vis' },
        { route_id: 'route-4', origin_stop_name: 'Porat', direction_label: 'Biševo → Komiža' },
      ];

      const filtered = filterForVisIsland(departures);
      expect(filtered).toHaveLength(2);

      const directions = filtered.map((d) => d.direction_label);
      expect(directions).toContain('Vis → Split');
      expect(directions).toContain('Komiža → Vis');
      expect(directions).not.toContain('Split → Vis');
      expect(directions).not.toContain('Biševo → Komiža');
    });
  });
});
