# Logging Configuration Summary

This Electron application utilizes a combination of `electron-log` for the main process and a custom IPC-based solution for the renderer process to achieve unified logging.

## Core Logging Mechanism:

*   **`electron-log` (Main Process):**
    *   Located in `electron/main/logger/index.ts`.
    *   Configures both file and console transports.
    *   **File Transport:**
        *   **Path:** `app.getPath('appData')/APP_NAME/log/main.log` (e.g., `~/Library/Application Support/electron_example/log/main.log` on macOS).
        *   **Filename:** `YYYY-MM-DD.log`.
        *   **Format:** `[{y}-{m}-{d} {h}:{i}:{s}.{ms}][{processType}][{level}]{scope} {text}`.
        *   **Max Size:** 10MB.
    *   **Console Transport:** Uses the same format as the file transport.
    *   An IPC listener (`__ELECTRON_LOG__`) is set up to receive logs from the renderer process.

*   **Custom Renderer Logger (`src/lib/logger.ts`):**
    *   Logs directly to the renderer's console (e.g., browser DevTools).
    *   If running in an Electron renderer context, it sends log messages (level and data) to the main process via `ipcRenderer.send('__ELECTRON_LOG__', ...)` to be handled by `electron-log`.

*   **Preload Script (`electron/preload/index.ts`):**
    *   Exposes `window.electronAPI.sendLog` to the renderer process, which the custom renderer logger uses to send logs to the main process.

*   **Database Utility Process (`electron/main/utils/db-utility-process.js`):**
    *   Uses basic `console.log` and `console.error` prefixed with `[DB Utility Process]`. These logs are independent of the main `electron-log` system.

*   **Fallback Logger (`electron/main/utils/constants.ts`):**
    *   A simple console logger is available as a fallback if `electron-log` or the Electron environment is not fully initialized.

## Usage Summary:

*   **Main Process:** Directly imports and uses the `electron-log` instance from `electron/main/logger/index.ts`.
*   **Renderer Process:** Uses the custom logger from `src/lib/logger.ts`, which forwards logs to the main process.
*   **Database Utility Process:** Uses its own `console.log/error`.

## Is everything using `electron-log`?

Not directly.
*   The **renderer process** uses its own logger that forwards messages to `electron-log` in the main process.
*   The **database utility process** uses simple `console` statements.

Therefore, while `electron-log` is central to the logging strategy, especially for persistent and unified logs from the main and renderer processes, other console-based logging exists in isolated parts like the DB utility process.
