# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> **Note from AGENTS.md:** This project uses Next.js 16, which has breaking changes from earlier versions. Before writing any Next.js-specific code, check `node_modules/next/dist/docs/` for current API conventions.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Static export to out/
npm run lint     # ESLint
```

Deploy (requires `S3_BUCKET` and `CF_DISTRIBUTION` env vars):
```bash
./scripts/deploy.sh
```

## Architecture

**Static-first campaign site** — no server runtime. `next.config.ts` sets `output: "export"`, so the build produces a fully static `out/` directory for S3/CloudFront hosting. All pages are Server Components; there are no Client Components except `Navbar` (needs `usePathname`).

### Data layer

All site content lives in [`src/lib/data.ts`](src/lib/data.ts) as typed TypeScript constants — no CMS, no database. To add/update content (timeline events, issues, site metadata), edit that file directly. `SITE_URL` must be updated from `https://ikpp.example.com` before production deploy.

### Pages and their content source

| Route | Content source |
|---|---|
| `/` | `timelineEvents` (last 4), `issues` (all 5) |
| `/timeline` | `timelineEvents` (all) |
| `/facts` | `issues` (all) |
| `/evidence` | Static placeholders — photos/docs go in `/public` then update this page |
| `/voices` | Static testimonials + form UI (form submit is unimplemented — needs backend API) |
| `/updates` | Hardcoded `updates` array in the file itself |
| `/action` | Static — SNS share URLs reference `SITE_URL` |

### Static export constraints

Because `output: "export"` is set:
- No API Routes or Route Handlers (except metadata routes with `export const dynamic = "force-static"`)
- `next/image` has `unoptimized: true` — images are served as-is
- `opengraph-image.tsx`, `sitemap.ts`, and `robots.ts` all require `export const dynamic = "force-static"`
- Future backend features (admin site, public APIs) must be separate services (e.g., API Gateway + Lambda), not Next.js API routes

### Deployment

GitHub Actions (`.github/workflows/deploy.yml`) deploys on push to `main` via OIDC to S3 + CloudFront invalidation. Required secrets: `AWS_DEPLOY_ROLE_ARN`, `AWS_REGION`, `S3_BUCKET_NAME`, `CLOUDFRONT_DISTRIBUTION_ID`, `NEXT_PUBLIC_API_BASE_URL`. See [`infra/cloudfront-s3.md`](infra/cloudfront-s3.md) for IAM setup.
