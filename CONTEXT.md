# CONTEXT.md — ABR Project Context

## 1. Overview & Audience
- **What ABR is:** A serialized Urdu novel reading and publishing platform.
- **Audience:**
  - **Readers:** Urdu novel enthusiasts using the mobile app (`abr-mobile`). No email/password login is required; readers are identified entirely by a stable device ID, with a display name captured once on first launch.
  - **Writer/Publisher:** A single content author using the admin web dashboard (`abr-admin`) protected by Supabase Auth to publish novels and episodes and monitor analytics.

## 2. Key Product Rules & Non-Goals
- **Key Product Rules:**
  - Readers never see login/signup/email prompts. A one-time name prompt occurs on first launch and saves locally/remotely against device ID.
  - Episode order is automatic (by creation/publish order) — no manual reordering in v1.
  - Reader ratings are editable (one rating per device per novel, upserted on subsequent submissions).
  - Theme switching supports both Dark mode (default navy) and Light mode ("book paper" warm cream), controllable via Settings and defaulting to system theme.
- **Non-Goals (v1):**
  - No payments or paywalls.
  - No comments or threaded discussions (ratings/reviews only).
  - No push notifications infrastructure or sending logic (Notification table exists in DB for schema completeness, but no runtime delivery).
  - Single writer only (no multi-author support).

## 3. Tech Stack & Architecture
- **Backend & Database:** Supabase (PostgreSQL + File Storage on free tier).
- **Mobile App (`abr-mobile`):** React Native + Expo (Expo Router), RTL layout forced globally, Noto Nastaliq Urdu for Urdu text, Inter for UI metadata/labels.
- **Admin Panel (`abr-admin`):** React (web) + Vite + TypeScript, English/LTR interface, Inter font, Recharts for analytics.

## 4. Design System Summary
- **Dark Theme (Default):**
  - Background/Surface: `#08122d`
  - Surfaces tiers: `#040c28`, `#111a36`, `#151e3a`, `#202945`, `#2b3451`, `#2f3856`
  - Text (`on-surface`): `#dce1ff`, Variant: `#c6c6ce`
  - Primary / Accent (Silver-lilac): `#bfc5e4`
  - Secondary / Gold Accent (Primary CTA, active states, ratings): `#e9c176`
- **Light Theme ("Book Paper" Mode):**
  - Background: `#f6f1e7`
  - Surfaces: `#efe8d8`, `#e7ded0`
  - Text: `#2a2418`, Variant: `#6b6255`
  - Gold Accent (Antique Gold): `#c5a059`
- **Shape & Elevation Rules:**
  - NO shadows, NO blur, NO glassmorphism.
  - Depth shown via surface container tiers + 1px solid borders (`outline-variant` or gold accent when active).
  - Small corner radius everywhere: 4px–6px. Never use fully-rounded "pill" shapes (even for tags/chips).
  - Thin line icons (Material Symbols Outlined weight 1-1.5px), filled only when toggled active.

## 5. Data Model Summary (Supabase)
- `novels`: id, title, author, synopsis, cover_image_url, category, age_rating, status, created_at, updated_at
- `episodes`: id, novel_id, title, "order", body, status, published_at, created_at, updated_at
- `favorites`: id, device_id, novel_id, created_at (unique constraint on device_id + novel_id)
- `readers`: device_id, username, created_at
- `reading_progress`: id, device_id, episode_id, progress_percent, scroll_position, last_read_at (unique on device_id + episode_id)
- `ratings`: id, device_id, novel_id, rating (1-5), created_at, updated_at (unique on device_id + novel_id)
- `notifications`: id, title, message, related_novel_id, related_episode_id, trigger_type, created_at

## 6. Screens & Design References Mapping
All screen designs reside in `stitch_abr_premium_urdu_reader/`:
- **Admin Panel:**
  - Login: `abr_admin_login/screen.png` (or admin shell login)
  - Dashboard: `abr_admin_dashboard/screen.png`
  - Novel Management: `abr_admin_novel_management/screen.png`
  - Episode Management: `abr_admin_episode_management/screen.png`
- **Mobile Reader App:**
  - Splash Screen: `abr_splash_screen/screen.png`
  - Name Prompt: `abr_name_prompt/screen.png`
  - Home Screen: `abr_home_dark/screen.png`
  - Novel Details: `abr_novel_details/screen.png`
  - Episodes List: `abr_episodes_list/screen.png`
  - Reading Screen (Dark & Light): `abr_reading_dark/screen.png`, `abr_reading_light/screen.png`
  - Search Screen: `abr_search/screen.png`
  - Favorites Screen: `abr_favorites/screen.png`
  - Profile / My Activity: `abr_profile_my_activity/screen.png`
  - Settings Screen: `abr_settings/screen.png`

## 7. Gaps & Clarifications
- Note that `stitch_abr_premium_urdu_reader/` contains the exact reference images and mockups (`screen.png` and `code.html`) for all screens specified in the PRD and instructions.
- The design references use `stitch_abr_premium_urdu_reader` as the parent folder instead of `design-reference/`, which is fully compatible with instructions.md.
