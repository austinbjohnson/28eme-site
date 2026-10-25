# Previews and review

**Goal:** Austin can review any change from his phone or iPad in about two minutes and
trust that it was actually tested.

## What Austin gets for every change

The agent sends all of this **before** asking for approval:

1. **A review page:** a private claude.ai link that opens on a phone, holding everything
   below on one screen.
2. **Screenshots:** every changed page on phone, iPad and desktop. Include before and
   after when the change is visual.
3. **A walkthrough video:** an MP4 that plays inline on iPhone, clicking through the
   changed flow the way a visitor would.
4. **The Preview link:** the real change running live, private behind Cloudflare Access.
5. **A plain-language summary:** what changed for visitors, what was tested and passed,
   what couldn't be tested and why, and exactly what to look at.

A link with no evidence is not a review request. If the agent couldn't test something,
such as a real login or a real payment, it says so plainly.

## 1. Preview links (Cloudflare Worker Previews)

Every pull request gets its own Preview URL that updates on every push. Workers Builds
posts it on the PR within seconds.

**Setup, once per Worker:**
1. Connect the repo: Workers & Pages → the Worker → Settings → Builds → **Connect**.
   Set the production branch to `main`.
2. Turn on Preview builds and set the Preview command to `npx wrangler preview`.
   Wrangler must be at version 4.135 or newer.
3. In **Previews Base**, decide which resources Previews share and which they isolate.
   **Previews must not write to production data**, so give them their own D1 database
   or point them at a staging one.
4. Protect them: Settings → Domains & Routes → Preview URLs → **Enable Cloudflare
   Access**. Add the service token policy so agents can test (see [auth.md](auth.md)).
5. If a Preview signs users in, point it at the WorkOS **Staging** environment.

**When to use a staging site instead:** a site owned by a non-developer, like
emilypotts.ca, can keep one fixed `staging.` site (merge to `staging`, review, then
promote `staging` → `main`). This is fine when the owner prefers one place to look. The
evidence rules below still apply.

## 2. The agent tests first
Before asking for review, the agent:
- Runs the project's own checks: tests, typecheck, lint and build.
- Runs the change locally (`wrangler dev`) **and** on the Preview URL once it's up.
- Clicks through the changed flow in a real browser at phone, iPad and desktop sizes,
  watching for console errors, failed requests and pages that scroll sideways.
- Checks the Preview's logs in the Cloudflare dashboard if anything looks off.
- Fixes what it finds before asking for review, instead of passing problems on.

## 3. Screenshots and video
Use [`tools/review-capture.mjs`](tools/review-capture.mjs). Playwright and ffmpeg are
already installed in Claude cloud sessions.

```sh
# Simple: visit pages, screenshot each at 3 sizes, record a scrolling phone walkthrough
node tools/review-capture.mjs --url "$PREVIEW_URL" --pages /,/pricing,/contact --out review-out

# Flow: script the clicks (see the header of the tool for the steps-file format)
node tools/review-capture.mjs --url "$PREVIEW_URL" --steps review-steps.mjs --out review-out
```

With `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET` set, it gets through Access to
private Previews. The output is a set of JPEG screenshots (`-top` is the first screen,
which reads well on a phone; `-full` is the whole page), a `walkthrough.mp4` (H.264,
plays inline on iPhone and iPad) and a `summary.json` listing any console errors,
failed requests or sideways scrolling. **Look at the screenshots yourself before sending
them.** The script checks that the page loads, not that it looks right.

For a real flow (add an expense, submit a form), write a steps file rather than relying
on the default scroll-through. A visitor's path is what Austin needs to see.

## 4. Delivering it for phone review
In order of preference:
1. **Review page artifact:** publish a private claude.ai artifact holding the summary,
   Preview link, screenshots (phone first) and the MP4. Upload the files as artifact
   assets so it stays under the size limit. Put its link in the PR description.
2. **Files in the chat:** also send the MP4 and the key screenshots with the session's
   send-file tool, so they appear right in the Claude app.
3. **PR description:** always include the Preview link, the review page link and the
   summary. GitHub tools in agent sessions usually can't attach images, which is why
   the review page exists.

**Never** commit screenshots or videos to the repo, and never put them anywhere public.
Previews of a real app can show real data, so use test data in Previews.

## PR description template

```md
## What changes for visitors
<one or two plain sentences>

## Review it
- **Review page (phone-friendly):** <claude.ai link>
- **Live preview:** <Preview URL> (sign in with your email code)

## What I tested
- [x] <flow> on phone, iPad, desktop: passed
- [x] Tests, typecheck, lint, build: passed
- [ ] <anything not tested, and why>

## What to check
1. <the specific thing a human should judge>

## Cost check
<"No new paid services", or the pricing link and date checked>
```

## Approval
Ship only after Austin, or the project's named approver, says something like "approved
for production" for **this** version. Changes requested → new commit → new evidence →
ask again.
