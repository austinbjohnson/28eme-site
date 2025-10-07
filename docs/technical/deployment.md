# Deployment Checklist

**Status:** draft  
**Owner:** Austin Johnson  
**Last updated:** 2025-02-14  
**Next review:** 2025-03-15

1. Create GitHub repo `austinbjohnson/28eme-site` and push starter files.
2. Settings → Pages → “Deploy from a branch” (`main` + `/`).
3. Add primary custom domain `28eme.ca`; commit generated `CNAME` (this file will list the primary domain).
4. Squarespace DNS: point `28eme.ca` apex to GitHub Pages IPs (four A records) and `www` → `austinbjohnson.github.io`. For `28eme.com`, remove Squarespace defaults and then use Domain Forwarding to permanently redirect both apex + `www` to `https://28eme.ca` (Squarespace would not save the forwarding rule while GitHub A records were present).
5. Verify HTTPS and run `curl -I https://28eme.ca`, confirm `https://28eme.com` and `https://www.28eme.com` 301 to the `.ca` domain before yielding.
6. Document go-live in personal site `docs/changelog.md` and consulting `docs/changelog.md` (create later).

## Notes
- Keep design assets in `public/` or a `/assets` folder under `src/`.
- Mirror typography/color decisions with the personal site for brand continuity.
- Consider adding a GitHub Action for HTML/CSS linting before deployment.
- GitHub currently hides the additional-domain UI for this repo; rely on Squarespace forwarding for `28eme.com` until that option appears or we need to use the API flow.
- Update DNS on both domains in one sitting to reduce SSL reprovisioning time; note that Squarespace forwarding requires removing their DNS defaults first.
