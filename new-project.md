# Starting a new project

## Checklist
- [ ] **Private GitHub repo** with `AGENTS.md` (template below) and `CLAUDE.md`
      containing `@AGENTS.md`.
- [ ] **Cloudflare account** chosen: the owner's account (see [hosting.md](hosting.md#accounts)).
- [ ] **Worker with static assets** created, with `account_id`, `workers_dev` and
      `preview_urls` set explicitly in `wrangler.jsonc`.
- [ ] **Workers Builds** connected: `main` deploys production and Previews are on
      (`npx wrangler preview`).
- [ ] **Cloudflare Access** on Preview URLs (and on `workers.dev` if it's enabled), with
      an email allow-list plus the agent service token.
- [ ] **Separate data for Previews:** a staging D1 or an isolated one, never production.
- [ ] **Domain** added to the owner's account, with a `www` → apex 301 redirect.
- [ ] **Auth**, if users sign in: WorkOS with Staging and Production environments,
      Google plus email codes, secrets in Wrangler (see [auth.md](auth.md)).
- [ ] **API token** scoped to this project, with its expiry date on the calendar.
- [ ] **$1 billing alert** on the account, if it doesn't have one yet.
- [ ] **A test command** (`npm test` or similar) that runs in both CI and Workers Builds.
- [ ] **First PR** goes through the full review flow, so the pipeline is proven before
      there's real work to ship.

## `AGENTS.md` template

```md
# Agent Notes

## House rules
This project follows the runbook at https://github.com/austinbjohnson/runbook
(private). Read its README before changing infrastructure, auth, deploys or the review
flow. If the repo isn't in your session, attach it (Claude: `add_repo`
austinbjohnson/runbook). Rules in this file override the runbook where they conflict.

## Who you're working with
<owner(s)>. Not developers: explain in plain language and give click-by-click
dashboard steps.

## This project
- **What it is:** <one line>
- **Live:** <https://...>  **Previews:** per PR (link posted on the PR)
- **Cloudflare account:** <name> (ID in `wrangler.jsonc`)
- **Workers:** <names>  **Data:** <D1/KV/R2 names; which one Previews use>
- **Auth:** <WorkOS environments / Access / none>
- **Approves production:** <name(s)>
- **Test command:** `<npm test>`  **Pages to capture for review:** `/`, `<...>`

## Exceptions to the runbook
- <rule> — <why>
```
