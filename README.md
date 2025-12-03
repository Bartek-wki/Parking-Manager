# Parking Manager

Parking Manager is a web-based administrative application for parking owners to manage multiple locations, parking spots, customers and reservations (regular and time-range based). The project contains the product requirements (PRD), a starter Astro + React codebase and scripts to run and build the application.

## Table of Contents
- [Project description](#project-description)
- [Tech stack](#tech-stack)
- [Getting started (locally)](#getting-started-locally)
- [Available scripts](#available-scripts)
- [Project scope](#project-scope)
- [Project status](#project-status)
- [License](#license)

## Project description

Parking Manager helps parking owners replace manual spreadsheets with a single administrative tool that:
- Manages multiple parking locations and their parking places
- Creates and validates reservations (fixed and ranged/day-based)
- Tracks customers and payment status history
- Provides a monthly calendar view of reservations
- Supports dynamic pricing exceptions per location
- Sends automated e-mail notifications (reminders, overdue, confirmations) and logs email delivery attempts

This repository contains the project scaffold, product requirements (PRD) and initial tooling for development with Astro + React.

## Tech stack

- Frontend framework: Astro 5 with React components
- Language: TypeScript 5
- UI: Tailwind CSS 4 + shadcn/ui
- Runtime / Hosting: Node.js (see `.nvmrc`) — Node 22.14.0 is used in this repo
- Backend / Database: Supabase (project integrates with Supabase in planned architecture)
- CI/CD & Hosting (planned): GitHub Actions, DigitalOcean
- Key dependencies (from package.json): `astro`, `@astrojs/react`, `react`, `react-dom`, `tailwindcss`, `lucide-react`, `clsx`

## Getting started locally

### Prerequisites

- Node.js matching `.nvmrc` (22.14.0) or a compatible LTS version installed. Using `nvm` is recommended.
- npm (or pnpm/yarn) — this project uses the npm scripts defined in `package.json`.
- A Supabase project (for backend features) — environment variables are required for runtime features that talk to Supabase.

### Clone and install

```bash
git clone <repo-url>
cd project
# install dependencies
npm install
```

### Environment

Create a `.env` file in the project root (this repository does not include a `.env.example`). Typical environment variables required for runtime features (example names — adapt to your implementation):

```bash
# Supabase
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key

# Optional: other secrets, API keys, email provider credentials
```

### Run in development

```bash
npm run dev
```

Open the dev server (default port from Astro) in your browser (e.g. `http://localhost:3000`).

## Available scripts

Scripts are defined in `package.json`:

- `npm run dev` — start Astro development server  
- `npm run build` — build the site for production  
- `npm run preview` — preview the production build locally  
- `npm run astro` — run the Astro CLI  
- `npm run lint` — run ESLint across the project  
- `npm run lint:fix` — run ESLint and attempt to fix problems  
- `npm run format` — run Prettier over JSON/CSS/MD files

Use `npm run <script>` to run any of the above.

## Project scope

This project follows the Parking Manager PRD and focuses on an MVP for parking owners. Key points:

- Single owner role (no multi-user roles or sharing in MVP)  
- Reservations are day-based (no hours) and must be validated to avoid overlapping bookings on the same parking spot  
- Two reservation types: fixed (monthly) and ranged/periodic (day range)  
- Location-specific configuration (default daily and monthly prices) and date-range price exceptions (+/−% adjustments)  
- Monthly calendar view (no smaller time granularity) with color-coded statuses and details on click  
- Automated email types in MVP: reminder (−3 days), overdue, and confirmation (owner always, client if they have an email) — the system logs email attempts and errors  
- No client-facing panel, no online payment integrations, no invoices/PDFs in MVP

For full functional requirements, see `./.ai/prd.md` (product requirements document included in the repository).

## Project status

- PRD completed and stored in `.ai/prd.md`.  
- Project scaffolded with Astro + React and essential tooling (ESLint, Prettier, Husky hooks).  
- Backend (Supabase) is the intended datastore; the repository includes types and layout conventions in `src/` for future implementation.
- CI/CD and hosting are planned with GitHub Actions and DigitalOcean (not yet configured).

If you are contributing, please open an issue or pull request describing the change and reference the relevant PRD user stories for alignment.

## License

No license file is included in this repository. If you plan to publish or share this project, add a `LICENSE` file (for example, MIT) to make the project license explicit.

---

If you need a longer onboarding, developer guidelines, or any additional docs (architecture diagrams, Supabase schema, or email templates), I can add them as separate files and link them from here.

# 10x Astro Starter

A modern, opinionated starter template for building fast, accessible, and AI-friendly web applications.

## Tech Stack

- [Astro](https://astro.build/) v5.5.5 - Modern web framework for building fast, content-focused websites
- [React](https://react.dev/) v19.0.0 - UI library for building interactive components
- [TypeScript](https://www.typescriptlang.org/) v5 - Type-safe JavaScript
- [Tailwind CSS](https://tailwindcss.com/) v4.0.17 - Utility-first CSS framework

## Prerequisites

- Node.js v22.14.0 (as specified in `.nvmrc`)
- npm (comes with Node.js)

## Getting Started

1. Clone the repository:

```bash
git clone https://github.com/przeprogramowani/10x-astro-starter.git
cd 10x-astro-starter
```

2. Install dependencies:

```bash
npm install
```

3. Run the development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

## Project Structure

```md
.
├── src/
│   ├── layouts/    # Astro layouts
│   ├── pages/      # Astro pages
│   │   └── api/    # API endpoints
│   ├── components/ # UI components (Astro & React)
│   └── assets/     # Static assets
├── public/         # Public assets
```

## AI Development Support

This project is configured with AI development tools to enhance the development experience, providing guidelines for:

- Project structure
- Coding practices
- Frontend development
- Styling with Tailwind
- Accessibility best practices
- Astro and React guidelines

### Cursor IDE

The project includes AI rules in `.cursor/rules/` directory that help Cursor IDE understand the project structure and provide better code suggestions.

### GitHub Copilot

AI instructions for GitHub Copilot are available in `.github/copilot-instructions.md`

### Windsurf

The `.windsurfrules` file contains AI configuration for Windsurf.

## Contributing

Please follow the AI guidelines and coding practices defined in the AI configuration files when contributing to this project.

## License

MIT
