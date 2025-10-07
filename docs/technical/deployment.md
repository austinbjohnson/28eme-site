# Deployment Checklist

**Status:** draft  
**Owner:** Austin Johnson  
**Last updated:** 2025-02-14  
**Next review:** 2025-03-15

1. Create GitHub repo `austinbjohnson/28eme-site` and push starter files.
2. Settings → Pages → “Deploy from a branch” (`main` + `/`).
3. Add primary custom domain `28eme.ca`; commit generated `CNAME` (this file will list the primary domain).
4. Update registrars for **both** `28eme.ca` and `28eme.com` (apex `A` records to GitHub IPs; `www` `CNAME` to `austinbjohnson.github.io` until GitHub issues the repo-specific Pages domain). Once one domain is primary, add the second as an alternate domain in Pages.
5. Verify HTTPS and run `curl -I https://28eme.ca` and `curl -I https://28eme.com` for 200 status codes.
6. Document go-live in personal site `docs/changelog.md` and consulting `docs/changelog.md` (create later).

## Notes
- Keep design assets in `public/` or a `/assets` folder under `src/`.
- Mirror typography/color decisions with the personal site for brand continuity.
- Consider adding a GitHub Action for HTML/CSS linting before deployment.
- After the primary domain is configured, use GitHub Pages advanced settings to add 28eme.com as an alternate domain pointing to the same repo.
- Update DNS on both domains in one sitting to reduce SSL reprovisioning time.
