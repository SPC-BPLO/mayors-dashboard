# San Pablo Civic Command Center

Glassmorphism executive dashboard rebuilt with Next.js App Router, React, and TypeScript.

## Structure

- `app/` — App Router entry point and glass UI system
- `components/` — interactive dashboard, icon system, and sparkline charts
- `data/` — typed dashboard models and prototype data
- `.openai/hosting.json` — preserved Sites identity and production output mapping

## Preview

Run `pnpm install` and `pnpm dev`, then open `http://localhost:3000`.

Use `pnpm typecheck` and `pnpm build` to validate the project. The production
static export is generated in `out/`.

The dashboard uses Google Fonts and an existing remotely hosted civic seal, so
an internet connection is needed for the complete visual treatment.

## Refactor notes

- Preserved the civic-dashboard content and information architecture.
- Reworked the interface into a minimal glassmorphism system with translucent
  surfaces, restrained shadows, soft borders, and an atmospheric civic palette.
- Added responsive mobile navigation and a dimmed backdrop.
- Added keyboard focus styles, reduced-motion handling, and print rules.
- Replaced the stale timestamp with a live Asia/Manila clock.
- Added safe prototype feedback to previously inert navigation and actions.
- Made “Generate Executive Brief” open the browser print workflow.
- Added global operational filters and simulated role views.
- Added a centralized mayoral action queue with review state and audit entries.
- Added source freshness, connector status, alert ownership, and data-trust labels.
- Added compact KPI trend lines while preserving the minimal glass interface.
- Replaced Tailwind CDN and imperative DOM scripting with typed React state,
  reusable components, and a dependency-locked Next.js production build.
