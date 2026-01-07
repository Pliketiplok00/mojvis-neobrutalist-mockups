# MAIN MENU – DESCRIPTIVE WIREFRAME

## SCREEN: Main Menu
ID: MENU_01

### Purpose
Provide access to all main sections of the app from any primary screen.

---

## Entry & Exit

### Entry
- Opened by tapping the hamburger icon in the global header

### Exit
- Tapping outside the menu
- Using back navigation
- Selecting a menu item

---

## UI Structure
- Slide-in or overlay menu
- Vertical list of navigation items
- Each item contains:
  - Icon
  - Label
  - Navigation indicator (e.g. chevron)

---

## Content Rules
- Menu items represent all main app sections
- Labels are:
  - Language-specific
  - Managed via admin interface

---

## Behavior & Logic
- Menu is always the same for all users (but language specific following the user prefrences)
- Menu navigation does not reset app state
- Selecting an item navigates to the corresponding screen

---

## Integration Notes
- Menu content must stay in sync with:
  - Home category grid (Home can only link to menu items)
- Menu structure is static, but labels and ordering may be configurable
