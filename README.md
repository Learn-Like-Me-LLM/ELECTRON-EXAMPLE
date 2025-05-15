# Electron Example

Simple `Electron` + `Vite` + `Tanstack Router` + `SQLite` + `Drizzle` boilerplate.

> [!TIP]
> 
> this project is best managed through [makefile](./makefile) commands

## Local Development

1. `% make db-setup`
2. `% make dev`

## Build Production Assets

> [!NOTE]
> 
> this project utilizes [electron-builder.yml](./electron-builder.yml)

- `% make eb-build` 👉 `/release/<version>/...`

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
> - Windows: `%APPDATA%\electron_example\log\main.log`
> - macOS: `~/Library/Application Support/electron_example/log/main.log`
> - Linux: `~/.config/electron_example/log/main.log`
>
> The log file has a maximum size of 10MB.

- `% make log-tail`

<details>
<summary><strong>Repo File Structure</strong></summary>
  
  ```
  % tree -I "node_modules|dist-electron|dist|release|.opencode"
  .
  ├── CONTEXT.md
  ├── drizzle.config.ts
  ├── electron
  │   ├── main
  │   │   ├── db
  │   │   │   ├── controller
  │   │   │   │   ├── index.ts
  │   │   │   │   └── user.ts
  │   │   │   ├── dbConnect.ts
  │   │   │   ├── dbInit.ts
  │   │   │   ├── schema
  │   │   │   │   ├── index.ts
  │   │   │   │   └── users.ts
  │   │   │   ├── seeds
  │   │   │   └── services
  │   │   │       └── user.ts
  │   │   ├── index.ts
  │   │   ├── logger
  │   │   │   └── index.ts
  │   │   └── utils
  │   │       ├── constants.ts
  │   │       ├── database.ts
  │   │       ├── db-utility-process.js
  │   │       ├── dbUtilityProcess.ts
  │   │       ├── index.ts
  │   │       └── response.ts
  │   └── preload
  │       └── index.ts
  ├── electron-builder.yml
  ├── electron-env.d.ts
  ├── index.html
  ├── LICENSE
  ├── makefile
  ├── migrations
  │   ├── 0000_concerned_vivisector.sql
  │   └── meta
  │       ├── _journal.json
  │       └── 0000_snapshot.json
  ├── package-lock.json
  ├── package.json
  ├── postcss.config.js
  ├── README.md
  ├── src
  │   ├── assets
  │   │   ├── electron.svg
  │   │   └── vite.svg
  │   ├── components
  │   ├── index.css
  │   ├── lib
  │   │   ├── logger.ts
  │   │   └── queryClient.ts
  │   ├── main.tsx
  │   ├── routes
  │   │   ├── __root.tsx
  │   │   ├── _404.tsx
  │   │   ├── fallback.tsx
  │   │   ├── index.tsx
  │   │   └── settings.tsx
  │   ├── routeTree.gen.ts
  │   ├── scripts
  │   │   ├── migrate.js
  │   │   └── runMigrations.js
  │   ├── styles.css
  │   └── vite-env.d.ts
  ├── tailwind.config.js
  ├── tanstack.config.ts
  ├── tsconfig.electron.json
  ├── tsconfig.json
  ├── tsconfig.node.json
  ├── tsconfig.web.json
  └── vite.config.ts

  19 directories, 53 files
  ```

</details>