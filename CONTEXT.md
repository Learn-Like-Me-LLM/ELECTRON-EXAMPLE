# CONTEXT.md - Electron Example Project

## Development Make Commands

- `make dev` : start Vite development server
- `make debug` : start Vite debug server
- `make i` : install packages
- `make ri` : wipe and reinstall packages
- `make db-setup` : utilizes Drizzle to 1) Generate an updated schema 2) rebuild migrations 3) run migrations
- `make tsr-gen-routes` : generates new Tanstack Router UI routes
- `make kac` : "Kit and Caboodle" - flushes build assets, reinstalls packages, sets up DB, generates routes, rebuilds Electron app, and starts dev server.

## PRODUCTION / BUILD COMMANDS
- `make eb-build` : build production assets with electron-builder (./electron-builder.yml)
- `make eb-rebuild` : rebuilds production assets with electron-builder
- `make eb-flush` : delete production assets (dist, dist-electron, release)

## Code Style Guidelines
- **TypeScript**: Strict mode enabled, no unused locals/parameters
- **Imports**: Node.js built-ins first, external deps next, internal modules last
- **Naming**: camelCase for variables/functions, PascalCase for components/types, UPPER_CASE for constants
- **Database**: snake_case for column names, controller/service pattern for operations
- **Error Handling**: Try/catch with logger.error(), response utility for standardized responses
- **State Management**: TanStack Query for server state, React Router for client state
- **Styling**: Tailwind CSS with classnames for conditional classes
- **Path Aliases**: Use @/* for src directory imports

## Project Structure
- `electron/` - Main process code (Node.js)
- `src/` - Renderer process code (React)
- `migrations/` - Database migrations
- `dist-electron/` - Built Electron code (for development/debugging)
- `dist/` - Built renderer code (for development/debugging)
- `release/` - Built production assets
- `DOCS/` - Project documentation
- `.vscode/` - VSCode specific settings
- `.opencode/` - OpenCode specific settings and history