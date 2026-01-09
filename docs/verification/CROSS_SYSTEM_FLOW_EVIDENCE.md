# Cross-System Flow Verification Evidence

**Branch:** `audit/cross-system-flows`
**Date:** 2026-01-09
**Backend URL:** http://localhost:3000

---

## Test Entity Registry

| Entity Type | ID | Notes |
|-------------|-----|-------|
| Inbox Message | `098febd9-878f-4fbf-84d2-1ee8847781c1` | Flow 1 test message |
| Feedback | `b01ebeb1-df77-4356-a66e-7b981428a1f2` | Flow 2 test feedback |
| Click-Fix | `59c94496-9c29-435a-bb10-0f6c73f6bf01` | Flow 3 test issue |
| Event | `e33b3396-7271-4f09-8de4-ad3e7691dc14` | Flow 4/6 test event |
| Static Page | `2b44a0b4-5394-41e4-97fc-c199bfaf9cd1` | Flow 5 fauna page |
| Block | `4b228ae7-a3f6-4f5e-b869-ee4b8e3bd659` | Flow 5 test block |
| Reminder | `ad241a65-d461-4c81-ba50-b11cbdde9bb8` | Flow 6 generated reminder |

---

## Flow 1: Inbox/Banner Evidence

### Create Message

```bash
curl -X POST http://localhost:3000/admin/inbox \
  -H "Content-Type: application/json" \
  -d '{
    "title_hr": "CROSS-FLOW-TEST-1736459779",
    "title_en": "Cross Flow Test EN",
    "body_hr": "Ovo je test poruka za provjeru cross-system flow-a",
    "body_en": "This is a test message for cross-system flow verification",
    "tags": ["hitno", "promet"],
    "active_from": "2026-01-09T00:00:00Z",
    "active_to": "2026-01-11T00:00:00Z"
  }'
```

**Response:**
```json
{
  "id": "098febd9-878f-4fbf-84d2-1ee8847781c1",
  "title_hr": "CROSS-FLOW-TEST-1736459779",
  "tags": ["hitno", "promet"],
  "is_urgent": true,
  "is_locked": false
}
```

### Banner Check

```bash
curl "http://localhost:3000/banners/active?context=transport&language=hr&user_mode=visitor"
```

**Response (excerpt):**
```json
{
  "banners": [
    {
      "id": "098febd9-878f-4fbf-84d2-1ee8847781c1",
      "title": "CROSS-FLOW-TEST-1736459779",
      "is_urgent": true
    }
  ]
}
```

---

## Flow 2: Feedback Evidence

### Submit Feedback

```bash
curl -X POST http://localhost:3000/feedback \
  -H "Content-Type: application/json" \
  -H "X-Device-ID: test-device-flow2-1767995833" \
  -d '{
    "subject": "CROSS-FLOW-TEST: Feedback submission",
    "body": "Testing feedback flow from mobile to admin",
    "municipality": "vis",
    "language": "hr",
    "user_mode": "local"
  }'
```

**Response:**
```json
{
  "id": "b01ebeb1-df77-4356-a66e-7b981428a1f2",
  "message": "Vaša poruka je uspješno poslana."
}
```

### Update Status

```bash
curl -X PATCH http://localhost:3000/admin/feedback/b01ebeb1-df77-4356-a66e-7b981428a1f2/status \
  -H 'Content-Type: application/json' \
  -d '{"status":"u_razmatranju"}'
```

**Response:**
```json
{
  "status": "u_razmatranju",
  "status_label": "U razmatranju"
}
```

### Add Reply

```bash
curl -X POST http://localhost:3000/admin/feedback/b01ebeb1-df77-4356-a66e-7b981428a1f2/reply \
  -H 'Content-Type: application/json' \
  -d '{"body":"Hvala na povratnoj informaciji. Razmotrit cemo vas prijedlog."}'
```

**Response:**
```json
{
  "id": "02cf7fe3-8f9e-4a60-be4b-fb305dc43e45",
  "body": "Hvala na povratnoj informaciji. Razmotrit cemo vas prijedlog.",
  "created_at": "2026-01-09T21:58:25.078Z"
}
```

### Mobile Detail Check

```bash
curl http://localhost:3000/feedback/b01ebeb1-df77-4356-a66e-7b981428a1f2 \
  -H "X-Device-ID: test-device-flow2-1767995833"
```

**Response:**
```json
{
  "id": "b01ebeb1-df77-4356-a66e-7b981428a1f2",
  "subject": "CROSS-FLOW-TEST: Feedback submission",
  "status": "u_razmatranju",
  "status_label": "U razmatranju",
  "replies": [
    {
      "id": "02cf7fe3-8f9e-4a60-be4b-fb305dc43e45",
      "body": "Hvala na povratnoj informaciji. Razmotrit cemo vas prijedlog.",
      "created_at": "2026-01-09T21:58:25.078Z"
    }
  ]
}
```

---

## Flow 3: Click & Fix Evidence

### Submit Click-Fix

```bash
curl -X POST http://localhost:3000/click-fix \
  -H "X-Device-ID: test-device-flow3-1767995979" \
  -H "X-User-Mode: local" \
  -H "X-Municipality: vis" \
  -F "subject=CROSS-FLOW-TEST: Click-Fix prijava problema" \
  -F "description=Testiranje click-fix flow-a s lokacijom i slikom" \
  -F 'location={"lat":43.0612,"lng":16.1842}' \
  -F "photo0=@/tmp/test-image.png;type=image/png"
```

**Response:**
```json
{
  "id": "59c94496-9c29-435a-bb10-0f6c73f6bf01",
  "message": "Vaša prijava je uspješno poslana."
}
```

### Admin Detail

```bash
curl http://localhost:3000/admin/click-fix/59c94496-9c29-435a-bb10-0f6c73f6bf01
```

**Response:**
```json
{
  "id": "59c94496-9c29-435a-bb10-0f6c73f6bf01",
  "subject": "CROSS-FLOW-TEST: Click-Fix prijava problema",
  "location": {
    "lat": 43.0612,
    "lng": 16.1842
  },
  "photos": [
    {
      "id": "07114ede-a8b5-4fd6-ac6e-a05385af192b",
      "url": "/uploads/click-fix/05ef1661-3069-419e-b636-ff77ce8faea3.png",
      "file_name": "test-image.png"
    }
  ],
  "status": "u_razmatranju",
  "replies": [
    {
      "id": "eb23b23f-f06c-4960-bc60-76df372e1dae",
      "body": "Problem je zabilježen i proslijeđen nadležnoj službi."
    }
  ]
}
```

---

## Flow 4: Events Evidence

### Create Event

```bash
curl -X POST http://localhost:3000/admin/events \
  -H 'Content-Type: application/json' \
  -d '{
    "title_hr": "CROSS-FLOW-TEST: Testni dogadaj",
    "title_en": "CROSS-FLOW-TEST: Test event",
    "description_hr": "Opis testnog dogadaja za verifikaciju cross-system flow-a",
    "start_datetime": "2026-01-10T10:00:00Z",
    "end_datetime": "2026-01-10T18:00:00Z",
    "location_hr": "Trg, Vis",
    "is_all_day": false
  }'
```

**Response:**
```json
{
  "id": "e33b3396-7271-4f09-8de4-ad3e7691dc14",
  "title_hr": "CROSS-FLOW-TEST: Testni dogadaj",
  "start_datetime": "2026-01-10T10:00:00.000Z"
}
```

### Event Dates Check

```bash
curl 'http://localhost:3000/events/dates?year=2026&month=1'
```

**Response:**
```json
{
  "dates": ["2026-01-09", "2026-01-10", "2026-01-22"]
}
```

### Events For Date

```bash
curl 'http://localhost:3000/events?date=2026-01-10'
```

**Response:**
```json
{
  "events": [
    {
      "id": "e33b3396-7271-4f09-8de4-ad3e7691dc14",
      "title": "CROSS-FLOW-TEST: Testni dogadaj",
      "location": "Trg, Vis"
    }
  ]
}
```

---

## Flow 5: Static Page Evidence

### Add Block

```bash
curl -X POST http://localhost:3000/admin/pages/2b44a0b4-5394-41e4-97fc-c199bfaf9cd1/blocks \
  -H 'Content-Type: application/json' \
  -H 'X-Admin-Role: supervisor' \
  -d '{
    "type": "text",
    "order": 1,
    "content": {
      "title_hr": "CROSS-FLOW-TEST: Testni blok",
      "body_hr": "Ovaj blok je dodan za verifikaciju cross-system flow-a"
    }
  }'
```

**Response includes:**
```json
{
  "has_unpublished_changes": true,
  "draft_blocks": [
    {"id": "fauna-text-1", "type": "text"},
    {"id": "4b228ae7-a3f6-4f5e-b869-ee4b8e3bd659", "type": "text"}
  ]
}
```

### Publish Page

```bash
curl -X POST http://localhost:3000/admin/pages/2b44a0b4-5394-41e4-97fc-c199bfaf9cd1/publish \
  -H 'X-Admin-Role: supervisor' \
  -H 'X-Admin-User: cross-flow-test'
```

**Response includes:**
```json
{
  "has_unpublished_changes": false,
  "published_at": "2026-01-09T22:02:56.353Z",
  "published_by": "cross-flow-test"
}
```

### Public Page Check

```bash
curl http://localhost:3000/pages/fauna
```

**Response:**
```json
{
  "slug": "fauna",
  "blocks": [
    {
      "id": "fauna-text-1",
      "type": "text",
      "content": {"title": "Morski i kopneni život"}
    },
    {
      "id": "4b228ae7-a3f6-4f5e-b869-ee4b8e3bd659",
      "type": "text",
      "content": {"title": "CROSS-FLOW-TEST: Testni blok"}
    }
  ]
}
```

---

## Flow 6: Reminders Evidence

### Subscribe to Event

```bash
curl -X POST http://localhost:3000/events/e33b3396-7271-4f09-8de4-ad3e7691dc14/subscribe \
  -H "X-Device-ID: flow6-reminder-test-device"
```

**Response:**
```json
{
  "subscribed": true
}
```

### Generate Reminders

```bash
curl -X POST "http://localhost:3000/admin/reminders/generate?date=2026-01-10"
```

**Response:**
```json
{
  "success": true,
  "reminders_generated": 1,
  "date": "2026-01-10"
}
```

### Check Inbox

```bash
curl http://localhost:3000/inbox
```

**Response includes:**
```json
{
  "messages": [
    {
      "id": "ad241a65-d461-4c81-ba50-b11cbdde9bb8",
      "title": "Podsjetnik: CROSS-FLOW-TEST: Testni dogadaj",
      "body": "Danas u 11:00\nLokacija: Trg, Vis\n\nOpis testnog dogadaja za verifikaciju cross-system flow-a",
      "tags": ["kultura"],
      "is_urgent": false
    }
  ]
}
```

---

## Verification Environment

| Component | Status | URL |
|-----------|--------|-----|
| Backend | Running | http://localhost:3000 |
| Admin UI | Running | http://localhost:5173 |
| Database | Connected | PostgreSQL |

**Health Check:**
```json
{
  "status": "ok",
  "timestamp": "2026-01-09T21:55:26.132Z",
  "environment": "development",
  "checks": {
    "server": true,
    "database": true
  }
}
```
