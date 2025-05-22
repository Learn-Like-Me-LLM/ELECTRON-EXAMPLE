# Electron Example

Simple `Electron` + `Vite` + `Tanstack (Router & Query)` + `SQLite` + `Drizzle` boilerplate.

> [!TIP]
> 
> this project is best managed through the defined [makefile](./makefile) commands

## [Local Development](./DOCS/local-development.md)

## [Build Production Assets](./DOCS/build-production-assets.md)

## Database _(SQLite : [better-sqlite3](https://github.com/WiseLibs/better-sqlite3))_

> [!IMPORTANT]
> 
> The sqlite database is stored in the user's application data directory: 
> 
> production DB file: `electron_example.db`
> development DB file: `electron_example.dev.db`
> 
> - Windows: `%APPDATA%\electron_example\<DB File Name>`
> - macOS: `~/Library/Application Support/electron_example/<DB File Name>`
> - Linux: `~/.config/electron_example/<DB File Name>`

## [Logging](./DOCS/logging.md) 

## [Debugging](./DOCS/debugging.md)

...tbd...

