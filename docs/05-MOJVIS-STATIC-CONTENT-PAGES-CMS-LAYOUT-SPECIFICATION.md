# STATIC CONTENT PAGES – CMS & LAYOUT SPECIFICATION

This document defines the structure, components, permissions, and rules for all static (content-driven) pages in the app.
All static pages are fully content-managed via the admin interface, with strict layout guardrails.

---

## 1. CORE CONCEPT

Static pages are built from predefined **content blocks** arranged inside a fixed page layout.
Admins edit content only; layout integrity is protected by the system and supervisor permissions.

Key principles:
- Header is mandatory
- Layout is fixed and design-controlled
- Admins cannot break visual consistency
- Supervisors can control what admins are allowed to edit

---

## 2. USER ROLES & EDIT LEVELS

### Admin
Admins can:
- Edit content inside unlocked blocks
- Edit text, images, links, and data fields allowed by the block
- Add/remove items *inside* certain blocks (e.g. cards, contacts)

Admins cannot:
- Change page layout
- Change block types
- Change block order (unless explicitly unlocked)
- Change colors or styles
- Insert custom HTML
- Create or edit Notice blocks

### Supervisor
Supervisors (project owner) can:
- Do everything an admin can
- Add/remove blocks
- Reorder blocks
- Lock/unlock blocks (structure and/or content)
- Assign page templates
- Publish / unpublish pages

---

## 3. BLOCK LOCKING MODEL

Each block supports two independent locks:

### Structure Lock
- Admin cannot delete, move, or change block type
- Admin may edit content (if content lock is off)

### Content Lock
- Admin cannot edit content (read-only)
- Used for official or sensitive information

Locks are applied per block and controlled by Supervisor.

---

## 4. PAGE STRUCTURE

Each static page consists of:
1. Header (exactly one, mandatory)
2. Body (one or more content blocks)
3. Optional footer-style blocks (contacts, links, notices)

Rules:
- At least one content block must exist in the body
- There is a reasonable system limit on total blocks per page (to prevent abuse)

---

## 5. HEADER TYPES (MANDATORY)

Each page must use exactly one header type.

### A) Simple Header
- Title (required)
- Subtitle (optional)
- Icon (optional)

### B) Media Header
- Title (required)
- Subtitle (optional)
- Image or image carousel
- Carousel supports 1–5 images

Rules:
- Header colors and layout are design-locked
- Admin may edit text and images only

---

## 6. CONTENT BLOCK TYPES (8 TOTAL)

### 1) Text Block
**Purpose:** General text content

Fields:
- Title (optional)
- Body (rich text, no custom HTML)

Rules:
- Minimum 1 paragraph
- No limit on number of text blocks per page

---

### 2) Highlight / Info Block
**Purpose:** Emphasized information (tips, warnings, notes)

Fields:
- Title (optional)
- Body
- Icon (optional)
- Variant (info / warning / tip / notice – design-defined)

Rules:
- Visual style is design-controlled
- Admin edits content only

---

### 3) Card List Block
**Purpose:** Lists of items displayed as cards

Fields:
- Cards[] (min 1, max system-defined)
  - Image (optional)
  - Title (required)
  - Short description (optional)
  - Meta (optional)
  - Link (internal static / internal dynamic / external / none)

Rules:
- Layout (columns, spacing) is design-defined
- Admin can add/remove/edit cards within the block

---

### 4) Media Block
**Purpose:** Visual content

Fields:
- Image or image carousel (1–5 images)
- Caption (optional)

Rules:
- No body text inside this block
- Used as visual separators or highlights

---

### 5) Map Block
**Purpose:** Display geographic locations (infrastructure, services, nature)

Fields:
- Map provider (e.g. OpenStreetMap)
- Pins[]:
  - Latitude
  - Longitude
  - Title (HR/EN)
  - Description (optional, HR/EN)

Rules:
- Map block is a dedicated block type
- Maximum **one map block per page**
- Admin may edit pins and text only

---

### 6) Contact Block
**Purpose:** Structured contact information

Fields:
- Contacts[]:
  - Icon (required)
  - Name (required)
  - Address (optional)
  - Phone(s) (optional, clickable)
  - Email (optional)
  - Working hours:
    - Structured (days + times) OR
    - Free text
  - Note (optional)

Rules:
- Structured for consistency, flexible for real-world data
- Admin may add/remove/edit contacts inside the block

---

### 7) Link List Block
**Purpose:** Curated lists of useful links

Fields:
- Links[]:
  - Title
  - Link type:
    - Internal static page
    - Internal dynamic entity (event, transport line, etc.)
    - External URL
  - Target

Rules:
- Admin may edit links
- Broken internal links must be flagged in admin UI

---

### 8) Notice Block (System-controlled)
**Purpose:** Display active system notices related to this page

Behavior:
- Content is injected automatically by the system
- Based on active notices (time-bound, category-based)
- Clicking a notice opens the related Inbox detail

Rules:
- Notice blocks are **read-only**
- Cannot be created, edited, or removed by admin or supervisor
- Rendered only when relevant notices exist

---

## 7. LANGUAGE & PUBLISHING RULES

- All static pages must exist in **both Croatian and English**
- Admin may edit languages independently
- Page cannot be published unless:
  - Both language versions are complete
- Exception:
  - Municipal notices (Vis / Komiža) may exist in a single language

---

## 8. LAYOUT & DESIGN GUARDRAILS

Admins cannot:
- Change layout structure
- Change colors or typography
- Insert custom HTML or scripts

Admins can:
- Edit text and media inside unlocked blocks
- Reorder content *only if explicitly allowed by supervisor*

System goal:
- Prevent visually broken or inconsistent pages
- Allow content updates without design degradation

---

## 9. TEMPLATES & DEFAULT POLICIES

Pages are based on templates defined by Supervisor or developer.
Templates define:
- Default block order
- Which blocks are locked/unlocked by default
- Recommended block usage

Supervisors may override template rules per page.

---

## 10. SUMMARY

This system provides:
- High content flexibility
- Strong visual and structural consistency
- Clear separation of responsibilities
- Safe editing environment for admins
- Full creative and structural control for the supervisor
