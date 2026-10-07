# ABR — Build Instructions (for the AI Agent)

This file is given to an AI coding agent (Claude Code / Cursor / Windsurf). **The agent reads this file, builds a context file, writes an implementation plan, and then executes the plan one step at a time, asking the owner's permission before every step.**

---

## AGENT PROTOCOL — READ THIS FIRST

You are the AI agent. Follow these phases **in order**. Do not skip a phase and do not start writing app code until Phase 3.

### Phase 1 — Create the context file
1. Read `PRD-writer-publishing-app.md` fully.
2. Read this entire `instructions.md` fully.
3. Look through the `design-reference/` folder and list which screens exist.
4. Create a file called **`CONTEXT.md`** in the project root. It must contain, in your own organized words:
   - What ABR is and who uses it (from the PRD)
   - Product rules and non-goals (from the PRD and Section 1 below)
   - Tech stack and the two projects (`abr-mobile`, `abr-admin`) plus Supabase
   - Design system summary (colors, fonts, shape rules)
   - Data model summary
   - List of screens (reader app + admin) and which design-reference image belongs to each
   - Any conflicts, gaps, or unclear points you found between the PRD, this file, and the design references
5. Show the owner a short summary of `CONTEXT.md` and **ask the owner to confirm it is correct**. Do not continue until they confirm.

### Phase 2 — Create the implementation plan
1. After the owner confirms the context file, create **`IMPLEMENTATION_PLAN.md`**.
2. The plan must be a numbered, step-by-step procedure that covers everything in Sections 2 through 10 of this file, in the same order (Supabase first, then the admin content-management pages, then the mobile app, then the admin Dashboard, then review, polishing, and release). Break big sections into smaller steps (for example, each screen is its own step).
3. For every step, write:
   - **Goal** — what exists when the step is finished
   - **Actions** — what you will do
   - **Files** — files/folders you expect to create or change
   - **Needs from owner** — anything only the owner can do (e.g. paste Supabase keys, run SQL in the Supabase dashboard, create a storage bucket)
   - **How to verify** — how the owner can see that it works
4. Show the owner the plan and **ask for approval or changes**. Revise until they approve. Do not continue until the plan is approved.

### Phase 3 — Execute, one step at a time, with permission
For **every** step in `IMPLEMENTATION_PLAN.md`:
1. **Ask first.** Tell the owner which step is next, what you are about to do, which files you will touch, and anything you need from them. Then stop and wait. Only proceed when the owner says yes ("go", "approved", etc.).
2. **Do only that step.** Do not work ahead or bundle the next step in.
3. **Report after.** Summarize what you changed and how the owner can check it (run the app, open the page, etc.).
4. **Wait for the owner's feedback.** If they ask for fixes, make them and report again. Mark the step done in `IMPLEMENTATION_PLAN.md` only after the owner is happy.
5. Then move on to asking permission for the next step.

### Rules that always apply
- **Do not assume.** If something is unclear, missing, or conflicts with something else, stop and ask the owner. Do not guess and do not invent features, colors, screens, or behavior that aren't specified.
- **Follow the design references.** Before building any screen, view its screenshot in `design-reference/` and match it using the design tokens in Section 1. Don't invent new colors.
- **Follow the Key Product Rules in Section 1** — never deviate from them.
- **Keep `CONTEXT.md` up to date.** If the owner changes a decision, update `CONTEXT.md` (and the plan if needed) before continuing.
- If you hit an error you cannot fix after a couple of tries, show the owner the exact error message and explain what you tried.

---

## 1. Master project brief

This is the core brief. Everything in later sections depends on it. Summarize it into `CONTEXT.md` in Phase 1 and follow it for the whole project.

```
We are building "ABR" — a serialized Urdu novel reading app.

PRODUCT SUMMARY:
- ABR lets a single writer publish novels broken into episodes. Readers browse,
  read, favorite, rate, and track progress. There is NO login/signup for readers —
  each reader is identified only by their device ID, with a display name they enter
  once on first launch.
- There are two apps in this project:
  1. "abr-mobile" — the reader-facing Android/iOS app. Build with React Native + Expo.
  2. "abr-admin" — a web dashboard for the writer only, to manage novels/episodes and
     see analytics. Build with React (web) + Vite.
- Backend: Supabase (Postgres + file storage), free tier. No Supabase Auth for
  readers — only the admin panel uses Supabase Auth (single writer login).

LANGUAGE & DIRECTION:
- All reader-facing screens are in Urdu and right-to-left (RTL). Set RTL layout
  properly in Expo (I18nManager.forceRTL / allowRTL, and rtl-aware Flexbox).
- The admin panel is in English/LTR.
- Urdu text must use the "Noto Nastaliq Urdu" font — never fall back to a default
  serif/system font for Urdu. Load it via expo-font (mobile) and @fontsource (web).
- UI labels/metadata (timestamps, admin panel text) use the "Inter" font.
- Urdu body text needs generous line-height (1.8x–2.0x the font size) so the
  Nastaliq script's diacritics don't overlap.

DESIGN SYSTEM (use these exact values — do not invent new colors):
Dark theme (default):
  background:        #08122d
  surface:            #08122d
  surface-container-lowest: #040c28
  surface-container-low:    #111a36
  surface-container:        #151e3a
  surface-container-high:   #202945
  surface-container-highest:#2b3451
  surface-bright:     #2f3856
  on-surface (text):  #dce1ff
  on-surface-variant: #c6c6ce
  outline:            #909098
  outline-variant:    #46464d
  primary (silver-lilac accent): #bfc5e4
  on-primary:         #292f48
  secondary / GOLD ACCENT: #e9c176   (this is the main "premium" accent — use for
                                       primary buttons, active states, current
                                       chapter markers, ratings/stars)
  on-secondary:       #412d00
  secondary-container:#604403
  error:              #ffb4ab
  on-error:           #690005

Light theme ("book paper" mode — warm cream, not pure white):
  background:         #f6f1e7
  surface-container:  #efe8d8
  surface-container-high: #e7ded0
  on-surface (text):  #2a2418
  on-surface-variant: #6b6255
  outline-variant:    #d8cfbd
  primary/gold accent:#c5a059   (Antique Gold — same role as secondary in dark mode)
  on-primary:         #2a2418
  error:              #ba1a1a

Typography scale (all Urdu text = Noto Nastaliq Urdu, all labels = Inter):
  headline-xl:  40px / 700 weight / 80px line-height   (splash / hero titles)
  headline-lg:  32px / 700 / 64px                       (screen titles)
  headline-md:  24px / 600 / 48px                       (section/card titles)
  body-lg:      20px / 400 / 40px                       (reading screen body text)
  body-md:      18px / 400 / 36px                       (synopsis, descriptions)
  label-md:     14px / 500 / 20px, Inter, 0.02em spacing (buttons, tabs)
  label-sm:     12px / 600 / 16px, Inter, 0.05em spacing (badges, timestamps)

Shape & elevation rules — follow these exactly, they define the whole visual feel:
  - NO shadows, NO blur, NO glassmorphism anywhere.
  - Depth is shown only by stepping between the surface-container tiers above, plus
    1px solid borders (use outline-variant color for inactive, gold accent for
    active/focused).
  - Corner radius is small everywhere: 4px–6px. NEVER use fully-rounded "pill" shapes,
    not even for tags/badges/chips — keep them rectangular with a slight 4px radius.
  - Icons are thin line icons (Material Symbols Outlined, weight 1–1.5px), not filled,
    except when showing an active/toggled state.
  - Buttons: primary = solid gold background (#e9c176 dark / #c5a059 light) with dark
    navy text, 4px corners. Secondary = transparent background, 1px gold border.
  - Novel cards: 1px outline-variant border, cover image on top, title+author text in
    a separate container below the image — never overlay text on the cover image.
  - Bottom navigation bar: fixed, 1px top border, icon + small Inter label underneath
    each icon, active tab shown in gold.

DATA MODEL (create these Supabase tables — see the dedicated Supabase step below
for exact SQL, this is just so you know the shape of the data while building UI):
  Novel(id, title, author, synopsis, cover_image_url, category, age_rating, status,
        created_at, updated_at)
  Episode(id, novel_id, title, order, body, status, published_at, created_at, updated_at)
  Favorite(id, device_id, novel_id, created_at)
  Reader(device_id, username, created_at)
  ReadingProgress(id, device_id, episode_id, progress_percent, last_read_at)
  Rating(id, device_id, novel_id, rating 1-5, created_at, updated_at)
  Notification(id, title, message, related_novel_id, related_episode_id,
               trigger_type, created_at)   -- table only, no push infra in v1

KEY PRODUCT RULES (do not deviate from these):
  - Readers never see a login/signup/email screen. Only a one-time "what's your name?"
    prompt on first launch, saved locally against the device ID.
  - Episode order is automatic (by creation/publish order) — the writer never manually
    reorders episodes in v1.
  - A reader's rating on a novel is editable — one rating per device per novel, and
    submitting again updates it rather than creating a new one.
  - No payments, no paywalls, no comments/threaded discussion, no push notifications
    in this version — build the Notification table but no sending logic yet.
  - The app must support both dark and light theme, switchable from Settings, and
    should follow the device's system theme by default.
```

---

## 2. Supabase backend setup

The SQL runs in the Supabase web dashboard (SQL editor). The agent writes the SQL; **the owner pastes and runs it**, and creates the storage bucket and gives the agent the project URL/anon key. The agent must ask the owner for these at the right step.

```
Write the full Supabase SQL (Postgres) to create these tables, matching this schema
exactly. Use uuid primary keys with default gen_random_uuid(), snake_case column
names, and appropriate foreign keys + ON DELETE CASCADE where a child row depends on
a parent (Episode -> Novel, Favorite -> Novel, ReadingProgress -> Episode,
Rating -> Novel):

  novels: id, title, author, synopsis, cover_image_url, category, age_rating,
          status ('draft'|'published'), created_at, updated_at
  episodes: id, novel_id (fk), title, "order" (integer, auto-incrementing per novel),
            body (text), status ('draft'|'published'), published_at, created_at, updated_at
  favorites: id, device_id (text), novel_id (fk), created_at
             -- unique constraint on (device_id, novel_id)
  readers: device_id (text, primary key), username (text), created_at
  reading_progress: id, device_id (text), episode_id (fk), progress_percent (numeric),
                     scroll_position (numeric), last_read_at
                     -- unique constraint on (device_id, episode_id)
  ratings: id, device_id (text), novel_id (fk), rating (integer 1-5 check constraint),
           created_at, updated_at
           -- unique constraint on (device_id, novel_id) so a rating can be upserted
  notifications: id, title, message, related_novel_id (fk, nullable),
                 related_episode_id (fk, nullable), trigger_type (text), created_at

Also write Row Level Security (RLS) policies:
- novels/episodes: public SELECT only where status = 'published'; INSERT/UPDATE/DELETE
  restricted to authenticated users (the admin/writer login).
- favorites/reading_progress/ratings: allow anyone to INSERT/UPDATE/SELECT/DELETE
  their own rows matched by device_id (since there's no reader auth, this is
  intentionally open — readers self-report their device_id).
- notifications: public SELECT, admin-only INSERT.

Output the SQL as one script I can paste into the Supabase SQL editor, then tell me
which storage bucket to create for novel cover images and what its public access
policy should be.
```

---

## 3. Admin panel — content management (writer-only web dashboard)

Build this as a **separate project** (`abr-admin`), right after the Supabase setup, so real novels and episodes exist to test the reader app with. The Dashboard (analytics) page is built later, in Section 7, because it needs real usage data. View the matching design-reference image for each step.

### 3.1 Scaffold + login
Design reference: `design-reference/abr_admin_login/screen.png` (if present in the export; otherwise skip the image and follow the text)

```
Create a new Vite + React + TypeScript project called "abr-admin" (web, LTR, English
UI, Inter font throughout — this panel does not need Urdu/RTL since it's for the
writer's own use, though episode body content they type in will be Urdu, so the
episode text input itself should still support RTL + Noto Nastaliq Urdu). Reuse the
same design token colors from the master brief (dark navy theme, gold accents,
4-6px corners, no shadows). Set up:
- @supabase/supabase-js client using the Supabase project set up in Section 2.
- Supabase Auth email/password login for the single writer account — a simple Login
  screen (email + password + gold "Log In" button), and a protected route wrapper so
  every other page requires an authenticated session.
- A persistent left sidebar (icons: dashboard, book/library_books for Novels,
  settings) with the admin's app shell (top bar + sidebar + content area), matching
  the general layout style seen across the admin design references (see next steps).
```

### 3.2 Novel Management
Design reference: `design-reference/abr_admin_novel_management/screen.png`

```
Build the Novel Management page matching the design reference: a table/list of
all novels (cover thumbnail, title, category, status badge, episode count, actions),
a search/filter bar, and a "New Novel" flow (modal or side panel matching the
design reference) with fields: title, author, synopsis, category, age rating, cover
image upload (to the Supabase storage bucket), and status (draft/published toggle).
Support edit and delete (delete should warn it will also delete the novel's
episodes, since episodes cascade).
```

### 3.3 Episode Management
Design reference: `design-reference/abr_admin_episode_management/screen.png`

```
Build the Episode Management page (opened from within a specific novel) matching the
design reference: a list of that novel's episodes in their auto-assigned order,
each with title, status, published date, and actions. Include a "New Episode" /
edit form with: title, body content (a rich-enough text area with RTL + Noto
Nastaliq Urdu font and left/center/right alignment controls, matching the
format_align_left/center/right icons in the design reference), and draft/publish
status. New episodes are automatically appended to the end of the order — there is
no manual drag-to-reorder in this version. Publishing an episode should set
published_at = now().
```

---

## 4. Scaffold the mobile app project

```
Create a new Expo (React Native) project called "abr-mobile" using the Expo Router
(file-based routing) template with TypeScript.

Install and configure:
- expo-font, and load "Noto Nastaliq Urdu" (weights 400/500/600/700) and "Inter"
  (weights 400/500/600) from Google Fonts, per the master brief.
- RTL support: force RTL layout globally (I18nManager) since this is an Urdu app,
  and make sure a fresh app reload applies it correctly on both Android and iOS.
- React Navigation bottom tabs (or Expo Router's tab layout) for: Home, Search,
  Favorites, Profile — 4 tabs, matching the icon set: home, search, favorite,
  library_books-style icon for Profile. Use Material Symbols style thin-line icons
  (via @expo/vector-icons MaterialSymbolsOutlined equivalent, or lucide-react-native
  as a fallback if Material Symbols isn't available in Expo).
- @supabase/supabase-js for the backend client, with the URL/key read from Expo
  environment variables (EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY) —
  create a placeholder .env with empty values and a src/lib/supabase.ts client file.
- A device-id helper (using expo-application or expo-secure-store) that generates
  and persists a stable random device ID on first launch — this ID stands in for a
  reader account everywhere (favorites, ratings, progress).
- AsyncStorage for the locally-stored username and theme preference.

Set up this folder structure inside abr-mobile:
  app/                (Expo Router screens/tabs, empty for now — we fill these next)
  src/
    theme/            (colors.ts, typography.ts, spacing.ts — using the exact design
                        tokens from the master brief, with a light and dark object and
                        a ThemeProvider/useTheme hook that switches between them)
    lib/               (supabase.ts, deviceId.ts)
    components/        (empty for now)
    types/             (Novel, Episode, Favorite, Reader, ReadingProgress, Rating types
                        matching the data model in the master brief)

Don't build any screen UI yet — just get the app running with a blank white/navy
screen and the fonts + theme provider working, and confirm the folder structure.
```

---

## 5. Reader app screens (build in this order)

For every screen below: **first view the listed design-reference image** in `design-reference/`, then build the screen to match it using the design tokens from Section 1. Each screen is its own step in the plan.

### 5.1 Splash Screen
Design reference: `design-reference/abr_splash_screen/screen.png`

```
Build the Splash screen (app/index.tsx or the router entry point). Match the
design reference: dark navy background, centered ABR logo mark (book/quill icon)
with "ABR" wordmark in Noto Nastaliq Urdu headline-xl style and the gold accent
color. Auto-navigate after ~1.5 seconds: if a username is already saved locally for
this device, go to Home; if not, go to the Name Prompt screen.
```

### 5.2 Name Prompt (first launch only)
Design reference: `design-reference/abr_name_prompt/screen.png`

```
Build the Name Prompt screen, matching the design reference. It's a single-field
form: a friendly headline asking the reader to choose a display name, a text input
(RTL, Noto Nastaliq Urdu placeholder), and a gold primary "Continue" button. On
submit: save the entered name to AsyncStorage + upsert it into the Supabase `readers`
table against this device's ID, then navigate to Home. This screen must only ever
show once — check on app start whether a name is already saved and skip straight to
Home if so.
```

### 5.3 Home Screen
Design reference: `design-reference/abr_home_dark/screen.png`

```
Build the Home screen matching the design reference. Sections, top to bottom:
1. A featured/highlighted novel hero card (large cover image, title, short synopsis,
   an "arrow_forward" affordance) pulled from whichever published novel is flagged
   as featured (for now, just use the most recently published one).
2. A horizontally-scrolling "Continue Reading" shelf — novels where this device has
   reading_progress rows, showing cover + a thin progress bar.
3. A "Browse Novels" grid/shelf of novel cards (cover, title, author) for all
   published novels, grouped or filterable by category.
Use the theme tokens and card style rules from the master brief (1px border, no
shadows, gold accents, 4-6px corners). Tapping any novel card navigates to Novel
Details. Fetch novels from Supabase (status = 'published').
```

### 5.4 Novel Details Screen
Design reference: `design-reference/abr_novel_details/screen.png`

```
Build the Novel Details screen matching the design reference: cover image, title,
author, category/age-rating badges (rectangular, 1px border, not pills), a synopsis
in body-md Nastaliq text, the average star rating (gold stars) with rating count,
total episode count, a favorite (heart) toggle icon, and a full-width gold
"Start Reading" primary button (which should say "Continue Reading" and jump to the
last-read episode if reading_progress exists for this novel, otherwise start at
episode 1). Below that, show the rating widget: 5 tappable gold stars the reader can
set/update their own rating with (upsert into `ratings` by device_id + novel_id).
Tapping "Start Reading" or an episode link navigates into the Reading screen. Also
add a way to get to the full Episodes List (a "View all episodes" link/button).
```

### 5.5 Episodes List Screen
Design reference: `design-reference/abr_episodes_list/screen.png`

```
Build the Episodes List screen matching the design reference: a scrollable list
of episodes for the given novel_id, each row showing episode number/title, publish
date (Inter, label-sm), and a read/unread indicator (e.g. a filled vs outline dot,
or a checkmark, based on whether reading_progress for that episode+device is >=
~95%). Tapping a row opens the Reading screen for that episode. Only show
status = 'published' episodes, ordered by the `order` column ascending.
```

### 5.6 Reading Screen (dark + light)
Design references (view both): `design-reference/abr_reading_dark/screen.png` and `design-reference/abr_reading_light/screen.png`

```
Build the Reading screen matching both design references (dark and light theme
variants — this screen must fully respect the app's theme setting). Requirements:
- Content is the episode's Urdu body text, RTL, Noto Nastaliq Urdu, body-lg style,
  with the 1.8-2.0x line-height rule strictly applied, content width capped for
  readability (like a max ~720px reading column on larger screens).
- A minimal top bar: back button, novel/episode title, and a font-size/theme
  control (opens a small sheet with font size -/+ and theme toggle).
- Bottom or floating prev/next episode navigation.
- A thin reading-progress indicator (top of screen or bottom) that fills as the
  reader scrolls.
- On scroll and on leaving the screen, upsert reading_progress (device_id,
  episode_id, progress_percent, scroll_position, last_read_at = now()).
Keep it distraction-free — no bottom tab bar visible while actually reading.
```

### 5.7 Search Screen
Design reference: `design-reference/abr_search/screen.png`

```
Build the Search screen matching the design reference: a search input at top
(RTL, gold-accented focus border), and results shown as novel cards (same style as
Home) as the reader types — search should match against novel title, author, and
category using Supabase `ilike` queries with a short debounce. Show an empty state
before typing (e.g. recent/popular categories as quick filters) and a "no results"
state.
```

### 5.8 Favorites Screen
Design reference: `design-reference/abr_favorites/screen.png`

```
Build the Favorites screen matching the design reference: a grid/list of novel
cards the current device has favorited (query the `favorites` table joined to
`novels` by device_id), same card style as Home/Search. Include an empty state for
when there are no favorites yet, and let the reader un-favorite directly from this
screen (heart icon toggle on each card, deletes the row from `favorites`).
```

### 5.9 Profile / "My Activity" Screen
Design reference: `design-reference/abr_profile_my_activity/screen.png`

```
Build the Profile ("My Activity") screen matching the design reference. This is
NOT an account/login screen — no email or password anywhere. Show: the reader's
chosen username at the top (editable — tapping it lets them update the name saved
locally + in the `readers` table), a summary of their reading history (novels with
reading_progress, most-recent-first), a shortcut into Favorites, and a link into
Settings. Use the icon set from the design reference (book, favorite, history,
settings etc. as thin line icons).
```

### 5.10 Settings Screen
Design reference: `design-reference/abr_settings/screen.png`

```
Build the Settings screen matching the design reference: a theme selector
(System / Light / Dark — persisted to AsyncStorage and applied instantly via the
ThemeProvider), reading font-size preference, and links/buttons for Privacy Policy
and About/Version info (plain text or webview links, content can be a placeholder
for now). Do not include any login/logout/account-deletion controls — there is no
reader account to log out of, only a local device profile.
```

---

## 6. Wiring pass (after all screens above exist)

```
Now do a full wiring pass across abr-mobile:
1. Confirm every screen above reads and writes Supabase using the device ID helper
   consistently (no screen should ever ask the reader to log in).
2. Confirm theme switching (Settings) instantly updates every screen, including the
   Reading screen mid-session.
3. Confirm RTL layout is correct everywhere: icons, padding, and text alignment
   should visually flip correctly for Urdu (e.g. back arrows should point the
   correct direction for RTL).
4. Add loading and empty states (skeleton or simple spinner) to every screen that
   fetches from Supabase, and a basic error state ("couldn't load, pull to retry").
5. Add pull-to-refresh on Home, Search, and Favorites.
Show me a summary of what you changed.
```

---

## 7. Admin Dashboard (analytics)
Built after the reader app screens exist, because it depends on real usage data. It lives in `abr-admin` and reuses the login and app shell from Section 3.

Design reference: `design-reference/abr_admin_dashboard/screen.png`

```
Build the Admin Dashboard page matching the design reference: 4 key stat cards
(total novels, total episodes, total reads, average rating — compute "total reads"
as a count of reading_progress rows with progress_percent above some threshold, and
average rating from the ratings table), a performance line/area chart ("reads over
time" — group reading_progress.last_read_at by day/week) and a category breakdown
chart (count of novels per category). Use Recharts. Match the card and chart
container styling (1px borders, tiered surface colors, gold as the chart accent
color) from the design reference.
```

---

## 8. Final pass (code review)

```
Do a final review across both abr-mobile and abr-admin:
1. List anywhere the code still uses placeholder/fake data instead of real Supabase
   queries, and fix those.
2. Confirm no reader-facing screen anywhere asks for login, email, or password.
3. Confirm the gold accent color and 4-6px corner radius rule is applied
   consistently — flag any screen using shadows, blur, or pill-shaped buttons/badges
   so I can review it.
4. Give me a short checklist of what's left before this could go into a Play Store
   internal testing track (icons, splash config, app.json details, EAS build setup).
```

---

## 9. App polishing

Do this after the Final pass (Section 8). Each numbered group below is its own step in the plan. For every issue you find, tell the owner what it is before fixing it, and do not add new features — polishing means making what already exists correct, consistent, and smooth.

### 9.1 Visual & design consistency audit
```
Go through every screen in abr-mobile and abr-admin one by one and compare it
against its screenshot in design-reference/. For each screen, report and (with
my permission) fix any differences in: colors (must be the exact tokens from the
master brief), typography (font family, size, line-height), spacing, icon style
(thin line icons), and shape rules (no shadows, no blur, no pill shapes, 4-6px
corners, 1px borders). Check both dark and light theme on every reader screen.
```

### 9.2 Urdu / RTL / typography polish
```
Check every reader screen with real Urdu text: Noto Nastaliq Urdu must be loading
(no fallback font), line-height must follow the 1.8x-2.0x rule so diacritics don't
overlap or get clipped, text alignment and layout direction must be correct, and
icons/arrows must flip correctly for RTL. Test with long titles, long synopses, and
very long episode bodies. Report anything that looks wrong before fixing.
```

### 9.3 States & edge cases
```
Test and fix these cases across the reader app and admin panel:
- First launch (name prompt shows once, never again), and a returning launch.
- Empty states: no novels published, a novel with no episodes, no favorites, no
  reading history, no search results.
- Loading and error states on every screen that fetches data, including when the
  device is offline or Supabase can't be reached.
- A novel with no ratings yet; changing an existing rating updates it instead of
  creating a duplicate.
- Reading progress: resuming mid-episode, finishing an episode (read/unread marker),
  jumping between previous/next episodes.
- Admin: required-field validation on novel/episode forms, confirmation before
  deleting, cover image upload failure/progress, draft vs published behavior (drafts
  must never appear in the reader app).
```

### 9.4 Performance & smoothness
```
Check and improve performance in abr-mobile: lists use virtualized components
(FlatList or equivalent), cover images are appropriately sized/cached, the Reading
screen scrolls smoothly with a very long episode, progress saving is throttled or
debounced (not a database write on every scroll event), and fonts finish loading
before screens render. In abr-admin, check page load and chart rendering. Report
findings before changing anything.
```

### 9.5 Accessibility & usability
```
Check touch targets are comfortably tappable (at least 48dp on mobile), text
contrast is readable in both themes, system font-size changes don't break layouts,
and the back button / navigation behaves as users expect on Android.
```

### 9.6 Code cleanup
```
Remove leftover console logs, unused files/components/imports, commented-out code,
and placeholder or fake data. Make sure no secrets are committed (only the
Supabase URL and anon key are used in the apps — never a service role key), and
that .env files are git-ignored with an .env.example provided.
```

---

## 10. Final steps (release preparation)

Each numbered group below is its own step in the plan. Steps that only the owner can do (creating accounts, paying fees, uploading to stores) must be explained clearly to the owner, who then does them — the agent guides but does not assume access.

### 10.1 Full end-to-end test
```
Walk through the complete flow with the owner, step by step:
1. Admin: log in, create a novel with a cover, add several episodes, publish some and
   leave one as a draft.
2. Reader app (fresh install): splash -> name prompt -> Home shows the published
   novel -> Novel Details -> read an episode -> progress saves -> rate it -> change
   the rating -> favorite it -> find it in Favorites and Profile -> search for it ->
   switch theme in Settings.
3. Admin: confirm the Dashboard stats and charts reflect the activity from step 2.
Report any failures and fix them before moving on.
```

### 10.2 Security & data check
```
Review the Supabase RLS policies against the rules in Section 2: drafts are not
publicly readable, only the authenticated writer can create/edit/delete
novels and episodes, and readers can only touch rows through their own device_id.
Confirm the mobile app and admin panel only use the anon key, and that the admin
panel's routes are all behind login.
```

### 10.3 App configuration & branding
```
Prepare abr-mobile's app.json / app config for release: final app name, Android
package name, version and version code, app icon, adaptive icon, splash screen
(matching the Splash design reference), only the permissions actually needed, and
real Privacy Policy and About content to replace the placeholders from the Settings
screen. Ask the owner for any value you don't have (package name, policy text,
contact email) — do not invent them.
```

### 10.4 Build & distribution
```
Set up EAS Build for abr-mobile and produce a build for Google Play internal
testing (Android App Bundle). Then guide the owner through the Google Play Console
steps they must do themselves: create the developer account (one-time $25 fee),
create the app listing, complete the required forms (content rating, data safety,
privacy policy URL), upload the build to the internal testing track, and add
testers. Prepare the store listing text and list the graphics needed (icon,
feature graphic, screenshots) — ask the owner for anything that needs their
decision.

Also deploy abr-admin to a free host (Vercel or Netlify) and confirm the production
login works against the real Supabase project. Ask the owner which host they prefer.
```

### 10.5 Handoff
```
Write a README.md that explains in plain language: what each project is, how to run
them locally, the environment variables needed, how to deploy abr-admin, how to
create new builds of abr-mobile, and how to manage content from the admin panel.
Finally, update CONTEXT.md and IMPLEMENTATION_PLAN.md to reflect the finished state,
and give the owner a closing summary: what was built, what is left (if anything),
and any known issues.
```

---

## Tips if something goes wrong

- **The agent ignored the design reference / used the wrong colors:** say "view the screenshot in design-reference/ again and match it exactly — use the design tokens from the master brief, don't invent new colors."
- **Urdu text looks like a fallback font (not proper Nastaliq):** say "the Noto Nastaliq Urdu font isn't loading — check expo-font / useFonts and make sure the screen doesn't render until fonts are ready."
- **Layout looks left-to-right instead of right-to-left:** say "this screen isn't respecting RTL — check I18nManager and make sure flex-direction / text-align aren't hardcoded to LTR."
- **The agent is moving ahead without asking:** say "stop — follow the Agent Protocol in instructions.md: ask my permission before each step."
- **Stuck for more than a couple of tries:** paste the exact error message back to the agent along with "here's the error, fix it" — don't try to describe the error yourself.
