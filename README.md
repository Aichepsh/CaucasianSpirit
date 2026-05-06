# CAUCASIAN SPIRIT Catalog

Mobile-first fashion catalog prototype on Next.js + Supabase.

## Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase Postgres + Storage
- Local fallback data when Supabase is not configured

## Requirements

- Node.js 18.18+ (recommended Node.js 20 LTS)
- npm 9+

## Quick Start

1. Install dependencies:

```bash
npm install
```

2. Create `.env.local` in project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. Run dev server:

```bash
npm run dev
```

4. Open:

- `http://localhost:3000` (site)
- `http://localhost:3000/admin` (admin panel)

## NPM Scripts

- `npm run dev` - start development server
- `npm run build` - production build
- `npm run start` - run production build locally
- `npm run lint` - run ESLint

## Supabase Setup

Project uses:
- Postgres tables for products, drops, footer links, media metadata
- Storage bucket `product-images` for actual image files

### 1) Apply schema migration

Run SQL from:

- `supabase/migrations/20260503150000_qoru_initial.sql`

This creates:
- `drops`
- `products`
- `product_media`
- `footer_links`
- bucket `product-images`
- indexes + base RLS policies

### 2) Optional development write policies

For local prototype admin writes without auth, run:

- `supabase/migrations/20260504001000_dev_admin_write_policies.sql`

Important:
- This is development-only.
- Do not keep open write policies in production.

### 3) Seed data (optional)

Run:

- `supabase/seed.sql`

It inserts initial drop/products/media/footer links.

## Environment Variables

Required for Supabase mode:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

When variables are missing, app shows a setup notice and uses local fallback content.

## Project Structure

- `app/` - routes and pages
- `components/` - UI and feature components
- `lib/db/` - Supabase read/write logic
- `lib/supabase/` - client/server Supabase helpers
- `lib/storage/` - Storage upload helpers
- `data/` - local fallback seed
- `types/` - shared TypeScript models
- `supabase/` - SQL migrations and seed

## Image Flow

- Product and drop images are uploaded to Supabase Storage bucket `product-images`.
- Database stores only metadata and public URLs:
  - `url`
  - `path`
  - `alt`
  - `sort_order`
  - `is_main`

Admin behavior:
- Product is created only on explicit save.
- Drop hero image can be selected with preview and uploaded on `Save`.

## Common Issues

### Styles look broken in dev

If CSS seems missing after running build/dev repeatedly:

1. Stop all local Next.js processes on port 3000.
2. Start again:

```bash
npm run dev
```

3. Hard refresh browser tab.

### Admin save fails

Check:
- `.env.local` exists and values are valid
- Supabase migration is applied
- write policies are enabled for your current environment strategy

## Production Notes

- Replace dev write policies with proper Supabase Auth + strict RLS.
- Avoid public write access to tables and storage.
- Prefer signed upload flows for media in production.

## Additional Docs

- Supabase-focused notes: `supabase/README.md`
