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

## Step 11: Mobile Wiring & Polish Pass — [DONE]
- **Goal:** Verify end-to-end integration, RTL correctness, loading/empty states, and pull-to-refresh across `abr-mobile`.

## Step 12: Admin Dashboard (Analytics) — [DONE]
- **Goal:** Build the Admin Dashboard analytics page in `abr-admin`.

## Step 13: Final Code Review & Cleanup — [DONE]
- **Goal:** Perform code review, remove placeholder data, ensure security rules and env configs.

## Steps P1–P7: Privacy Policy Integration — [DONE]
- **Goal:** Add bilingual Privacy Policy in-app, hosted web page, settings link, name-prompt agreement, and data deletion feature.

---

## Step 14 (Group A) — Fix app building and running blockers — [DONE]

- **Goal:** Fix all issues that prevent the apps from building or running.
- **Sub-items:**
  - **A1. Wrong import paths:**
    - `abr-admin/src/App.tsx` line 2: change `'../lib/supabase'` → `'./lib/supabase'` (fixes `npm run build` failure).
    - `abr-mobile/app/settings.tsx`: change `'../../src/...'` → `'../src/...'`.
    - `abr-mobile/app/novel/[id].tsx` and `abr-mobile/app/read/[episodeId].tsx`: change `'../../../src/...'` → `'../../src/...'`.
    - Leave `abr-mobile/app/novel/[id]/episodes.tsx` as-is (already correct `'../../../src/...'`).
    - Leave `abr-mobile/src/pages/DashboardPage.tsx` as-is (already correct).
  - **A2. Wrong route param in Reading screen:**
    - `abr-mobile/app/read/[episodeId].tsx` uses `const { id } = useLocalSearchParams()` but the dynamic route is named `episodeId`. Change to read `episodeId` and update every usage of `id` in that file (fetch, saveProgress, episodeIdRef, sibling lookup, useEffect dependencies).
  - **A3. Non-existent icons from lucide-react-native:**
    - `ArrowBack` and `ArrowForward` are not exported by `lucide-react-native` — crashes with "Element type is invalid".
    - Affected files: `app/novel/[id].tsx`, `app/read/[episodeId].tsx`, `app/novel/[id]/episodes.tsx`.
    - Replace `ArrowBack` → `ArrowLeft`, `ArrowForward` → `ArrowRight`, keeping the existing `I18nManager.isRTL ? ... : ...` logic.
    - Leave `Feather`, `Heart`, `Star`, `Settings`, `ChevronLeft`, `ChevronRight` (these exist).
  - **A4. Wrong asset paths in `abr-mobile/app.json`:**
    - `icon`: `./assets/icon.png` → `./assets/images/icon.png`
    - `splash.image`: `./assets/splash-icon.png` → `./assets/images/splash-icon.png`
    - `android.adaptiveIcon.foregroundImage`: `./assets/adaptive-icon.png` → `./assets/images/android-icon-foreground.png`
    - `web.favicon`: `./assets/favicon.png` → `./assets/images/favicon.png`
    - Check whether images are real ABR branding or default Expo template icons — ask owner before replacing.
- **Files:** `abr-admin/src/App.tsx`, `abr-mobile/app/settings.tsx`, `abr-mobile/app/novel/[id].tsx`, `abr-mobile/app/read/[episodeId].tsx`, `abr-mobile/app/novel/[id]/episodes.tsx`, `abr-mobile/app.json`
- **Needs from owner:** Approval. Confirmation on whether asset images need replacing.
- **How to verify:** `npm run build` in `abr-admin`; `npx tsc --noEmit`, `npx expo export --platform android`, and `npx expo-doctor` in `abr-mobile`. Then owner opens: Home, a novel, an episode (text shows), Settings.

## Step 15 (Group B) — Fix broken or missing features — [DONE]

- **Goal:** Restore features that are broken or missing compared with the spec.
- **Sub-items:**
  - **B1. Episodes List unreachable:** Novel Details has no "View all episodes" link (spec section 5.4 requires one). Add a secondary button below "Start/Continue Reading" that navigates to `/novel/{id}/episodes`.
  - **B2. Reading position not restored:** `reading_progress.scroll_position` exists but the Reading screen never saves it and always opens at the top. Save scroll offset alongside `progress_percent`; on episode open, scroll back to the saved position for this device.
  - **B3. Reading screen stacks screens:** Previous/Next use `router.push`, so going through 5 episodes needs 5 back presses. Change to `router.replace`.
  - **B4. Settings has no back button/header:** Root Stack has `headerShown: false`. Add a top bar with a back button and title matching other screens.
  - **B5. Tab bar has no icons:** Spec asks for icons with labels (home, search, favorite, profile). Add thin line icons from `lucide-react-native` with gold active color. Ask owner if unsure which icon.
  - **B6. Missing cover image handling:** `cover_image_url` can be empty. `<Image source={{ uri: undefined }}>` shows blank box + warnings on Home, Favorites, Novel Details, Continue Reading. Show a placeholder block (surface color + book icon) when no cover.
  - **B7. Spec gap resolution (Owner confirmed YES):**
    - Add reading font-size preference to Settings (persisted to AsyncStorage and applied globally in Reading screen).
    - Add theme toggle control (Light/Dark/System) in the Reading screen top bar.
    - Nothing else — do not add features beyond what is listed.
- **Files:** `abr-mobile/app/novel/[id].tsx`, `abr-mobile/app/read/[episodeId].tsx`, `abr-mobile/app/settings.tsx`, `abr-mobile/app/(tabs)/_layout.tsx`, Home/Favorites/novel card components.
- **Needs from owner:** Approval to start Group B execution.
- **How to verify:** Test episodes list navigation, scroll position save/restore, prev/next replaces not pushes, settings header, tab bar icons, cover placeholder, font size persistence, and reading screen theme toggle.

## Step 16 (Group C) — Fix silent failures and data correctness — [DONE]

- **Goal:** Ensure Supabase errors are surfaced to the user and data is written correctly.
- **Sub-items:**
  - **C1. Writes ignore errors:** Supabase returns `{ error }` instead of throwing; the code ignores it, so the UI shows success even when saving failed. Fix in: favorite toggle and rating in `novel/[id].tsx`, un-favorite in `favorites.tsx`, name save in `name-prompt.tsx` and `profile.tsx`, and progress save in Reading screen. On error: do not update UI as if it worked; show a short Urdu message (e.g. "محفوظ نہیں ہو سکا، دوبارہ کوشش کریں۔"). For the first-launch name prompt: ask owner what should happen if offline — (1) block and show error, or (2) continue and retry later.
  - **C2. Name saved untrimmed:** `name-prompt.tsx` and `profile.tsx` check `name.trim()` but save the untrimmed value. Save the trimmed value and add `maxLength={40}` to both inputs.
  - **C3. `.single()` where row may not exist:** In `novel/[id].tsx` the favorites and own-rating lookups use `.single()`, which errors when no row exists. Change to `.maybeSingle()`.
  - **C4. `onConflict` strings contain a space:** `'device_id, episode_id'` and `'device_id, novel_id'` → `'device_id,episode_id'` and `'device_id,novel_id'`.
  - **C5. Weak fallback device ID:** `src/lib/deviceId.ts` uses `Math.random()` as fallback — not unique enough. Proposed fix: generate UUID via `expo-crypto` (`Crypto.randomUUID()`), store it, stop using Android hardware ID. Ask owner before changing — this also affects what the Privacy Policy must say.
- **Files:** `abr-mobile/app/novel/[id].tsx`, `abr-mobile/app/(tabs)/favorites.tsx`, `abr-mobile/app/name-prompt.tsx`, `abr-mobile/app/(tabs)/profile.tsx`, `abr-mobile/app/read/[episodeId].tsx`, `abr-mobile/src/lib/deviceId.ts`
- **Needs from owner:** Approval. Decision on offline name-prompt behavior (C1). Decision on device ID change and privacy policy update (C5).
- **How to verify:** Test error handling by simulating failures, verify input trimming/maxLength, confirm `.maybeSingle()` doesn't error on missing rows, check `onConflict` works, verify device ID generation.

## Step 17 (Group D) — First-launch RTL — [DONE]

- **Goal:** Ensure RTL is correctly applied on the very first launch, not just from the second launch onward.
- **Problem:** `app/_layout.tsx` calls `I18nManager.forceRTL(true)` but React Native only applies this after a restart, so fresh installs render LTR on first launch.
- **Actions:** Propose a fix (e.g. reload the app once after forcing RTL using `expo-updates` `reloadAsync()` in release builds, or an alternative). Ask owner before adding any dependency. Test on a real Android device or emulator with a clean install and report result.
- **Files:** `abr-mobile/app/_layout.tsx`, possibly `abr-mobile/package.json`
- **Needs from owner:** Approval before adding any dependency.
- **How to verify:** Clean install on emulator/device — first launch should be RTL.

## Step 18 (Group E) — Security risk assessment & explanation — [DONE]

- **Goal:** Explain the security risk of open RLS policies. Do NOT change any code without owner approval.
- **Problem:** `supabase/schema.sql` makes `readers`, `favorites`, `reading_progress`, and `ratings` fully open (`for all using (true)`). Anyone with the public anon key can read every reader's display name and delete/edit any device's favorites, progress, and ratings.
- **Actions:** Write a plain-language explanation of the risk and one proposed solution (e.g. send device ID as a request header, write RLS policies matching that header, use a DB view/function for aggregate ratings, keep admin dashboard working with authenticated read). List what would change in the app and the SQL. Ask owner whether to implement now or after release.
- **Files:** None (explanation only — no code changes until approved).
- **Needs from owner:** Decision on whether to implement now or post-release.
- **How to verify:** Owner reviews the explanation.

## Step 19 — Final check after all approved groups — [DONE]

- **Goal:** Verify the full project after all fixes and update documentation.
- **Actions:**
  - Re-run the Group A verification commands (`npm run build` in `abr-admin`, `npx tsc --noEmit` + `npx expo export --platform android` + `npx expo-doctor` in `abr-mobile`).
  - Update `CONTEXT.md`, `IMPLEMENTATION_PLAN.md`, and `README.md` if anything changed.
  - Provide a short summary of what was fixed and what was skipped.
- **Files:** `CONTEXT.md`, `IMPLEMENTATION_PLAN.md`, `README.md`
- **Needs from owner:** None.
- **How to verify:** Verification command output + owner review.
