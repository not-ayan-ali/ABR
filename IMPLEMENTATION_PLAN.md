# IMPLEMENTATION_PLAN.md — ABR Project

This implementation plan is structured step-by-step according to the requirements in `instructions.md`. Every step will be executed one at a time, strictly with your permission.

---

## Step 1: Supabase Backend Setup — [DONE]
- **Goal:** Create all necessary PostgreSQL tables, RLS policies, and storage bucket in Supabase.

## Step 2: Admin Panel Scaffold + Login (`abr-admin`) — [DONE]
- **Goal:** Set up the `abr-admin` web project with Vite, React, TypeScript, Supabase client, and single-writer Auth login.

## Step 3: Admin Panel — Novel Management — [DONE]
- **Goal:** Build the Novel Management page in `abr-admin`.

## Step 4: Admin Panel — Episode Management — [DONE]
- **Goal:** Build the Episode Management page in `abr-admin`.

## Step 5: Mobile App Scaffold (`abr-mobile`) — [DONE]
- **Goal:** Initialize `abr-mobile` with Expo Router, TypeScript, Google Fonts (Noto Nastaliq Urdu + Inter), RTL enforcement, theme provider, and Supabase client.

## Step 6: Reader App — Splash Screen & Name Prompt — [DONE]
- **Goal:** Build the initial reader launch flow.

## Step 7: Reader App — Home Screen — [DONE]
- **Goal:** Build the Home screen pulling published novels from Supabase.

## Step 8: Reader App — Novel Details & Episodes List Screens — [DONE]
- **Goal:** Build Novel Details and Episodes List screens.

## Step 9: Reader App — Reading Screen — [DONE]
- **Goal:** Build the distraction-free Urdu reading screen with theme support and progress tracking.

## Step 10: Reader App — Search, Favorites, Profile, and Settings Screens — [DONE]
- **Goal:** Build remaining reader app tabs and screens (Search, Favorites, Profile/My Activity, and Settings).
- **Actions Completed:**
  - Built Search screen (`app/(tabs)/search.tsx`) with real-time `ilike` title search against Supabase.
  - Built Favorites screen (`app/(tabs)/favorites.tsx`) querying device favorites joined with novels.
  - Built Profile / My Activity screen (`app/(tabs)/profile.tsx`) allowing editable reader display name synced to Supabase `readers` and AsyncStorage.
  - Built Settings screen (`app/settings.tsx`) with instant Theme selector (System / Dark / Light) persisted to AsyncStorage and applied via ThemeProvider.
- **How to verify:** Open the mobile app tabs in Expo, test search, add/view favorites, edit profile name, and toggle themes in settings.

---

## Step 11: Mobile Wiring & Polish Pass — [DONE]
- **Goal:** Verify end-to-end integration, RTL correctness, loading/empty states, and pull-to-refresh across `abr-mobile`.
- **Actions Completed:**
  - Added pull-to-refresh on Home, Search, and Favorites screens.
  - Added loading spinners and error states ("couldn't load, pull to retry") to all screens fetching from Supabase.
  - Added un-favorite heart toggle directly on Favorites screen cards.
  - Added star rating widget (view avg + tap to rate) on Novel Details screen.
  - Added font-size controls (A+/A-) and prev/next navigation buttons on Reading screen.
  - Added category/age-rating badges on Novel Details screen.
  - Verified RTL alignment, device ID usage, and theme persistence across all screens.
- **Files:** `abr-mobile/app/(tabs)/index.tsx`, `abr-mobile/app/(tabs)/search.tsx`, `abr-mobile/app/(tabs)/favorites.tsx`, `abr-mobile/app/novel/[id].tsx`, `abr-mobile/app/read/[episodeId].tsx`
- **How to verify:** Test complete reader user journey on mobile simulator/device — pull-to-refresh, loading states, error states, rating, favorites, font controls.

---

## Step 12: Admin Dashboard (Analytics) — [DONE]
- **Goal:** Build the Admin Dashboard analytics page in `abr-admin`.
- **Actions Completed:**
  - Created `DashboardPage.tsx` with 4 stat cards (Total Novels, Total Episodes, Total Reads, Avg Rating) matching the design reference.
  - Implemented "Reads over Time" area chart using Recharts with gold accent color and gradient fill.
  - Implemented "Category Breakdown" panel with progress bars and percentage labels.
  - Integrated Dashboard into sidebar navigation with `LayoutDashboard` icon.
  - All stats computed from real Supabase data (counts, averages, time-series grouping).
- **Files:** `abr-admin/src/pages/DashboardPage.tsx`, `abr-admin/src/App.tsx`
- **How to verify:** Open admin panel, click "Dashboard" in sidebar, verify stat cards and charts render with real data.

## Step 13: Final Code Review & Cleanup — [DONE]
- **Goal:** Perform code review, remove placeholder data, ensure security rules and env configs.
- **Actions Completed:**
  - **Env configs:** removed the hardcoded Supabase URL/anon key from `abr-mobile/src/lib/supabase.ts` and `abr-admin/src/lib/supabase.ts` (the admin fallback key was also malformed). Both clients now read `EXPO_PUBLIC_SUPABASE_URL`/`EXPO_PUBLIC_SUPABASE_ANON_KEY` (Expo) and `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (Vite) and fail fast with a clear message when unset. Added `.env.example` to both projects, added `expo-env.d.ts` for typing, and git-ignored `.env` in both projects.
  - **Security rules (`supabase/schema.sql`):** public episode reads now require the parent novel to be `published` (a published episode can no longer leak from a draft novel); device-scoped tables (readers/favorites/reading_progress/ratings) now require a non-empty `device_id` on writes, with the intentional v1 openness documented; added `updated_at` triggers for novels/episodes/ratings; added `novel-covers` bucket creation plus storage policies (public read, authenticated write).
  - **Placeholder data removed:** fake dashboard subtexts ("+2 this month", "+15 this week", "+5% vs last week") replaced with real computed values (novels last 30 days, episodes last 7 days, reads week-over-week delta); splash screen placeholder square replaced with a real logo mark + ABR wordmark; deleted leftover Expo template files (`app/(tabs)/two.tsx`, `app/modal.tsx`, template `components/`, `constants/Colors.ts`, SpaceMono font).
  - **Review fixes:** fixed Urdu typography (`fontFamily` now matches the loaded `@expo-google-fonts` keys, so Noto Nastaliq Urdu actually renders); Novel Details "Start Reading" now resumes the last-read episode ("Continue Reading") or falls back to episode 1, with a back button; Search now debounces (300ms) and matches title, author, and category (with quote-escaping); Reading screen prev/next buttons now navigate real adjacent episodes and progress saves on screen exit; tab bar labels switched to Urdu; admin cover-upload filenames sanitized; `app.json` `userInterfaceStyle` set to `automatic` so light theme works; web root HTML uses the app background.
  - Verified no reader-facing screen asks for login/email/password.
  - Verified gold accent + 4-6px corner radius consistency across both projects.
  - Confirmed only the anon key is used (no service_role key anywhere).
- **Files:** `abr-mobile/src/lib/supabase.ts`, `abr-admin/src/lib/supabase.ts`, `abr-mobile/.env.example`, `abr-admin/.env.example`, `abr-mobile/expo-env.d.ts`, `abr-mobile/.gitignore`, `abr-admin/.gitignore`, `supabase/schema.sql`, `abr-admin/src/pages/DashboardPage.tsx`, `abr-mobile/app/index.tsx`, `abr-mobile/src/theme/typography.ts`, `abr-mobile/app/novel/[id].tsx`, `abr-mobile/app/(tabs)/search.tsx`, `abr-mobile/app/(tabs)/_layout.tsx`, `abr-mobile/app/read/[episodeId].tsx`, `abr-mobile/app/+html.tsx`, `abr-mobile/app/+not-found.tsx`, `abr-mobile/app.json`, `abr-admin/src/App.tsx`, `README.md`
- **How to verify:** `cp .env.example .env` in each app with real Supabase values, run both apps, confirm Urdu renders in Nastaliq, confirm drafts are invisible to readers, confirm dashboard subtexts reflect real data, and confirm `.env` is not tracked by git.
