# Electron Example

Simple `Electron` + `Vite` + `Tanstack Router` + `SQLite` + `Drizzle` boilerplate.

> [!TIP]
> 
> this project is best managed through [makefile](./makefile) commands

## Local Development

1. `% make db-setup`
2. `% make eb-rebuild`
3. `% make dev`

```bash
make db-setup && make eb-rebuild && make dev
```

## Build Production Assets

> [!NOTE]
> 
> this project utilizes [electron-builder.yml](./electron-builder.yml)

- `% make eb-build` / `% make eb-rebuild` 👉 `/release/<version>/...`

## Database _(sqlite - better-sqlite3)_

> [!IMPORTANT]
> 
> The sqlite database is stored in the user's application data directory:  
> - Windows: `%APPDATA%\electron_example\electron_example.db`
> - macOS: `~/Library/Application Support/electron_example/electron_example.db`
> - Linux: `~/.config/electron_example/electron_example.db`

## Logs

> [!NOTE]
> 
> The application logs are stored in the application data directory:
> - Windows: `%APPDATA%\electron_example\log\<YYYY-MM-DD>\<SESSION_ID>.log`
> - macOS: `~/Library/Application Support/electron_example/log/<YYYY-MM-DD>/<SESSION_ID>.log`
> - Linux: `~/.config/electron_example/log/<YYYY-MM-DD>/<SESSION_ID>.log`
>
> Where `<YYYY-MM-DD>` is the date of the log (e.g., `2023-10-27`) and `<SESSION_ID>` is a unique ID for that application session.
> The log file has a maximum size of 10MB.

- `% make log-tail`
