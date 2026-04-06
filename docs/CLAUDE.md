# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a static personal website built with plain HTML, CSS, and JavaScript. No build system, bundler, or test framework is used.

## Development

Open `index.html` directly in a browser to preview changes.

## Deployment

The site deploys automatically to GitHub Pages via GitHub Actions on push to `main`.

- **Deploy action**: `.github/workflows/deploy.yml`
- **Deploy branch**: `gh-pages`
- **Deployment method**: SSH deploy key (configured via `secrets.DEPLOY_KEY`)

### Manual Deploy

```bash
git push origin main
```

GitHub Actions handles the rest automatically.

## Architecture

- **Root level**: HTML pages (`index.html`, `resume.html`, `photos.html`, etc.)
- **`styles/`**: CSS files for styling
- **`js/`**: JavaScript files
- **`未命名/`**: Duplicate/backup copy - do not modify

## Git LFS

Large binary files (images) are tracked with Git LFS. After cloning:
```bash
git lfs install
git lfs pull
```

## Key Files

- `CNAME` - Custom domain configuration for GitHub Pages
- `.nojekyll` - Required for GitHub Pages to process this as a static site
