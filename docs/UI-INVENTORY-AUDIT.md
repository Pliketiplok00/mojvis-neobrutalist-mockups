# UI INVENTORY AUDIT

**Generated**: 2026-01-09
**Scope**: `mobile/src/screens/**`, `mobile/src/components/**`, `mobile/src/navigation/**`

---

## 1. PAGE INVENTORY

| Screen Name | File Path | Route | Purpose |
|-------------|-----------|-------|---------|
| HomeScreen | `screens/home/HomeScreen.tsx` | `Home` | Main landing screen with banners, greeting, category grid, upcoming events, and feedback entry |
| LanguageSelectionScreen | `screens/onboarding/LanguageSelectionScreen.tsx` | `LanguageSelection` | Language selection (hr/en) at app start |
| UserModeSelectionScreen | `screens/onboarding/UserModeSelectionScreen.tsx` | `UserModeSelection` | User type selection (visitor/local) |
| MunicipalitySelectionScreen | `screens/onboarding/MunicipalitySelectionScreen.tsx` | `MunicipalitySelection` | Municipality selection (vis/komiza) for local users |
| TransportHubScreen | `screens/transport/TransportHubScreen.tsx` | `TransportHub` | Transport entry point with Road/Sea options |
| RoadTransportScreen | `screens/transport/RoadTransportScreen.tsx` | `RoadTransport` | Road transport lines list and today's departures |
| SeaTransportScreen | `screens/transport/SeaTransportScreen.tsx` | `SeaTransport` | Sea transport lines list and today's departures |
| RoadLineDetailScreen | `screens/transport/RoadLineDetailScreen.tsx` | `RoadLineDetail` | Wrapper for LineDetailScreen (road) |
| SeaLineDetailScreen | `screens/transport/SeaLineDetailScreen.tsx` | `SeaLineDetail` | Wrapper for LineDetailScreen (sea) |
| LineDetailScreen | `screens/transport/LineDetailScreen.tsx` | N/A (shared) | Line details with date selector, direction toggle, departures, contacts |
| EventsScreen | `screens/events/EventsScreen.tsx` | `Events` | Calendar view with selected-day event list |
| EventDetailScreen | `screens/events/EventDetailScreen.tsx` | `EventDetail` | Event details with reminder toggle and share |
| InboxListScreen | `screens/inbox/InboxListScreen.tsx` | `Inbox` | Inbox with received/sent tabs |
| InboxDetailScreen | `screens/inbox/InboxDetailScreen.tsx` | `InboxDetail` | Full inbox message view |
| FeedbackFormScreen | `screens/feedback/FeedbackFormScreen.tsx` | `FeedbackForm` | Submit feedback form (subject, body) |
| FeedbackConfirmationScreen | `screens/feedback/FeedbackConfirmationScreen.tsx` | `FeedbackConfirmation` | Feedback submission confirmation |
| FeedbackDetailScreen | `screens/feedback/FeedbackDetailScreen.tsx` | `FeedbackDetail` | View submitted feedback with replies |
| ClickFixFormScreen | `screens/click-fix/ClickFixFormScreen.tsx` | `ClickFixForm` | Issue report form with location and photos |
| ClickFixConfirmationScreen | `screens/click-fix/ClickFixConfirmationScreen.tsx` | `ClickFixConfirmation` | Click & Fix submission confirmation |
| ClickFixDetailScreen | `screens/click-fix/ClickFixDetailScreen.tsx` | `ClickFixDetail` | View submitted issue with photos and replies |
| StaticPageScreen | `screens/pages/StaticPageScreen.tsx` | `StaticPage` | Renders static content pages with 8 block types |
| SettingsScreen | `screens/settings/SettingsScreen.tsx` | `Settings` | Push notifications, profile info, reset onboarding |

---

## 2. BLOCK/SECTION INVENTORY

### HomeScreen

| Block | JSX Element |
|-------|-------------|
| Active Notifications | `<BannerList banners={banners} />` |
| Greeting Block | `<View style={styles.greetingSection}>` with `greetingTitle`, `greetingSubtitle` |
| Category Grid | `<View style={styles.categoryGrid}>` with 4 `categoryCard` Views |
| Upcoming Events | `<View style={styles.placeholder}>` (placeholder) |
| Feedback Entry | `<View style={styles.feedbackCard}>` |

### TransportHubScreen

| Block | JSX Element |
|-------|-------------|
| Banners | `<BannerList banners={banners} />` |
| Title Section | `<View style={styles.section}>` with `title`, `subtitle` |
| Transport Options | `<View style={styles.optionsContainer}>` with 2 `optionCard` TouchableOpacitys |

### RoadTransportScreen / SeaTransportScreen

| Block | JSX Element |
|-------|-------------|
| Banners | `<BannerList banners={banners} />` |
| Title Section | `<View style={styles.titleSection}>` with `title`, `dayInfo` |
| Lines List | `<View style={styles.section}>` with `lineCard` TouchableOpacitys |
| Today's Departures | `<View style={styles.section}>` with `departureCard` TouchableOpacitys |

### LineDetailScreen

| Block | JSX Element |
|-------|-------------|
| Line Header | `<View style={styles.headerSection}>` with `lineName`, `subtypeBadge` |
| Date Selector | `<View style={styles.dateSection}>` with arrows and date display |
| Direction Toggle | `<View style={styles.directionSection}>` with `directionButton` TouchableOpacitys |
| Route Info | `<View style={styles.routeInfo}>` with `routeLabel`, `routeDuration` |
| Departures | `<View style={styles.section}>` with `<DepartureItem>` components |
| Contacts | `<View style={styles.section}>` with `contactCard` Views |

### EventsScreen

| Block | JSX Element |
|-------|-------------|
| Section Title | `<View style={styles.section}>` with `sectionTitle`, `sectionSubtitle` |
| Calendar | `<Calendar>` component |
| Selected Day Events | `<View style={styles.section}>` with `<EventItem>` components |

### EventDetailScreen

| Block | JSX Element |
|-------|-------------|
| Title Header | `<View style={styles.header}>` with `title` |
| Date/Time Info | `<View style={styles.infoSection}>` with `infoLabel`, `infoValue` |
| Location Info | `<View style={styles.infoSection}>` (conditional) |
| Description | `<View style={styles.infoSection}>` with `description` |
| Reminder Toggle | `<View style={styles.reminderSection}>` with `<Switch>` |
| Share Button | `<TouchableOpacity style={styles.shareButton}>` |

### InboxListScreen

| Block | JSX Element |
|-------|-------------|
| Tab Bar | `<View style={styles.tabBar}>` with 2 tab TouchableOpacitys |
| Message List (received) | `<FlatList>` with `renderMessage` items |
| Sent Items List | `<FlatList>` with `renderSentItem` items |
| New Submission Buttons | `<View style={styles.newFeedbackContainer}>` with 2 TouchableOpacitys |

### InboxDetailScreen

| Block | JSX Element |
|-------|-------------|
| Urgent Badge | `<View style={styles.urgentBadge}>` (conditional) |
| Tags Container | `<View style={styles.tagsContainer}>` (conditional) |
| Title | `<Text style={styles.title}>` |
| Date | `<Text style={styles.date}>` |
| Body | `<Text style={styles.body}>` |

### StaticPageScreen

| Block Type | JSX Element |
|------------|-------------|
| Page Header | `<PageHeaderView header={page.header} />` |
| text | `<TextBlock content={...} />` |
| highlight | `<HighlightBlock content={...} />` |
| card_list | `<CardListBlock content={...} />` |
| media | `<MediaBlock content={...} />` |
| map | `<MapBlock content={...} />` |
| contact | `<ContactBlock content={...} />` |
| link_list | `<LinkListBlock content={...} />` |
| notice | `<NoticeBlock content={...} />` |

### FeedbackFormScreen / ClickFixFormScreen

| Block | JSX Element |
|-------|-------------|
| Title Section | `<View style={styles.titleSection}>` |
| Submit Error | `<View style={styles.errorContainer}>` (conditional) |
| Subject Field | `<View style={styles.field}>` with `<TextInput>` |
| Body/Description Field | `<View style={styles.field}>` with multiline `<TextInput>` |
| Location Section (ClickFix) | `<View style={styles.field}>` with location button |
| Photos Section (ClickFix) | `<View style={styles.field}>` with photo grid and add buttons |
| Submit Button | `<TouchableOpacity style={styles.submitButton}>` |

### FeedbackDetailScreen / ClickFixDetailScreen

| Block | JSX Element |
|-------|-------------|
| Status Badge | `<View style={styles.statusBadge}>` |
| Message Card | `<View style={styles.messageCard}>` |
| Photos Section (ClickFix) | `<View style={styles.photosSection}>` with horizontal ScrollView |
| Replies Section | `<View style={styles.repliesSection}>` with `replyCard` Views |

### SettingsScreen

| Block | JSX Element |
|-------|-------------|
| Notifications Section | `<View style={styles.section}>` with `<Switch>` |
| Profile Section | `<View style={styles.section}>` with `infoRow` Views |
| Actions Section | `<View style={styles.section}>` with danger button |
| Version Info | `<View style={styles.versionContainer}>` |

### Onboarding Screens

| Block | JSX Element |
|-------|-------------|
| Logo (Language) | `<View style={styles.logoContainer}>` |
| Title/Subtitle | `<Text style={styles.title}>`, `<Text style={styles.subtitle}>` |
| Button Container | `<View style={styles.buttonContainer}>` with TouchableOpacitys |
| Options Container | `<View style={styles.optionsContainer}>` with `optionCard` TouchableOpacitys |

---

## 3. COMPONENT INVENTORY

### GlobalHeader

- **File**: `components/GlobalHeader.tsx`
- **Props**:
  - `type`: `'root' | 'child' | 'inbox'`
  - `onMenuPress?`: `() => void`
  - `unreadCount?`: `number`
- **Behavior**: Root shows hamburger, child/inbox show back button. Inbox type hides inbox icon.

### MenuOverlay

- **File**: `components/MenuOverlay.tsx`
- **Props**:
  - `visible`: `boolean`
  - `onClose`: `() => void`
  - `onNavigate`: `(route: string) => void`
  - `currentRoute?`: `string`
- **Behavior**: Animated slide-in (75% width) with 5 menu items. Uses Animated.parallel for slide + fade.

### Banner

- **File**: `components/Banner.tsx`
- **Props**: `message`: `InboxMessage`
- **Behavior**: Single banner item. Tap navigates to InboxDetail. Urgent items have red background.

### BannerList

- **File**: `components/Banner.tsx`
- **Props**: `banners`: `InboxMessage[]`
- **Behavior**: Renders multiple Banner components. Returns null if empty.

### DepartureItem

- **File**: `components/DepartureItem.tsx`
- **Props**: `departure`: `DepartureResponse`
- **Behavior**: Expandable departure card. Collapsed: time, destination, duration. Expanded: vertical timeline with stop times. Uses LayoutAnimation.

### Calendar (inline in EventsScreen)

- **Props**: `selectedDate`, `onSelectDate`, `eventDates`
- **Behavior**: Month grid with navigation. Days with events show red dot. Selected day highlighted.

### EventItem (inline in EventsScreen)

- **Props**: `event`: `Event`
- **Behavior**: Clickable event item with time, title, location. Navigates to EventDetail.

### PageHeaderView (inline in StaticPageScreen)

- **Props**: `header`: `StaticPageResponse['header']`
- **Behavior**: Renders page title/subtitle. If type='media', shows header image.

### Block Renderers (inline in StaticPageScreen)

- TextBlock, HighlightBlock, CardListBlock, MediaBlock, MapBlock, ContactBlock, LinkListBlock, NoticeBlock
- Each renders specific content structure from ContentBlock data.

---

## 4. ELEMENT/CONTROL INVENTORY

### Navigation Controls

| Element | Component | Usage |
|---------|-----------|-------|
| Hamburger Menu | `TouchableOpacity` + Text `☰` | GlobalHeader (root) |
| Back Button | `TouchableOpacity` + Text `←` | GlobalHeader (child/inbox) |
| Inbox Icon | `TouchableOpacity` + Text `📥` | GlobalHeader (root/child) |
| Menu Item | `TouchableOpacity` | MenuOverlay |
| Chevron | `Text` with `>` | LineCard, DepartureCard, EventItem, LinkItem |

### Form Controls

| Element | Component | Usage |
|---------|-----------|-------|
| TextInput (single) | `TextInput` | FeedbackForm subject, ClickFixForm subject |
| TextInput (multiline) | `TextInput` with `multiline={true}` | FeedbackForm body, ClickFixForm description |
| Switch | `Switch` | EventDetailScreen reminder, SettingsScreen push |
| Location Button | `TouchableOpacity` | ClickFixFormScreen |
| Photo Add Button | `TouchableOpacity` with dashed border | ClickFixFormScreen |
| Submit Button | `TouchableOpacity` with black background | Forms |

### List/Data Display

| Element | Component | Usage |
|---------|-----------|-------|
| FlatList | `FlatList` | InboxListScreen |
| ScrollView | `ScrollView` | Most screens |
| RefreshControl | `RefreshControl` | Transport screens, Inbox, Detail screens |
| ActivityIndicator | `ActivityIndicator` | Loading states |

### Cards/Items

| Element | Component | Usage |
|---------|-----------|-------|
| Banner Card | `TouchableOpacity` | Banner component |
| Option Card | `TouchableOpacity` | TransportHubScreen, Onboarding |
| Line Card | `TouchableOpacity` | RoadTransportScreen, SeaTransportScreen |
| Departure Card | `TouchableOpacity` | TransportScreen today's departures |
| Event Item | `TouchableOpacity` | EventsScreen |
| Message Item | `TouchableOpacity` | InboxListScreen |
| Contact Card | `View` | LineDetailScreen |
| Reply Card | `View` | FeedbackDetailScreen, ClickFixDetailScreen |

### Badges/Indicators

| Element | Component | Usage |
|---------|-----------|-------|
| Urgent Badge | `View` + Text "HITNO" | Banner, InboxDetail, NoticeBlock |
| Status Badge | `View` with colored bg | FeedbackDetail, ClickFixDetail, InboxListScreen sent |
| Type Badge | `View` with "PRIJAVA" | InboxListScreen Click & Fix items |
| Subtype Badge | `View` | Line cards |
| Unread Dot | `View` (circle) | InboxListScreen |
| Event Dot | `View` (red circle) | Calendar days |
| Timeline Dot | `View` | DepartureItem expanded |

### Modals/Overlays

| Element | Component | Usage |
|---------|-----------|-------|
| Menu Overlay | `View` + Animated.View | MenuOverlay |
| Photo Modal | `Modal` | ClickFixDetailScreen |
| Alert | `Alert.alert()` | ClickFixForm, Settings, EventDetail |

### Calendar

| Element | Component | Usage |
|---------|-----------|-------|
| Month Nav | `TouchableOpacity` with `<` `>` | Calendar |
| Day Cell | `TouchableOpacity` | Calendar |
| Day Name | `Text` | Calendar header |

---

## 5. NAVIGATION & CHROME INVENTORY

### Navigation Structure

```
RootStack
├── Onboarding (when !isComplete)
│   ├── LanguageSelection
│   ├── UserModeSelection (params: language)
│   └── MunicipalitySelection (params: language)
└── Main (when isComplete)
    ├── Home
    ├── TransportHub
    ├── RoadTransport
    ├── RoadLineDetail (params: lineId)
    ├── SeaTransport
    ├── SeaLineDetail (params: lineId)
    ├── Events
    ├── EventDetail (params: eventId)
    ├── Inbox
    ├── InboxDetail (params: messageId)
    ├── FeedbackForm
    ├── FeedbackConfirmation (params: feedbackId)
    ├── FeedbackDetail (params: feedbackId)
    ├── ClickFixForm
    ├── ClickFixConfirmation (params: clickFixId)
    ├── ClickFixDetail (params: clickFixId)
    ├── StaticPage (params: slug)
    └── Settings
```

### Header Types by Screen

| Header Type | Screens |
|-------------|---------|
| `root` | HomeScreen, EventsScreen |
| `child` | All detail screens, form screens, transport screens (except hub), settings |
| `inbox` | InboxListScreen, InboxDetailScreen |

### Menu Items (MenuOverlay)

| Label | Route |
|-------|-------|
| Pocetna / Home | `Home` |
| Vozni red / Transport | `TransportHub` |
| Dogadaji / Events | `Events` |
| Pristiglo / Inbox | `Inbox` |
| Postavke / Settings | `Settings` |

### Navigation Animations

- All stacks use `animation: 'slide_from_right'`
- MenuOverlay uses `Animated.timing` with 250ms duration for open, 200ms for close

### SafeAreaView Usage

- All screens use `SafeAreaView` from `react-native-safe-area-context`
- `edges={['top']}` on most screens

### Navigation Props Handling

- Route params accessed via `useRoute()` hook
- Navigation accessed via `useNavigation()` hook
- Type safety via `NativeStackNavigationProp<MainStackParamList>`

---

**END OF AUDIT**
