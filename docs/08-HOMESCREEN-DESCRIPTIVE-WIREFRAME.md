# HOME SCREEN – DESCRIPTIVE WIREFRAME

## SCREEN: Home
ID: HOME_01

### Purpose
Main landing screen of the app after onboarding.  
Provides an overview of active information, quick access to key sections, upcoming events, and a feedback channel.

Content is partially dynamic and controlled by the admin interface.

---

## GLOBAL HEADER (used on Home)

### UI Elements
- Left: Hamburger menu icon
- Center: App title
- Right: Inbox icon

### Behavior
- Hamburger icon opens the main menu
- Inbox icon opens the Inbox screen

---

## SECTION 1: Active Notifications

### Purpose
Display important, time-sensitive information to the user.

### Visibility Rules
- This section is shown only if at least one relevant notification is currently active
- A notification is active if the current date/time falls within its defined `from` → `to` range

### Notification Types Displayed
- Emergency
- General
- Municipal (Vis or Komiža, depending on user settings)

### Behavior
- Each notification is shown as a prominent banner at the top of the screen
- Clicking a banner navigates to the Inbox, opened directly on the detailed view of that notification

---

## SECTION 2: Greeting Block

### Purpose
Provide a short, friendly introduction to the Home screen.

### Content
- Main greeting text
- Sub-greeting text

### Rules
- Both texts are editable via the admin interface
- Content is language-specific

---

## SECTION 3: Category Grid

### Purpose
Provide quick access to selected app sections.

### Structure
- Grid of category tiles
- Each tile links to a section available in the main menu

### Rules
- Admin can configure:
  - Which categories are shown on Home
  - Order of categories
- Categories must always be selected from existing menu sections
- Labels and links are language-aware

---

## SECTION 4: Upcoming Events

### Purpose
Highlight events happening in the near future.

### Content Rules
- Shows events occurring within the next 14 days
- Events are ordered chronologically

### Behavior
- Each event item is clickable
- Clicking an event opens the event detail screen

---

## SECTION 5: Feedback Entry

### Purpose
Provide a way for users to send suggestions or feedback to the administration.

### Behavior
- Clicking this section opens a feedback form

### Feedback Rules
- Submitted feedback:
  - Is sent to the admin
  - Appears in the user’s Inbox under sent messages
- Admin can assign a status tag to each feedback message:
  - Received
  - Under review
  - Accepted
  - Rejected
- Status tags are visible to the user in the Inbox
