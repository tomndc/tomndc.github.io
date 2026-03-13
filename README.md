# Personal portfolio

Personal portfolio. Built with Astro and JavaScript.

## Project structure

```
src/
├── components/
│   ├── BioComponent.astro   — avatar + name/subtitle with 4-state crossfade
│   ├── FeaturedRow.astro    — single row in the featured works display
│   ├── ProjectCard.astro    — card used in filtered search results
│   ├── SearchBar.astro      — search input with chip filters and inline hint
│   └── SkillsGrid.astro     — skills heatmap grid (working / learning / etc)
├── layouts/
│   └── Layout.astro         — navbar, footer, theme switch, SPA shell
├── lib/data/
│   ├── about-data.json      — name, bio, role, avatar
│   ├── experience-data.json — jobs and milestones for the timeline
│   ├── projects-data.json   — projects with metadata, tags and images
│   ├── search-data.json     — search bar state titles and thresholds
│   ├── skills-data.json     — skills with category and proficiency level
│   └── socials-data.json    — github, linkedin, behance urls
├── pages/
│   └── index.astro          — page entry point
├── sections/
│   ├── ExperienceSection.astro  — career timeline with year axis
│   └── WorkSection.astro        — bio, search, 3-panel display box
└── styles/
    └── global.css           — CSS variables, layout, theme (dark / light)

public/
├── scripts/
│   ├── search.js            — filter logic, panel switching, lightbox
│   └── spa.js               — tab navigation between work / experience
├── theme.js                 — 3-state theme toggle (system / light / dark)
├── avatar.jpg
└── favicon.png
```

## Getting started

```bash
npm install
npm run dev
```

## Customization

All content is driven by the JSON files in `src/lib/data/`. No code changes needed for most edits.

| File                   | What to edit                                    |
| ---------------------- | ----------------------------------------------- |
| `about-data.json`      | Name, bio, role, avatar path                    |
| `projects-data.json`   | Projects, tags, links, images                   |
| `experience-data.json` | Jobs and career milestones                      |
| `search-data.json`     | Search bar placeholder states and tag threshold |
| `socials-data.json`    | Social links in the footer                      |

## Built with

- [Astro](https://astro.build)
- Vanilla JavaScript
- CSS custom properties
