# Sign-in (auth)

## The decision
| Who signs in | Use |
|---|---|
| **Real users** of an app (WiseSplit, Focus Please, anything public) | **WorkOS AuthKit** |
| **Only us**: staging sites, Previews, admin pages, dashboards, home tools | **Cloudflare Access** |
| A one-off script or bot reaching a protected site | Cloudflare Access **service token** |

Never build our own password storage, reset emails or session crypto.

## Why WorkOS AuthKit (checked 2026-10-25)
- **Free up to 1 million monthly active users.** That covers everything we're likely to
  build. Social login (Google, Apple), email codes ("Magic Auth"), passkeys and MFA are
  included.
- **Hosted sign-in pages.** WorkOS runs the login UI and account security. Our Worker
  only handles the callback and a sealed session cookie, so there's very little auth code
  to get wrong.
- **Room to grow.** If a project ever sells to businesses, enterprise SSO and directory
  sync are add-ons on the same setup, with no migration.
- **Already working** in WiseSplit and Focus Please, so we reuse the pattern.

**Alternatives considered:**

| Option | Why not the default |
|---|---|
| Clerk | Nicer drop-in React components, but its free tier is far smaller than WorkOS's, and it costs more as you grow. |
| Better Auth (open source, runs in our Worker on D1) | Free with no vendor, but we would own security patches, email delivery and abuse protection. That's too much to maintain for non-developer owners. Reconsider only if WorkOS pricing changes. |
| Auth0, Firebase, Supabase Auth | Smaller free tiers or a different cloud. Nothing they offer outweighs that for us. |
| Cloudflare Access for real users | Built for staff, not customers: free only for small seat counts, with no sign-up flow. |

**Costs to stay away from** (each needs Austin's explicit approval): custom auth domain
(about $99/month), enterprise SSO or SAML connections (about $125 per connection per
month), Directory Sync, audit-log streaming, SMS, or any traffic tier beyond the free
allowance.

## How we configure WorkOS
1. **Two WorkOS environments per project.** *Staging* serves local development and
   Previews, and *Production* serves the live domain. Never point a Preview at
   Production keys.
2. **Redirect URIs.** Production gets the exact live callback, such as
   `https://use.example.com/auth/callback`. Staging gets `http://localhost:*/auth/callback`
   and the Preview hostname pattern. WorkOS allows wildcards in Staging. Check the exact
   syntax in the dashboard before relying on it.
3. **Providers.** Use Google by default and add Email codes as a backup. Add **Sign in with Apple
   before any iOS App Store submission**, because App Review guideline 4.8 requires it
   when Google login is offered.
4. **Server-side only.** The WorkOS API key, client ID and cookie password live in
   Wrangler secrets, and the browser never sees the API key. Use sealed sessions in an
   `HttpOnly`, `Secure`, `SameSite=Lax` cookie.
5. **Fail closed.** If any WorkOS setting is missing, sign-in and API writes return an
   error rather than letting people in.
6. **Same-site redirects.** Finish sign-in on the same hostname the app runs on. A
   cross-site redirect at the end of login is what broke Focus Please's sign-in in
   October 2026.
7. **Every PR that touches auth** records which WorkOS features it uses, the pricing page
   checked with the date, and confirmation that no paid add-on was enabled.

Dashboard changes in WorkOS, such as adding a redirect URI or turning on a provider,
are Austin's to make. Agents give the exact value and click-by-click steps.

## How we configure Cloudflare Access
- **Login method:** One-time PIN to email. It works on a phone with no extra accounts.
- **Policy:** Allow only named emails, e.g. Austin's, plus Emily's for her projects.
- **Previews:** Turn on Access once per Worker (Settings → Domains & Routes → **Enable
  Cloudflare Access** for Preview URLs). All Previews in the account share one policy.
- **Agents and tests:** Create a service token (Zero Trust → Access controls → Service
  credentials → **Create Service Token**). Add a **Service Auth** policy that includes it,
  and give agents `CF_ACCESS_CLIENT_ID` and `CF_ACCESS_CLIENT_SECRET` as environment
  secrets. Set a 1-year expiry and put the renewal date on the calendar.
- In the Worker, validate the `Cf-Access-Jwt-Assertion` header whenever the code relies
  on who the user is.
