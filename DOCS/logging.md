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
    *   Uses custom `log` and `error` functions.
    *   These functions attempt to send log messages (type: `__LOG__`, level: `info`/`error`, and data) to the main process via `parentPort.postMessage()`.
    *   If `parentPort` is not available (e.g., when run directly, not as a worker), it falls back to `console.log()` and `console.error()` prefixed with `[DB Utility Process - No ParentPort]`.
    *   **Note:** Currently, the main `electron-log` setup in `electron/main/logger/index.ts` does *not* have a handler for these `__LOG__` messages from the DB utility process. These logs will therefore only appear in the console if the fallback is triggered, or if a handler is added to the main process.

*   **Fallback Logger (`electron/main/utils/constants.ts`):**
    *   A simple console logger is available as a fallback if `electron-log` or the Electron environment is not fully initialized.

## Usage Summary:

*   **Main Process:** Directly imports and uses the `electron-log` instance from `electron/main/logger/index.ts`.
*   **Renderer Process:** Uses the custom logger from `src/lib/logger.ts`, which forwards logs to the main process.
*   **Database Utility Process:** Uses its own logging functions that attempt to send messages to the main process. If this IPC mechanism is not handled by the main process's `electron-log` instance (which is currently the case for `__LOG__` type messages), or if running standalone, these logs may only go to the console.

## Is everything using `electron-log`?

Not directly.
*   The **renderer process** uses its own logger that forwards messages to `electron-log` in the main process.
*   The **database utility process** uses its own logging functions that attempt to send messages to the main process. If this IPC mechanism is not handled by the main process's `electron-log` instance (which is currently the case for `__LOG__` type messages), or if running standalone, these logs may only go to the console.

Therefore, while `electron-log` is central to the logging strategy, especially for persistent and unified logs from the main and renderer processes, other console-based logging exists, and logs from the DB utility process sent via `parentPort.postMessage({ type: '__LOG__', ...})` are not currently captured by the main `electron-log` instance.
