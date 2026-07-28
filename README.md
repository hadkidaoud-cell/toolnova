# ToolNova

> Every Tool. One Place.

A professional SaaS platform hosting hundreds of online tools, built as a monorepo with pnpm workspaces and Turborepo.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Web App** | Next.js 15 (App Router) + React 19 |
| **Admin Panel** | Next.js 15 (App Router) + React 19 |
| **API** | NestJS 11 + Express |
| **Language** | TypeScript 5.7 (strict mode) |
| **Styling** | Tailwind CSS 3.4 |
| **UI Library** | 27-component design system (`@toolnova/ui`) |
| **Database** | PostgreSQL (Prisma ORM) |
| **Auth** | Custom JWT (HMAC-SHA256) + session management |
| **Build** | Turborepo + tsup + pnpm workspaces |
| **Testing** | Jest + Playwright |
| **Code Quality** | ESLint + Prettier + Husky + lint-staged + commitlint |

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Generate Prisma client
pnpm db:generate

# Run all apps in development
pnpm dev
```

### Individual Apps

```bash
# Web app (port 3000)
pnpm --filter @toolnova/web dev

# Admin panel (port 3001)
pnpm --filter @toolnova/admin dev

# API server (port 4000)
pnpm --filter @toolnova/api dev
```

## Project Structure

```
ToolNova/
├── apps/
│   ├── web/                 # Main web application (Next.js 15)
│   ├── admin/               # Admin dashboard (Next.js 15)
│   └── api/                 # Backend API (NestJS 11)
├── packages/
│   ├── core/                # Core engine: types, tools, plugins, search,
│   │                        #   SEO, analytics, errors, auth, SDK, storage,
│   │                        #   marketplace, image processing, PDF merger,
│   │                        #   resume builder, QR code generator,
│   │                        #   image compressor
│   ├── ui/                  # 27-component design system (React 19)
│   ├── types/               # Shared TypeScript type definitions
│   ├── config/              # Shared configuration
│   ├── utils/               # Shared utility functions
│   ├── auth/                # Authentication (re-exports from core)
│   ├── database/            # Prisma database client
│   ├── seo/                 # SEO utilities
│   ├── analytics/           # Analytics utilities
│   └── tools/               # Tool-specific utilities
├── turbo.json               # Turborepo pipeline config
├── pnpm-workspace.yaml      # pnpm workspace config
└── tsconfig.base.json       # Shared TypeScript config
```

## Core Engine (`@toolnova/core`)

The heart of ToolNova — a zero-dependency TypeScript package with:

| Module | Description |
|--------|------------|
| **Tool SDK** | `BaseTool`, context, logger, validator, execution lifecycle with retry/backoff |
| **Plugin System** | Plugin interfaces, manager, registry, loader, validator |
| **Search Engine** | Full-text search, ranking, suggestions, history |
| **SEO Engine** | Meta tags, OpenGraph, Twitter cards, sitemap, breadcrumbs, JSON-LD |
| **Analytics Core** | Event tracking, processors, stores |
| **Error Framework** | Typed errors, recovery manager, structured logging |
| **Auth Foundation** | JWT tokens, session management, role-based access |
| **Image Processing** | From-scratch JPEG/PNG/WebP encoder with operations pipeline |
| **File Storage** | Adapters, validation, temp management, integrity hashing |
| **Marketplace** | Plugin submissions, security scanning, versioning, approval workflows |
| **QR Code Generator** | Full QR encoding engine (GF(256), Reed-Solomon) with SVG/PNG renderers |
| **Image Compressor** | Canvas-based compression, EXIF handling, batch processing |
| **PDF Merger** | From-scratch PDF parser + merger with reference remapping |
| **Resume Builder** | 3 templates, Arabic + English, live preview, draft persistence, PDF export |

## Tool Plugins

### Built-in Tools

| Tool | Features |
|------|----------|
| **QR Code Generator** | Custom colors, sizes, error correction, logo support, download history |
| **Image Compressor** | JPEG/PNG/WebP, quality presets, EXIF preservation, batch mode |
| **PDF Merger** | Drag & drop, reorder, preview, merge multiple PDFs |
| **Resume Builder** | 3 modern templates, Arabic + English (RTL), save drafts, export PDF |

### Adding a New Tool

1. Create `packages/core/src/tools/my-tool/types.ts`
2. Implement the engine in `engine/`
3. Create `plugin-manifest.ts` with Tool SDK config
4. Export via `index.ts` barrel
5. Add exports to `packages/core/src/index.ts`
6. Create the React UI in `apps/web/src/app/tools/my-tool/page.tsx`

## Available Scripts

```bash
pnpm dev            # Start all apps in development mode
pnpm build          # Build all apps and packages
pnpm lint           # Lint all packages
pnpm lint:fix       # Auto-fix lint issues
pnpm typecheck      # Type-check all packages
pnpm test           # Run all tests
pnpm test:watch     # Run tests in watch mode
pnpm clean          # Clean all build artifacts
```

## License

MIT
