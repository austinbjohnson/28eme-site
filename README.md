# Runbook: how we build and ship projects

This is the default setup for every Austin (and Emily) project. A project's own
`AGENTS.md` can override a rule here, but only by saying so explicitly and giving the reason.

**For agents:** read this whole file before changing infrastructure, auth, deploys or
review flow. Read the linked page before touching that area.

## The rules (short version)

1. **Cloudflare is the default home.** Use Workers with static assets for sites, D1/KV/R2
   for data, Workers AI or AI Gateway for AI calls. → [hosting.md](hosting.md)
2. **$0 first.** Never turn on anything that can bill without Austin's explicit OK for
   that specific cost. Check current official pricing every time instead of relying on memory. → [hosting.md#cost-gate](hosting.md#cost-gate)
3. **Auth for real users = WorkOS AuthKit.** Sign-in for just us (staging, admin,
   dashboards) = Cloudflare Access. Never write our own password system. → [auth.md](auth.md)
4. **Every change gets a preview before it goes live.** Each pull request gets its own
   private Preview link. → [previews-and-review.md](previews-and-review.md)
5. **The agent tests first, then proves it.** Before asking for review, the agent tests
   the change itself and sends screenshots (phone, iPad, desktop) plus a walkthrough
   video that plays on iPhone. A link alone is not a review. → [previews-and-review.md](previews-and-review.md)
6. **Production only after explicit approval.** "Approved for production" from Austin
   (or the project owner) in words. Silence or a thumbs-up doesn't count.
7. **Deploys come from GitHub, never from a laptop.** `main` = production. No
   `wrangler deploy` from a local machine or a chat session.
8. **Secrets never go in Git.** Use Wrangler secrets / dashboard variables, give each
   project its own narrowly scoped API token, and put a renewal reminder on the calendar
   before it expires.
9. **Don't touch email DNS** (MX, SPF, DKIM, DMARC) without the domain owner's sign-off.
10. **Explain in plain language.** Austin and Emily review from a phone. Say what changes
    for visitors and give dashboard steps click by click.

## Using this in a project

Add this to the top of the project's `AGENTS.md` (and make `CLAUDE.md` contain `@AGENTS.md`):

```md
## House rules
This project follows the runbook at https://github.com/austinbjohnson/runbook
(private). Read its README before changing infrastructure, auth, deploys or the review
flow. If the repo isn't in your session, attach it (Claude: `add_repo`
austinbjohnson/runbook). Rules in this file override the runbook where they conflict.
```

Then list only what's specific to the project: its Cloudflare account, Worker names,
domains, who approves production, and any exception to the runbook with the reason.

Starting from nothing? → [new-project.md](new-project.md)

## Pages

| Page | What it covers |
|---|---|
| [hosting.md](hosting.md) | Cloudflare defaults, accounts, data, AI, cost gate, secrets, DNS |
| [auth.md](auth.md) | Why WorkOS, how we configure it, when to use Cloudflare Access instead |
| [previews-and-review.md](previews-and-review.md) | Preview links, agent testing, screenshots and video, the review page |
| [new-project.md](new-project.md) | Checklist and `AGENTS.md` template for a new project |
| [tools/review-capture.mjs](tools/review-capture.mjs) | Script that makes the screenshots and MP4 walkthrough |

## Keeping this current

Facts and prices here were checked on 2026-10-25. Cloud products change quickly, so
re-check the official page before relying on a number. If you find this runbook is
wrong, open a PR here and fix it.
