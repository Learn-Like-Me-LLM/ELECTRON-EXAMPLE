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

# Examples

## `UTILITY PROCESS` - Counter Example

This example demonstrates how to run and debug a utility process. The utility process (`electron/main/utilityCounter.ts`) counts from 1 to 30, logging each number, and then exits.

**Prerequisites:**
- Ensure your build configuration (e.g., in `vite.config.ts` or related build scripts) is set up to compile `electron/main/utilityCounter.ts` to `dist-electron/main/utilityCounter.js`. The `preLaunchTask` (`npm: build:main:debug`) in the "DEBUG MAIN PROCESS" launch configuration should handle this.

**Steps to Test & Debug:**

1. Configure `.vscode/launch.json` for `UTILITY PROCESS`

> [!IMPORTANT] 
> 
> ATTACH vs LAUNCH

<details><summary>Example</summary>

```json
{
    "name": "DEBUG COUNTER UTILITY PROCESS",
    "type": "pwa-node",
    "request": "attach",
    "cwd": "${workspaceFolder}",
    "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron",
    "windows": {
    "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/electron.cmd"
    },
    "port": 9230,
    "sourceMaps": true,
    "outFiles": [
    "${workspaceFolder}/dist-electron/main/utilityCounter.js",
    "${workspaceFolder}/dist-electron/main/**/*.js",
    "!**/node_modules/**"
    ]
}
```
</details>

2. Add breakpoints in VSCode UI

3. Start `RENDER PROCESS(es)`

```bash
make debug
```

4. LAUNCH the `MAIN PROCESS` Debugger
- In VS Code, go to the "Run and Debug" panel (Ctrl+Shift+D or Cmd+Shift+D).
- Select the "DEBUG MAIN PROCESS" configuration from the dropdown.
- Click the green play button.
- The Electron application window should open. Check the VS Code "DEBUG CONSOLE" for logs from the main process. You should see messages indicating it's trying to launch the `utilityCounter` process (e.g., `[MAIN PROCESS] Launching counter utility process from: ...`).

5. ATTACH `UTILITY PROCESS` Debugger
- While the main application is still running, go back to the "Run and Debug" panel in VS Code.
- Select the "DEBUG COUNTER UTILITY PROCESS" configuration from the dropdown.
- Click the green play button. This will attach the debugger to the utility process, which was started with the `--inspect-brk=9230` flag by the main process.

6. Trigger `UTILITY PROCESS`

7. Step through the code using the debugger popover tool


