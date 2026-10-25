# Hosting on Cloudflare

## Why Cloudflare
- **Generous free tiers.** Workers Free, D1, KV and R2 all have free allowances, and
  Zero Trust (Access) is free for small teams. Check the current numbers on each
  product's pricing page before relying on them.
- **AI built in.** Workers AI runs models on Cloudflare. AI Gateway sits in front of
  OpenAI, Anthropic and others, adding logging, caching, rate limits and spend control
  without new infrastructure.
- **One place** for DNS, hosting, data, sign-in for staff (Access) and email routing.

## Defaults

| Need | Use | Notes |
|---|---|---|
| Website or web app | **Workers with static assets** | Use this for new projects instead of Pages. Worker Previews (per-PR links) and Access work on it. |
| Database | **D1** | One database per environment. Export a backup before every migration. |
| Key-value, sessions, flags | **KV** | |
| Files and images | **R2** | No egress fees. |
| Background and scheduled work | Cron Triggers, Queues, Workflows | Check pricing first, since some of these are metered. |
| AI calls | **Workers AI**, or **AI Gateway** in front of external models | Always go through AI Gateway for external model APIs so usage is logged and limited. |
| Email to a domain | Cloudflare Email Routing | Free forwarding, e.g. `privacy@domain` → personal inbox. |
| Sign-in for staff only | Cloudflare Access | See [auth.md](auth.md). |
| Sign-in for real users | WorkOS AuthKit | See [auth.md](auth.md). |

Avoid unless Austin approves: Containers, paid Workers plan features, Logpush, Argo,
paid Images or Stream, and anything else with "per million" pricing without a free cap.

## Accounts
Keep a project in the account of whoever owns it, so they keep control if we step away.

| Account | Holds |
|---|---|
| Austin Personal | WiseSplit, Focus Please and Austin's own projects |
| Eru.potts@gmail.com's Account | emilypotts.ca (Emily owns it) |
| Abotj14@gmail.com's Account | Legacy. Don't add new projects here. |

Record the account ID in the project's `wrangler.jsonc` (`account_id`) so a deploy can't
land in the wrong account.

## Deploys
- Connect the GitHub repo to the Worker with **Workers Builds**. Merging to `main`
  deploys production, and every other branch gets a Preview. See
  [previews-and-review.md](previews-and-review.md).
- GitHub Actions with a scoped `CLOUDFLARE_API_TOKEN` is fine when a project needs extra
  gates, such as checking that `main` matches `staging`.
- **Never** run `wrangler deploy` from a laptop or chat session against production.
  Running `wrangler dev` locally is fine.
- Set `workers_dev` and `preview_urls` explicitly in the Wrangler config, because the
  defaults have changed several times. If a project turns either on, it also turns on
  Cloudflare Access for it (Worker → Settings → Domains & Routes → **Enable Cloudflare
  Access**).

## Cost gate
Do this before adding or enabling anything that could bill:
1. Read the official pricing page, then record the link and the date you checked in the PR.
2. Confirm it's free, or has a hard cap that fails safely when the free quota runs out.
3. If it could charge, stop. Tell Austin the feature, what triggers a charge, the worst
   case, and a free alternative, and wait for an explicit yes.
4. Never add a payment method, start a paid trial, change plan or buy credits.

Billing alerts aren't spending caps. Each account should still have a $1 billing alert
so a surprise is caught on day one.

## Secrets and tokens
- Store secrets with `wrangler secret put` or in the dashboard. Never commit them in
  `wrangler.jsonc`, `.env` or the repo.
- Give each project its own API token, scoped to one account and the permissions it
  needs (usually Workers Scripts Edit plus D1 Edit for its database), with an expiry
  date. Put the renewal date on Austin's calendar and note it in the project's `AGENTS.md`.
- Keep repos **private** by default.
- Static sites: add repo-only files (notes, config, source) to `.assetsignore` so they
  never get served.

## DNS
- Domains live in the owner's Cloudflare account, proxied (orange cloud) unless
  something requires otherwise.
- **Never change MX, SPF (`v=spf1`), DKIM, `apple-domain` or DMARC records** without the
  domain owner's sign-off. A mistake there silently stops their email.
- `www` should redirect permanently (301) to the bare domain, keeping the path and query.

## Observability
Use Workers Logs and Preview observability, which are free within limits, before
adding a third-party tool. Each Preview has its own logs, so check them when testing a PR.
