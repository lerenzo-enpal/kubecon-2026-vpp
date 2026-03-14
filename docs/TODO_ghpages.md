# GitHub Pages Deployment Plan

Repo: `lerenzo-enpal/kubecon-2026-vpp`
Presentation source: `presentation/`

---

## 1. vite.config.js -- Set the base path

GitHub Pages serves project sites at `https://lerenzo-enpal.github.io/kubecon-2026-vpp/`.
Vite needs to know this so asset paths in the built HTML are correct.

**Change required** in `presentation/vite.config.js`:

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/kubecon-2026-vpp/',
  server: { port: 3000 },
});
```

The key addition is `base: '/kubecon-2026-vpp/'`.

---

## 2. package.json -- No mandatory changes

The existing `build` script (`vite build`) is sufficient. Optionally add a
convenience script for local preview with the correct base:

```jsonc
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "build:ghpages": "vite build --base=/kubecon-2026-vpp/"
}
```

The `build:ghpages` script is only useful if you want to keep `base` out of
`vite.config.js` and pass it at build time instead. Either approach works; the
workflow below assumes `base` is set in the config file.

---

## 3. GitHub Actions workflow

Create `.github/workflows/deploy-presentation.yml` at the **repo root**:

```yaml
name: Deploy Presentation to GitHub Pages

on:
  push:
    branches: [main]
    paths:
      - 'presentation/**'

  # Allow manual trigger from Actions tab
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
          cache-dependency-path: presentation/package-lock.json

      - name: Install dependencies
        working-directory: presentation
        run: npm ci

      - name: Build
        working-directory: presentation
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: presentation/dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 4. Step-by-step instructions

### One-time setup

1. **Enable GitHub Pages in repo settings**
   - Go to Settings > Pages.
   - Under "Build and deployment", set Source to **GitHub Actions**.

2. **Add `base` to vite.config.js**
   - Add `base: '/kubecon-2026-vpp/'` as shown in section 1 above.

3. **Generate a lockfile** (if one does not already exist)
   ```bash
   cd presentation && npm install
   ```
   Commit the resulting `package-lock.json`; the workflow uses `npm ci` which
   requires it.

4. **Create the workflow file**
   ```bash
   mkdir -p .github/workflows
   ```
   Copy the YAML from section 3 into
   `.github/workflows/deploy-presentation.yml`.

5. **Commit and push**
   ```bash
   git add presentation/vite.config.js .github/workflows/deploy-presentation.yml presentation/package-lock.json
   git commit -m "ci: add GitHub Pages deployment for presentation"
   git push
   ```

### Verify

- Go to the **Actions** tab in GitHub; the "Deploy Presentation to GitHub
  Pages" workflow should be running.
- Once it completes, the presentation will be live at:
  `https://lerenzo-enpal.github.io/kubecon-2026-vpp/`

### Subsequent updates

Any push to `main` that changes files under `presentation/` will automatically
rebuild and redeploy. You can also trigger a deploy manually from the Actions
tab via `workflow_dispatch`.

---

## Notes

- The workflow uses the official `actions/deploy-pages` approach (no `gh-pages`
  branch needed). This is the recommended method as of 2025+.
- If you later want a custom domain, add a `CNAME` file inside
  `presentation/public/` and update the `base` in vite.config.js to `/`.
