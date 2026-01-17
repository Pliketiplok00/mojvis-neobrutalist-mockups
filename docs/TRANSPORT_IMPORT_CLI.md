# Transport Import CLI

Safe, transactional transport data import tool for the MOJ VIS backend.

## Overview

The Transport Import CLI allows updating transport line data without affecting other lines. It provides:

- **Transactional imports**: All-or-nothing operations (rollback on failure)
- **Per-line isolation**: Importing line A never affects line B
- **Dry-run mode**: Preview changes without writing to database
- **Pre-flight validation**: Catches errors before any database changes

## Command Usage

```bash
pnpm --dir backend transport:import [OPTIONS]
```

### Options

| Option | Description |
|--------|-------------|
| `--lineId <ID>` | Import a specific line by its seed ID |
| `--file <path>` | Path to a line JSON file (single line definition) |
| `--dir <path>` | Path to directory containing line JSON files |
| `--all` | Import all lines from the directory |
| `--dry-run` | Validate and preview changes without writing to DB |
| `--help, -h` | Show help message |

## Examples

### Import a single line from a file

```bash
pnpm --dir backend transport:import --lineId line-602 --file backend/src/data/seed/lines/line-602.json
```

### Dry-run to preview changes

```bash
pnpm --dir backend transport:import --lineId line-602 --file backend/src/data/seed/lines/line-602.json --dry-run
```

### Import a line from a directory (auto-find by lineId)

```bash
pnpm --dir backend transport:import --lineId line-602 --dir backend/src/data/seed/lines
```

### Import all lines from a directory

```bash
pnpm --dir backend transport:import --all --dir backend/src/data/seed/lines
```

## Line File Format

The CLI accepts two JSON formats:

### Format 1: Full Seed Format (recommended)

Contains stops, seasons, and lines in one file:

```json
{
  "stops": [
    {
      "id": "stop-split",
      "name_hr": "Split",
      "name_en": "Split",
      "transport_type": "sea",
      "latitude": 43.5081,
      "longitude": 16.4402
    }
  ],
  "seasons": [
    {
      "id": "season-2026-off",
      "season_type": "OFF",
      "year": 2026,
      "date_from": "2026-01-01",
      "date_to": "2026-05-28",
      "label_hr": "Izvan sezone",
      "label_en": "Off season"
    }
  ],
  "lines": [
    {
      "id": "line-split-vis",
      "transport_type": "sea",
      "name_hr": "Split - Vis",
      "name_en": "Split - Vis",
      "display_order": 1,
      "contacts": [...],
      "routes": [...]
    }
  ]
}
```

### Format 2: Single Line Format

Just the line object (stops and seasons must exist in DB):

```json
{
  "id": "line-split-vis",
  "transport_type": "sea",
  "name_hr": "Split - Vis",
  "name_en": "Split - Vis",
  "display_order": 1,
  "contacts": [...],
  "routes": [...]
}
```

## Recommended Directory Layout

```
backend/src/data/seed/
├── transport-seed.json        # Original bulk seed file
└── lines/
    ├── line-split-vis.json    # Per-line files for updates
    ├── line-602.json
    └── line-hvar-korcula.json
```

## Replace Semantics

When importing a line that already exists:

1. **All existing data for that line is deleted** (routes, departures, contacts)
2. **New data from the import file is inserted**
3. **Other lines remain completely unchanged**

This means:
- Importing the same `lineId` twice results in only the second version
- There's no merge or patch - it's a full replacement
- Stops and seasons are **upserted** (created if new, updated if existing)

## Safety Features

### Transactionality

Every import operation runs inside a database transaction:

```
BEGIN TRANSACTION
  → Validate input
  → Upsert stops
  → Upsert seasons
  → Delete existing line (if any)
  → Insert new line data
COMMIT

If ANY step fails:
  → ROLLBACK (database unchanged)
```

### Pre-flight Validation

Before any database changes, the CLI validates:

- Line ID and transport type are valid
- All routes have valid direction (0 or 1)
- All stops are referenced by valid IDs
- All departures reference valid seasons
- `stop_times` length matches route stop count
- Date formats are valid (YYYY-MM-DD)
- Time formats are valid (HH:MM)

### Dry-Run Mode

Use `--dry-run` to:
- Parse and validate input
- Check for existing data in DB
- Generate a summary of intended changes
- **Make no actual changes**

Example dry-run output:

```
MODE: DRY-RUN (no changes will be made)

Processing: line-602 (Trajekt 602 Vis - Split)
----------------------------------------
Validating...
Validation passed
Generating summary...

Summary for line-602:
  Action: REPLACE
  Line: Trajekt 602 Vis - Split
  Routes: 2
  Departures: 30
  Stops referenced: 2
  Would delete: 2 routes, 30 departures, 1 contacts

DRY-RUN complete. No changes made.
```

## ID Mapping

The CLI uses **deterministic UUID generation** from seed IDs:

- Seed ID `line-602` always maps to the same UUID
- This enables reliable per-line replacement
- UUIDs are generated using UUID v5 (SHA-1 based)

## Error Handling

| Scenario | Behavior |
|----------|----------|
| File not found | Exit with error |
| Invalid JSON | Exit with error |
| Validation failure | Exit with error (no DB changes) |
| DB error during import | Rollback transaction, exit with error |
| Missing referenced stop | Validation error (provide in file or ensure in DB) |
| Missing referenced season | Validation error (provide in file or ensure in DB) |

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_NAME` | mojvis | Database name |
| `DB_USER` | postgres | Database user |
| `DB_PASSWORD` | postgres | Database password |

## Comparison with Seed Script

| Feature | `seed-transport.ts` | `transport-import.ts` |
|---------|---------------------|----------------------|
| Wipes all data | Yes (clearExistingData) | No (per-line only) |
| Transactional | No | Yes |
| Per-line update | No | Yes |
| Dry-run mode | No | Yes |
| Validation | Basic | Comprehensive |
| Use case | Initial setup | Incremental updates |

## Troubleshooting

### "Referenced stops not found"

The import file references stops that don't exist. Solutions:
1. Add the stops to the `stops` array in your import file
2. Ensure the stops exist in the database (imported previously)

### "Referenced seasons not found"

The import file has departures referencing seasons that don't exist. Solutions:
1. Add the seasons to the `seasons` array in your import file
2. Ensure the seasons exist in the database

### "Validation failed: stop_times length mismatch"

The `stop_times` array in a departure must have the same length as the route's `stops` array. Each departure must specify a time (or `null`) for every stop.
