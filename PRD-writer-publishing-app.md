# Product Requirements Document
## ABR — Urdu Novel Reading App

**Version:** 2.0 (Revised — pivoted to client spec)
**Status:** Planning

---

## 1. Overview

ABR is a serialized novel/story reading platform for Urdu readers. A writer/publisher uploads novels broken into episodes; readers browse, read, track progress, rate, and favorite novels via an Android app. The writer manages everything through a full admin web panel with content management and analytics.

**Note:** This version supersedes the original flat "essay + category" concept. The app is now structured around novels and episodes, matching a client-provided reference design.

## 2. Goals

- Give the writer a complete platform to publish serialized fiction, episode by episode
- Give readers an app-quality experience: accounts, progress tracking, ratings, notifications
- Give the writer visibility into performance via an analytics dashboard
- Keep costs as low as possible given the increased scope (free-tier services wherever feasible)

## 3. Non-Goals (for v1)

- Multi-author / multi-publisher support (single writer only)
- Full responsive web reading experience (web = marketing + admin panel only; reading happens in the Android app)
- Payments / paywalls / in-app purchases
- Comments on episodes (ratings/reviews only, no threaded discussion, for v1)
- Push notifications (deferred — no notification triggers, screen, or infrastructure in this v1; can be added later)

## 4. Users & Roles

| Role | Description | Access |
|---|---|---|
| **Publisher (Writer)** | The single content owner | Admin Panel (web) — manage novels, episodes, view analytics |
| **Reader** | App end users | Android app — browse, read, rate, favorite, get notified. **No account required — identified per-device.** |

## 5. Platforms

- **Marketing website**: static landing page, no reader functionality — drives installs.
- **Android app**: the core reader product.
- **Admin Panel (web)**: writer-only dashboard — content management + analytics.

## 6. Visual Direction

- **Color scheme**: Navy blue (dark theme) with gold/amber accents.
- **Branding**: "ABR" wordmark with a book/quill logo mark.
- **Language**: Urdu (RTL) throughout the reader-facing app.
- **Typography note carried over from earlier design work**: use an Urdu-appropriate typeface (e.g. Noto Nastaliq Urdu) for Urdu text — do not rely on a Latin serif (like Literata) for Urdu content, as it will silently fall back to a generic font.

## 7. Core Screens (Android App)

1. **Splash Screen** — logo, branding
2. **Name Prompt (first launch only)** — asks the reader to enter a display name/username the first time they open the app; stored locally against their device ID and used across Profile/My Activity
3. **Home Screen** — features/highlighted novel, "continue reading" shelf, browse by novel
3. **Novel Details Screen** — cover, title, author, synopsis, rating, episode count, "start reading" CTA
4. **Episodes List Screen** — list of episodes for a novel, each with title, date, read/unread state
5. **Reading Screen** — episode content, font/theme controls, reading progress indicator, next/prev episode nav
6. **Search Screen** — search novels/episodes by title, author, category
7. **Favorites Screen** — saved/favorited novels
8. **Profile Screen ("My Activity")** — shows the reader's chosen username, their favorites, reading history, links to Settings. No login/email/password — name is collected once on first app open.
9. **Notifications Screen** — deferred, not in v1 (see Non-Goals)
10. **Settings Screen** — theme, account/device settings, privacy/policy links

## 8. Core Screens (Admin Panel — Web)

1. **Admin Login**
2. **Dashboard** — key stats (total novels, total episodes, total reads, average rating), performance chart (reads over time), category breakdown chart
3. **Novel Management** — create/edit/delete novels (title, cover, synopsis, category, status)
4. **Episode Management** — create/edit/delete episodes within a novel (title, body content, publish/draft status, order)
5. **Analytics** (may be part of Dashboard or separate) — deeper stats per novel/episode

## 9. Data Model (revised)

**Novel**
- id
- title
- author (writer name/pen name)
- synopsis
- cover_image_url
- category
- age_rating (optional, seen in reference design)
- status (draft / published)
- created_at / updated_at

**Episode**
- id
- novel_id (FK → Novel)
- title
- order (episode number/sequence)
- body (full text content)
- status (draft / published)
- published_at
- created_at / updated_at

**Favorite**
- id
- device_id
- novel_id (FK)
- created_at

**Reader** (local device profile — no login)
- device_id (primary identifier)
- username (collected once on first app open)
- created_at

**ReadingProgress**
- id
- device_id
- episode_id (FK)
- progress_percent / scroll_position
- last_read_at

**Rating**
- id
- device_id
- novel_id (FK)
- rating (1–5, editable — device can update their existing rating)
- created_at / updated_at

**Notification** (broadcast, since there are no reader accounts to target individually)
- id
- title / message
- related_novel_id / episode_id (optional)
- trigger_type (e.g. new_episode, announcement — full list TBD)
- created_at

## 10. Tech Stack (revised)

| Layer | Choice | Why |
|---|---|---|
| Database + Storage | **Supabase** (free tier) | Postgres DB, file storage for covers. No reader auth needed — readers identified by device ID. |
| Admin Panel | React (web) | Deploys free on Vercel/Netlify |
| Android app | React Native (Expo) or React + Capacitor | One codebase |
| Marketing website | Static site | Deploys free on Vercel/Netlify |
| Charts (Admin Dashboard) | Recharts or Chart.js | Free, works well in React |
| App distribution | Google Play Store | One-time $25 fee |

## 11. Costs (estimated)

- Google Play Store: **$25 one-time**
- Domain (optional): **~$10–15/year**
- Supabase, Vercel/Netlify, Firebase Cloud Messaging: **$0** at MVP-level traffic
- **Time cost is the real tradeoff here** — accounts, notifications, and analytics meaningfully increase build complexity vs. the original flat-content plan.

## 12. Decisions Made (round 2)

- **Reader accounts**: none — readers are identified per-device (no login), consistent with the original plan. This also means Profile screen (from the client reference) needs rethinking — likely becomes a lighter "My Activity" screen (favorites, history, settings) rather than an account/email screen.
- **Ratings**: readers can change their rating after submitting it (one rating per device per novel, editable).
- **Episode ordering**: auto-ordered (e.g. by creation/publish order), not manually set by the writer.
- **Theme**: app supports both dark and light themes, not navy-only.
- **Notifications**: more triggers than just "new episode" wanted — exact list still open (see below).

## 12a. Open Questions

- Does the writer need to see aggregate rating/favorite counts only, or any breakdown (e.g. ratings over time)?

## 13. Suggested Build Order (for vibecoding)

1. Set up Supabase: tables (Novel, Episode, Favorite, ReadingProgress, Rating) — no Auth needed
2. Build Admin Panel: login → Novel CRUD → Episode CRUD (get content flowing in first)
3. Build Android app: Splash → Home → Novel Details → Episodes List → Reading Screen (core reading loop)
4. Add device-based Favorites
5. Add device-based Reading Progress
6. Add device-based Ratings (editable) on Novel Details
8. Add Search
9. Add Settings screen
10. Build Admin Dashboard analytics (stats + charts) — can come last since it depends on real usage data existing
11. Build marketing website
12. Play Store listing + submit

## 14. Carried Over From Earlier Planning

- Custom-built admin UI (not relying on Supabase's raw table editor) — still the plan, now with more screens (Novel/Episode CRUD, Dashboard)
- Dark mode — the app is dark-themed (navy) by default in this design, so this may now just be *the* theme rather than a toggle — worth clarifying with the client if a light mode is also wanted
