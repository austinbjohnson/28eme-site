# Agent Notes

## House rules
This project follows the runbook at https://github.com/austinbjohnson/project-runbook
(private). Read its README before changing infrastructure, auth, deploys or the review
flow. If the repo isn't in your session, attach it (Claude: `add_repo`
austinbjohnson/project-runbook; other agents: clone it or read it on GitHub). Rules in
this file override the runbook where they conflict.

## Who you're working with
Austin Johnson (owner). Not a developer: explain in plain language and give
click-by-click dashboard steps.

## This project
- **What it is:** Static one-page consulting site for the 28eme studio (plain HTML/CSS in `index.html`, no build step).
- **Live:** https://28eme.ca (served by GitHub Pages, `main` branch, `/` root, per `CNAME` and `docs/technical/deployment.md`). `28eme.com` and `www.28eme.com` are meant to forward to `28eme.ca`.  **Previews:** none today (no Cloudflare, no CI). Phase B adds per-PR Previews.
- **Environment choice:** per-PR Previews only (provisional, matches the runbook's decision register). Not yet in place.
- **Cloudflare account:** none today. Target: Austin Personal (`e185e370ce62621cd51254db72065599`); not yet recorded in any `wrangler.jsonc` because none exists.
- **Workers:** none yet. **Data:** none (no D1/KV/R2; no backend).
- **DNS:** per `docs/technical/deployment.md`, `28eme.ca` and `28eme.com` DNS is at **Squarespace** (four A records to GitHub Pages IPs, `www` CNAME to `austinbjohnson.github.io`; `.com` uses Squarespace Domain Forwarding). Last verified in the repo on 2025-10-07; current state unknown — needs Austin.
- **Auth:** none (public site, no sign-in).
- **Analytics:** none found in `index.html`. Fonts load from Google Fonts.
- **Contact:** `mailto:hello@28eme.com` link only; no form. Email DNS for 28eme.com/.ca: unknown — needs Austin (do not touch MX/SPF/DKIM/DMARC).
- **Approves production:** Austin Johnson (owner per `docs/`); confirm.
- **Test command:** none (no `package.json`, no CI). Check by opening `index.html` locally at phone, iPad and desktop widths.
- **Pages to capture for review:** `/` (only page), plus `/404.html`.
- **API token / expiry reminder:** none yet.

## Existing repo notes (kept as found)
- `handoff.md` says this repo follows the shared workflow at the websites root (`../handoff/SESSION_NOTES.md`, `../REMINDER.md`). Those files are outside this repo and could not be read. Keep following `handoff.md`.
- Docs in `docs/` should start with status, owner, last updated and next review date (`docs/README.md`).
- Log DNS verification passes in `docs/log-oct-2025` after changes go live (`handoff.md`).
- Update DNS on both domains in one sitting (`docs/technical/deployment.md`).

## Exceptions to the runbook
| Runbook rule | This project today | Reason | Type |
|---|---|---|---|
| Host on Workers with static assets (Cloudflare) | GitHub Pages from `main` + `/` | Predates the runbook | Planned Phase B change |
| Domains and DNS in owner's Cloudflare account | DNS at Squarespace | Predates the runbook | Planned Phase B change (DNS cutover) |
| `www` 301s to the bare domain at Cloudflare | `www` CNAME to GitHub; `.com` uses Squarespace forwarding | Predates the runbook | Planned Phase B change |
| Deploys via Workers Builds from GitHub | Pages auto-publishes from `main` | Predates the runbook | Planned Phase B change |
| Per-PR private Previews behind Access | No previews | No Cloudflare yet | Planned Phase B change |
| `wrangler.jsonc` with `account_id`, `workers_dev`, `preview_urls` | No wrangler config | No Worker yet | Planned Phase B change |
| `.assetsignore` keeps repo-only files private | Every root file is public (`AGENTS.md`, `CLAUDE.md`, `handoff.md`, `docs/`, `README.md`) | Pages publishes the whole root | Planned Phase B change |
| Cloudflare Web Analytics | None | Not set up | Planned Phase B change |
| Keep repos private by default | Repo visibility unknown | Not verifiable from the checkout | Unknown — needs Austin |
| A test command in CI and Workers Builds | None | Static page, no tooling | Planned Phase B change (add a simple check) |
