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

## Logs _([electron-log](https://github.com/megahertz/electron-log))_

> [!NOTE]
> 
> The application logs are stored in the application data directory:
> - Windows: `%APPDATA%\electron_example\log\<YYYY-MM-DD>\<SESSION_ID>.log`
> - macOS: `~/Library/Application Support/electron_example/log/<YYYY-MM-DD>/<SESSION_ID>.log`
> - Linux: `~/.config/electron_example/log/<YYYY-MM-DD>/<SESSION_ID>.log`
>
> Where `<YYYY-MM-DD>` is the date of the log (e.g., `2023-10-27`) and `<SESSION_ID>` is a unique ID for that application session.

