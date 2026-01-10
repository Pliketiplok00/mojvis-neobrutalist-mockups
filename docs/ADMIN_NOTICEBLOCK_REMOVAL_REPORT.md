# Admin NoticeBlockContent Removal Report

**Date:** 2026-01-09
**Task:** Remove NoticeBlockContent from admin to fix lint error
**Approach:** Option A - Complete removal (not replacement with Record<string, never>)

---

## Problem

ESLint error in `admin/src/types/static-page.ts`:

```
155:18  error  An empty interface declaration allows any non-nullish value,
               including literals like `0` and `""`.
               @typescript-eslint/no-empty-object-type
```

The empty `NoticeBlockContent` interface violated the `@typescript-eslint/no-empty-object-type` rule.

---

## Root Cause

The `NoticeBlockContent` interface was a vestige from when static pages could have notice blocks injected at runtime. This injection was removed in a previous fix (per `INBOX_MESSAGE_PLACEMENT_REPORT.md`), making the interface orphaned and unused.

---

## Files Changed

### 1. `admin/src/types/static-page.ts`

| Change | Before | After |
|--------|--------|-------|
| Header comment | "8 block types" | "7 block types (notice removed)" |
| BLOCK_TYPES array | Included 'notice' | Removed 'notice' |
| BLOCK_TYPE_LABELS | Included notice entry | Removed notice entry |
| NoticeBlockContent interface | Present (empty) | **DELETED** |
| BlockContent union | Included NoticeBlockContent | Removed NoticeBlockContent |
| canEditBlockContent | Had notice check | Removed notice check |
| getAddableBlockTypes | Filtered out 'notice' | Returns all types (no filter needed) |

### 2. `admin/src/pages/pages/PageEditPage.tsx`

| Change | Location | Description |
|--------|----------|-------------|
| Notice conditional | Line 633-636 | Removed `block.type === 'notice'` branch |
| noticeInfo style | Lines 2403-2408 | Removed unused style definition |

---

## Proof: Lint Results

### Before

```
1 error, 5 warnings
155:18  error  @typescript-eslint/no-empty-object-type
```

### After

```
0 errors, 5 warnings
```

The 5 remaining warnings are pre-existing `react-hooks/exhaustive-deps` warnings unrelated to this change.

---

## Files NOT Changed (Scope Control)

Per task constraints, these files were NOT touched:

- `backend/*` - All backend files untouched
- `mobile/*` - All mobile files untouched

---

## Detailed Diffs

### static-page.ts - Header Comment

```typescript
// BEFORE
* - 8 block types available

// AFTER
* - 7 block types (notice removed - not used in current architecture)
```

### static-page.ts - BLOCK_TYPES Array

```typescript
// BEFORE
export const BLOCK_TYPES = [
  'text',
  'highlight',
  'card_list',
  'media',
  'map',
  'contact',
  'link_list',
  'notice', // <-- REMOVED
] as const;

// AFTER
export const BLOCK_TYPES = [
  'text',
  'highlight',
  'card_list',
  'media',
  'map',
  'contact',
  'link_list',
] as const;
```

### static-page.ts - NoticeBlockContent Interface

```typescript
// BEFORE (lines 154-157)
// Notice block content is empty - it's system-injected
export interface NoticeBlockContent {
  // Empty - content is injected at runtime
}

// AFTER
// DELETED ENTIRELY
```

### static-page.ts - BlockContent Union

```typescript
// BEFORE
export type BlockContent =
  | TextBlockContent
  | HighlightBlockContent
  | CardListBlockContent
  | MediaBlockContent
  | MapBlockContent
  | ContactBlockContent
  | LinkListBlockContent
  | NoticeBlockContent;  // <-- REMOVED

// AFTER
export type BlockContent =
  | TextBlockContent
  | HighlightBlockContent
  | CardListBlockContent
  | MediaBlockContent
  | MapBlockContent
  | ContactBlockContent
  | LinkListBlockContent;
```

### static-page.ts - getAddableBlockTypes

```typescript
// BEFORE
export function getAddableBlockTypes(): BlockType[] {
  return BLOCK_TYPES.filter(type => type !== 'notice');
}

// AFTER
export function getAddableBlockTypes(): BlockType[] {
  return [...BLOCK_TYPES];
}
```

### PageEditPage.tsx - Notice Conditional

```typescript
// BEFORE (lines 633-641)
{block.type === 'notice' ? (
  <div style={styles.noticeInfo}>
    Obavijest blokovi su automatski generirani od strane sustava.
  </div>
) : !canEdit ? (

// AFTER
{!canEdit ? (
```

### PageEditPage.tsx - noticeInfo Style

```typescript
// BEFORE (lines 2403-2408)
noticeInfo: {
  padding: '16px',
  backgroundColor: '#fff3cd',
  color: '#856404',
  fontSize: '14px',
},

// AFTER
// DELETED ENTIRELY
```

---

## Verification Commands

```bash
# Verify lint passes
cd admin && pnpm lint
# Result: 0 errors, 5 warnings

# Verify notice is not in BLOCK_TYPES
grep -n "notice" admin/src/types/static-page.ts
# Result: Only appears in comment

# Verify NoticeBlockContent is gone
grep -n "NoticeBlockContent" admin/src/types/static-page.ts
# Result: No matches
```

---

## Summary

- **Error fixed:** `@typescript-eslint/no-empty-object-type` error eliminated
- **Method:** Complete removal of unused NoticeBlockContent type (Option A)
- **Scope:** Admin only (backend/mobile untouched)
- **Side effects:** None - the type was unused since notice injection was removed
