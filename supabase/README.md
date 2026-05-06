# CAUCASIAN SPIRIT Supabase Setup

1. Add environment variables to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. Run the migration in Supabase SQL editor:

`supabase/migrations/20260503150000_qoru_initial.sql`

3. Prototype-safe policy strategy:
- Reads are public for `products`, `product_media`, `drops`, `footer_links`.
- Writes are intentionally restricted.
- For local-only testing without auth, use the commented development policy block in the migration file.

4. Storage bucket:
- `product-images` is created by migration.
- Admin uploads store file metadata (`url`, `path`, `alt`, `sort_order`, `is_main`) in `product_media`.
