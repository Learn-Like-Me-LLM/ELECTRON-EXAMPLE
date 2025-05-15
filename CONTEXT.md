# CONTEXT.md - Electron Example Project

## Development Make Commands

- `make dev` : start Vite development server
- `make i` : install packages
- `make ri` : wipe and reinstall packages
- `make db-setup` : utilizes Drizzle to 1) Generate an updated schema 2) rebuild migrations 3) run migrations
- `make tsr-gen-routes` : generates new Tanstack Router UI routes

## PRODUCTION / BUILD COMMANDS
- `make eb-build` : build production assets with electron-builder (./electron-builder.yml)
- `make eb-flush` : delete production assets


## Build & Development Commands
- `npm run dev` - Start Vite development server
- `npm run build:main` - Build Electron main process
- `npm run build:renderer` - Build renderer process
- `npm run electron:build` - Build complete Electron app
- `npm run electron:rebuild` - Clean and rebuild Electron app
- `npm run db:setup` - Set up database (generate schema, rebuild, run migrations)
- `npm run drizzle:generateSchema` - Generate database schema
- `npm run drizzle:rebuild` - Rebuild database schema
- `npm run drizzle:runMigrations` - Run database migrations
- `npm run tanstackrouter:generate:routes` - Generate TanStack router routes

## Code Style Guidelines
- **TypeScript**: Strict mode enabled, no unused locals/parameters
- **Imports**: Node.js built-ins first, external deps next, internal modules last
- **Naming**: camelCase for variables/functions, PascalCase for components/types, UPPER_CASE for constants
- **Database**: snake_case for column names, controller/service pattern for operations
- **Error Handling**: Try/catch with logger.error(), response utility for standardized responses
- **Logging**: electron-log with formatted timestamps, levels: error, warn, info, debug
- **Formatting**: 2-space indent, single quotes, semicolons, trailing commas in multi-line objects
- **Components**: Function declarations for React components, TanStack Router pattern
- **Styling**: Tailwind CSS with classnames for conditional classes
- **Path Aliases**: Use @/* for src directory imports

## Project Structure
- `electron/` - Main process code (Node.js)
- `src/` - Renderer process code (React)
- `migrations/` - Database migrations
- `dist-electron/` - Built Electron code
- `dist/` - Built renderer code
- `release/` - Built production assets