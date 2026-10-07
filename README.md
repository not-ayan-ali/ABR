# ABR — Urdu Novel Reading & Publishing Platform

ABR is a serialized Urdu novel reading and publishing platform consisting of two projects:
1. **`abr-admin`**: A web dashboard for the writer to manage novels and episodes and view analytics. Built with React, Vite, TypeScript, and Tailwind CSS.
2. **`abr-mobile`**: The reader-facing mobile application built with React Native and Expo (Expo Router), featuring RTL support, Noto Nastaliq Urdu typography, device-based profiles, reading progress tracking, favorites, and themes.

---

## Getting Started Locally

### Prerequisites
- Node.js (v18+)
- Supabase account & project

### 1. Supabase Setup
1. Create a Supabase project.
2. Run the SQL script found in `supabase/schema.sql` in the Supabase SQL Editor
   (it creates the tables, RLS policies, `updated_at` triggers, the
   `novel-covers` storage bucket, and its access policies).
3. The `novel-covers` bucket is created public by the script; cover uploads are
   restricted to the authenticated writer via RLS.

### 2. Running `abr-admin`
```bash
cd abr-admin
npm install
cp .env.example .env   # then fill in your Supabase project URL and anon key
npm run dev
```

### 3. Running `abr-mobile`
```bash
cd abr-mobile
npm install
cp .env.example .env   # then fill in your Supabase project URL and anon key
npx expo start
```

> **Environment variables:** both apps read their Supabase project URL and
> public anon key from environment variables (`VITE_SUPABASE_URL` /
> `VITE_SUPABASE_ANON_KEY` in `abr-admin`, `EXPO_PUBLIC_SUPABASE_URL` /
> `EXPO_PUBLIC_SUPABASE_ANON_KEY` in `abr-mobile`). Each project ships a
> `.env.example`; copy it to `.env` and fill in the values from your Supabase
> dashboard (Project Settings > API). `.env` files are git-ignored — never
> commit them, and never use a `service_role` key in either app.

---

## Deployment

### Deploying `abr-admin` to Netlify
`abr-admin` includes a `netlify.toml` (build command `npm run build`,
publish dir `dist`). Deploy with either:

```bash
cd abr-admin
npm install
npm run build          # produces dist/
# then drag dist/ into Netlify Drop, or connect the repo in the Netlify UI
```

**Important:** Netlify does not read `.env` files at build time. Set the
variables in the Netlify dashboard (Site settings > Environment
variables): `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.

### Building `abr-mobile` for release
`eas.json` is configured (`production` profile builds an Android App
Bundle). Run:

```bash
cd abr-mobile
npx eas-cli build --profile production
```

---

## Tech Stack
- **Backend:** Supabase (PostgreSQL & Storage)
- **Admin Web:** React, Vite, TypeScript, Tailwind CSS, Lucide Icons, Recharts
- **Mobile App:** React Native, Expo, Expo Router, AsyncStorage
