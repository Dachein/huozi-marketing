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

In production huozi.app is served by **two Workers** behind a single domain — Cloudflare routes split paths between this marketing build and the product build:

```
huozi.app/{,/blog,/cloud,/edge,/docs,/start}*   →   huozi-marketing
huozi.app/*                                      →   huozi (product)
```

(Configured at the CF Pages / Workers layer; see the deploy notes in the product repo.)

## License

Marketing copy and brand assets are © Dachein, all rights reserved. The
scaffold (Next.js, Tailwind, layout primitives) follows the MIT license
of the product repo.
