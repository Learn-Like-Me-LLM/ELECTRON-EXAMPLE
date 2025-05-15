# Electron Example

Simple `Electron` + `React` + `Vite` boilerplate.

## Database _(sqlite - better-sqlite3)_

> [!IMPORTANT]
> 
> The sqlite database is stored in the user's application data directory:  
> - Windows: `%APPDATA%\electron_example\electron_example.db`
> - macOS: `~/Library/Application Support/electron_example/electron_example.db`
> - Linux: `~/.config/electron_example/electron_example.db`


# Repo File Structure

<details>
  
  ```
  % tree -I 'node_modules'
  .
  ├── electron
  │   ├── main
  │   └── preload
  ├── LICENSE
  ├── package-lock.json
  ├── package.json
  ├── README.md
  └── src
      ├── assets
      ├── components
      └── main.ts

  7 directories, 5 files
  ```

</details>