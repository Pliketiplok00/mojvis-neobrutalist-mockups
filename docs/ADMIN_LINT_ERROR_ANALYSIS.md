# Admin Lint Error Analysis

**Date:** 2026-01-09
**File:** `admin/src/types/static-page.ts`
**Rule:** `@typescript-eslint/no-empty-object-type`
**Severity:** Error

---

## The Error

```
/Volumes/.../admin/src/types/static-page.ts
  155:18  error  An empty interface declaration allows any non-nullish value,
                 including literals like `0` and `""`.
                 @typescript-eslint/no-empty-object-type
```

---

## The Code

```typescript
// Lines 154-157 in admin/src/types/static-page.ts
// Notice block content is empty - it's system-injected
export interface NoticeBlockContent {
  // Empty - content is injected at runtime
}
```

This interface is part of the `BlockContent` union type:

```typescript
export type BlockContent =
  | TextBlockContent
  | HighlightBlockContent
  | CardListBlockContent
  | MediaBlockContent
  | MapBlockContent
  | ContactBlockContent
  | LinkListBlockContent
  | NoticeBlockContent;  // <-- Empty interface
```

---

## What the Lint Rule Does

The `@typescript-eslint/no-empty-object-type` rule (part of `tseslint.configs.recommended`) flags empty interfaces because:

1. An empty interface `{}` in TypeScript matches **any non-nullish value**, including primitives like `0`, `""`, `true`
2. This is rarely the intended behavior
3. It can mask type errors at compile time

Example of the problem:
```typescript
interface Empty {}
const x: Empty = 42;      // Compiles! (probably not intended)
const y: Empty = "hello"; // Compiles! (probably not intended)
```

---

## Why This Interface Exists

### Intentional Design Decision

The `NoticeBlockContent` interface is **intentionally empty** because:

1. **Notice blocks are system-controlled** - The admin cannot edit their content
2. **Content is injected at runtime** - The backend populates notice blocks with InboxMessage data when serving static pages
3. **No admin-editable fields exist** - Unlike other block types (text, highlight, etc.), there's nothing for an admin to enter

### Evidence from Spec Comments

```typescript
// Line 27: 'notice', // System-controlled - not editable
// Line 154: // Notice block content is empty - it's system-injected
// Line 263: if (block.type === 'notice') return false; // canEditBlockContent
```

### Backend Confirmation

The backend route (`backend/src/routes/static-pages.ts`) injected notices from the Inbox system:
```typescript
// Line 160-162 (now removed):
case 'notice':
  // Notice blocks are injected at runtime
  return {};
```

**Note:** As of 2026-01-09, notice injection was removed from static pages per InboxMessage placement rules. However, the type definition remains for backwards compatibility and potential future use.

---

## Risk Assessment

### Is This Harmful?

**No, this is a harmless lint rule mismatch.**

| Risk | Assessment |
|------|------------|
| Runtime errors | None - the empty interface works correctly |
| Type safety holes | Minimal - `NoticeBlockContent` is only used in the union type |
| Architectural confusion | Low - comments clearly explain the intent |
| Future maintenance | Low - type is simple and well-documented |

### Why It's Safe

1. The interface is only used within the `BlockContent` union type
2. Admin code checks `block.type === 'notice'` and prevents editing
3. The empty content is correct - there's nothing to store
4. Runtime behavior is unaffected by this TypeScript-only construct

---

## Should This Be Fixed?

**Yes, eventually (low priority).**

### Reasons to Fix

1. Eliminates lint error, allowing `npm run lint` to pass cleanly
2. Makes the type intent more explicit
3. Removes noise from lint output (currently 1 error + 5 warnings)

### Reasons It's Low Priority

1. Does not cause runtime issues
2. Does not block builds or deployments
3. The 5 warnings (useEffect dependencies) are more impactful
4. Notice blocks are currently not used (notice injection was removed)

---

## Recommended Minimal Fix Strategy (DESCRIBED ONLY)

### Option A: Use `Record<string, never>` (Recommended)

```typescript
// Instead of:
export interface NoticeBlockContent {
  // Empty - content is injected at runtime
}

// Use:
export type NoticeBlockContent = Record<string, never>;
```

**Why:** `Record<string, never>` explicitly means "an object with no properties" - matching the intended semantics.

### Option B: Use `object` type

```typescript
export type NoticeBlockContent = object;
```

**Why:** If notice content might have dynamic properties in the future.

### Option C: Inline disable

```typescript
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface NoticeBlockContent {
  // Empty - content is injected at runtime
}
```

**Why:** Explicitly acknowledges the empty interface is intentional. However, this is generally discouraged.

### Option D: Add phantom property

```typescript
export interface NoticeBlockContent {
  readonly _type?: 'notice'; // Phantom discriminator
}
```

**Why:** Maintains interface syntax while satisfying the lint rule.

---

## Additional Lint Issues Found

The lint run revealed 5 additional warnings (not related to this analysis):

| File | Issue |
|------|-------|
| `ClickFixListPage.tsx` | Missing `fetchClickFixes` dependency |
| `EventEditPage.tsx` | Missing `loadEvent` dependency |
| `FeedbackListPage.tsx` | Missing `fetchFeedback` dependency |
| `PageEditPage.tsx` | Missing `loadPage` dependency |
| `PagesListPage.tsx` | Missing `loadPages` dependency |

These are `react-hooks/exhaustive-deps` warnings - a separate issue from the empty interface error.

---

## ESLint Configuration Context

The admin uses `tseslint.configs.recommended` which includes `no-empty-object-type`:

```javascript
// admin/eslint.config.js
export default defineConfig([
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,  // <-- Includes the rule
      // ...
    ],
  },
])
```

---

## Confirmation

**No code was changed during this analysis.**

This document is analysis-only. The recommended fixes are described but not implemented.
