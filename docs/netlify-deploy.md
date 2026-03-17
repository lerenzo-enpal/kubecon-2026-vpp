# Netlify Deployment

## Manual Deploy (CLI)

> **Note:** Manual deploys are fine for quick previews or urgent fixes, but for regular workflows prefer CI/CD (GitHub Actions) so deploys are tied to commits, reviewable, and reproducible.

### Prerequisites

1. Create a personal access token at https://app.netlify.com/user/applications#personal-access-tokens
2. Set it as an environment variable:

```bash
export NETLIFY_AUTH_TOKEN=<your-token>
```

### Deploy

From the repo root:

```bash
cd presentation && npm run build && npx netlify deploy --prod --dir=dist
```

If the site isn't linked yet, it will prompt you to select or create one. You can skip the prompt with:

```bash
npx netlify deploy --prod --dir=dist --site=<site-id>
```

Find your site ID in the Netlify dashboard under **Site configuration > General > Site ID**.

### Preview Deploy (non-production)

To deploy a preview URL without touching production:

```bash
cd presentation && npm run build && npx netlify deploy --dir=dist
```

## CI/CD Setup (GitHub Actions)

Set repository secrets:

```bash
gh secret set NETLIFY_AUTH_TOKEN
gh secret set NETLIFY_SITE_ID
```

These are repo-scoped (all workflows can access them). To restrict to a specific environment:

```bash
gh secret set NETLIFY_AUTH_TOKEN --env production
gh secret set NETLIFY_SITE_ID --env production
```
