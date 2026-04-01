# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static personal website built with plain HTML, CSS, and JavaScript. No build system, bundler, or test framework.

## Development

Open `index.html` directly in a browser to preview changes. No build step required.

## Deployment

Push to `main` triggers automatic deployment to GitHub Pages via `.github/workflows/deploy.yml`. The workflow uses an SSH deploy key (`secrets.DEPLOY_KEY`) to push to the `gh-pages` branch.

## Architecture

- **Root level**: HTML pages
  - `index.html` - homepage
  - `resume.html` - resume/CV
  - `photos.html` - photography gallery hub; sub-pages: `photos-autumn.html`, `photos-suipai.html`, `photos-xinjiang.html`, `photos-landscape.html`, `photos-life.html`, `photos-portrait.html`, `photos-street.html`, `photos-travel.html`
  - `agents.html` - AI agents projects
  - `projects.html` - personal projects
- **`styles/`**: Per-page CSS files (e.g., `projects.css` for projects.html)
- **`js/`**: JavaScript utilities
- **`未命名/`**: Backup/duplicate content - do not modify

## Style Modification Constraints

**`projects.html`** -不得修改现有风格，只能在原有基础上增加或调整样式。

## Git LFS

Images are tracked with Git LFS. After cloning:
```bash
git lfs install
git lfs pull
```

## Key Files

- `CNAME` - Custom domain for GitHub Pages
- `.nojekyll` - Required for GitHub Pages processing
- `.claude/` - Contains memory system for project-specific guidance

## Memory System

The `.claude/projects/` directory contains persistent memory files. Check this for project-specific constraints (e.g., style modification rules for certain pages).
