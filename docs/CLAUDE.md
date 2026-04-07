# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static personal website built with plain HTML, CSS, and JavaScript. No build system, bundler, or test framework.

## Development

Open `index.html` directly in a browser to preview changes. No build step required.

## Deployment

Push to `main` triggers automatic deployment to GitHub Pages via `.github/workflows/deploy.yml`. The workflow uses an SSH deploy key (`secrets.DEPLOY_KEY`) to push to the `gh-pages` branch.

## Architecture

### Root Level HTML Pages
- `index.html` - homepage (contains social media dropdown navigation)
- `resume.html` - resume/CV
- `photos.html` - photography gallery hub
- `photos-*.html` - photography sub-pages (fullscreen gallery with vertical scroll navigation)
- `agents.html` - AI agents projects
- `projects.html` - personal projects (dark cinematic theme)
- `about game.html` - game page embedded via iframe in projects.html

### Styles (`styles/`)
- `main.css` - shared styles including navigation dropdown
- `xinjiang-gallery.css` - premium dark cinematic gallery (shared across 11 photo pages)
- `photography.css` - legacy gallery styles (being phased out)
- `fullscreen-gallery.css` - legacy fullscreen viewer (being phased out)
- `projects.css` - dark theme for projects page
- `background.css` / `animation-background.css` - animated backgrounds
- `agents.css`, `resume.css`, `photos.css` - page-specific styles

### JavaScript (`js/`)
- `xinjiang-gallery.js` - shared gallery interaction logic (22KB, used by 11 photo pages)
- `image-error-handler.js` - handles broken images
- `background-animation.js` - animated background effects
- `fix-avatar-image.js` - avatar image fixes
- `main.js` - shared functionality

## Photography Gallery Pattern

### New Xinjiang Gallery Pattern (11 pages)
`photos-travel.html`, `photos-suipai.html`, `photos-street.html`, `photos-portrait.html`, `photos-night.html`, `photos-life.html`, `photos-landscape.html`, `photos-food.html`, `photos-bw.html`, `photos-autumn.html`, `photos-architecture.html`

Uses shared `xinjiang-gallery.css` and `xinjiang-gallery.js`:
- `.xinjiang-gallery` container with `.xg-*` prefixed classes
- Keyboard navigation (↑↓ navigate, i for info, f for fullscreen, Esc to close)
- Auto-hiding UI with 3-second inactivity timeout
- Touch zone navigation (left/right edge tap zones)
- Progress bar with segment indicators
- Photo zoom/lightbox overlay
- `.xg-photo` elements with `data-*` attributes for metadata

### Legacy Pattern
`photos.html` - gallery hub page

## Navigation Dropdown

The "小红书 | Red" dropdown in the header shows social media platforms. CSS and hover behavior are in `main.css`. Only `index.html` retains the dropdown functionality; other pages use simple links.

## Style Modification Constraints

**`projects.html`** - Do not modify existing styles; only add or adjust styles on top of the existing design.

## Git LFS

Images are tracked with Git LFS. After cloning:
```bash
git lfs install
git lfs pull
```

## Key Files

- `CNAME` - Custom domain for GitHub Pages
- `.nojekyll` - Required for GitHub Pages processing
- `.claude/` - Contains memory and settings
- `.archive/` - Archived items
