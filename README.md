# Electron Example

Simple `Electron` + `React` + `Vite` boilerplate.

## Database _(sqlite - better-sqlite3)_

> [!IMPORTANT]
> 
> The sqlite database is stored in the user's application data directory:  
> - Windows: `%APPDATA%\electron_example\electron_example.db`
> - macOS: `~/Library/Application Support/electron_example/electron_example.db`
> - Linux: `~/.config/electron_example/electron_example.db`

## Logs

> [!IMPORTANT]
> 
> The application logs are stored in the application data directory:
> - Windows: `%APPDATA%\electron_example\log\main.log`
> - macOS: `~/Library/Application Support/electron_example/log/main.log`
> - Linux: `~/.config/electron_example/log/main.log`
>
> The log file has a maximum size of 10MB.

To view the last 150 lines of the log file, use:
```bash
# Windows (PowerShell)
tail -n 150 "$env:APPDATA\electron_example\log\main.log"

# macOS/Linux
tail -n 150 ~/Library/Application\ Support/electron_example/log/main.log  # macOS
tail -n 150 ~/.config/electron_example/log/main.log                      # Linux
```

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