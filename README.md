# M.S Collection

Premium jewelry storefront built with React, TypeScript, Vite, Tailwind CSS and Supabase.

## Run locally

1. Install Node.js 20+.
2. Open this folder in VS Code.
3. Run `npm install`.
4. Copy `.env.example` to `.env`.
5. Add your Supabase URL, anon key and WhatsApp number.
6. Run `npm run dev`.

## Build

`npm run build`

The production output is `dist/`.

## Netlify

Build command: `npm run build`
Publish directory: `dist`

Add the same `VITE_...` variables under Netlify environment variables.

## Supabase

Run the SQL files in `supabase/migrations/` in order, then optionally run `supabase/seed/seed.sql`.
Never put a service-role key in the frontend.