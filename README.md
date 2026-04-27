# huozi-marketing

The public website for [huozi.app](https://huozi.app) — landing page, blog, cloud / edge product pages, docs, and the get-started funnel.

This is a separate Next.js app from the product code at [github.com/Dachein/huozi](https://github.com/Dachein/huozi). The split keeps the OSS product surface clean of brand-specific marketing copy: self-hosters of the Edge edition see only the product, never huozi.app's positioning.

## Routes

```
/                           Landing
/blog                       Blog index
/blog/<slug>                Posts
/cloud                      Cloud edition product page
/edge                       Edge edition product page
/docs                       Docs index (links out to GitHub)
/start                      Get-started funnel (install picker)
```

## Develop

```bash
npm install
npm run dev
# → http://localhost:3000
```

## Deploy

Cloudflare via OpenNext (same toolchain as the product repo):

```bash
npm run cf:deploy
```

In production `huozi.app` is served by **two Workers** behind a single domain. Cloudflare routes split paths between this marketing build and the product build by matching the most-specific pattern first:

```
huozi.app/                       →  huozi-marketing  (landing)
huozi.app/blog/*                 →  huozi-marketing
huozi.app/cloud                  →  huozi-marketing
huozi.app/edge                   →  huozi-marketing
huozi.app/docs                   →  huozi-marketing
huozi.app/start                  →  huozi-marketing

huozi.app/*                      →  huozi (product)   ← catch-all
```

### Wiring the routes

**Marketing worker (this repo)** — set the patterns in `wrangler.toml`:

```toml
name = "huozi-marketing"
main = ".open-next/worker.js"
compatibility_date = "2026-04-01"
compatibility_flags = ["nodejs_compat"]

routes = [
  { pattern = "huozi.app/",         custom_domain = false, zone_name = "huozi.app" },
  { pattern = "huozi.app/blog",     custom_domain = false, zone_name = "huozi.app" },
  { pattern = "huozi.app/blog/*",   custom_domain = false, zone_name = "huozi.app" },
  { pattern = "huozi.app/cloud",    custom_domain = false, zone_name = "huozi.app" },
  { pattern = "huozi.app/edge",     custom_domain = false, zone_name = "huozi.app" },
  { pattern = "huozi.app/docs",     custom_domain = false, zone_name = "huozi.app" },
  { pattern = "huozi.app/start",    custom_domain = false, zone_name = "huozi.app" },
]
```

(`custom_domain = false` here because we're using zone routes, not the per-Worker custom-domain dropdown — the latter binds the whole hostname.)

**Product worker (in the [huozi](https://github.com/Dachein/huozi) repo)** — same approach with the catch-all:

```toml
routes = [
  { pattern = "huozi.app/*", zone_name = "huozi.app" },
]
```

CF automatically picks the most-specific match for incoming requests, so `huozi.app/blog/foo` lands here and `huozi.app/workspace` lands on the product Worker. Verified by browsing both after the deploys.

### Why two Workers, one domain

Keeps the OSS product surface free of brand copy:

- **Self-hosters of the Edge edition** clone the product repo. They never see huozi.app's hero pitch, blog posts, or pricing positioning. Their `/` redirects to `/workspace`.
- **huozi.app visitors** see the brand site at `/`, `/cloud`, `/edge`, etc. and the product app at `/workspace`, `/login`, `/p/<slug>`, etc. — no rewiring needed; it's the same domain.
- **Marketing iteration is decoupled from product** — blog posts and product positioning ship on this repo's deploy cadence; the product ships on its own.

## License

Marketing copy and brand assets are © Dachein, all rights reserved. The
scaffold (Next.js, Tailwind, layout primitives) follows the MIT license
of the product repo.
