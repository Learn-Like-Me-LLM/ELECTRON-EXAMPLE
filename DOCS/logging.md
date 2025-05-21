# Application Logging

The application utilizes `electron-log` to establish a consolidated logging system, ensuring that logs from the main, renderer, and utility processes are captured, organized, and stored effectively. This centralized approach facilitates debugging and tracking of application-wide events.

## Log Storage Structure

All application logs are written to a structured directory within the user's application data path:

- **Windows**: `%APPDATA%\{APP_NAME}\logs\...`
- **macOS**: `~/Library/Application Support/{APP_NAME}/logs/...`
- **Linux**: `~/.config/{APP_NAME}/logs/...`

```
.../logs/
  YYYY-MM-DD/
    SESSION_ID/
      main.log
      renderer.log
      UTILITY_PROCESS_ID/
        utility.log
```

Key components of the structure:
- `{APP_NAME}`: The name of the application (e.g., `electron_example`).
- `<YYYY-MM-DD>`: A directory for each day's logs.
- `<SESSION_ID>`: A unique identifier generated at application startup for each session.
- `<UTILITY_PROCESS_ID>`: A unique identifier generated at the utility startup for each run.

## Process-Specific Logging

> [!IMPORTANT]
> 
> **Initialization**: Call `log.initialize()` from `electron-log` in the `MAIN PROCESS` file.  
> This is **vital** as it enables `electron-log` to automatically forward logs from renderer processes to the main process's file transports.

### 1. Main Process Logging
- **Configuration**: [`electron/main/logger/index.ts`](../electron/main/logger/index.ts)
- **Log File**: Writes its own logs to `main.log` within the current `<SESSION_ID>` directory.
  - Example: `.../logs/YYYY-MM-DD/SESSION_ID/main.log`
- **Renderer Log Handling**: Also responsible for writing logs received from the renderer process to `renderer.log` (see below).

### 2. Renderer Process Logging
- **Configuration**: [`src/lib/logger.ts`](../src/lib/logger.ts) (primarily for console format).
- **Mechanism**: When logging functions (e.g., `log.info()`, `log.error()`) are used in the renderer process, `electron-log` automatically forwards these messages to the main process.
- **Log File**: The main process logger receives these forwarded messages and writes them to `renderer.log` within the current session directory.
  - Example: `.../logs/YYYY-MM-DD/SESSION_ID/renderer.log`

### 3. Utility Process Logging
Utility processes (e.g., for background tasks) employ a dual logging strategy:

-   **A. Direct File Logging (via Utility's `electron-log` instance):**
    -   **Configuration**: [`electron/utility/lib/logger.ts`](../electron/utility/lib/logger.ts)
    -   **Mechanism**: Each utility process has its own `electron-log` instance. This instance is configured to write logs directly to a `utility.log` file.
    -   **Log File**: This file is located within a dedicated subdirectory named after the utility's unique scope ID (e.g., `UTILITY_COUNTER_uuid`). This scope ID is provided by the main process as an environment variable (`UTILITY_PROCESS_ID`) when the utility process is spawned.
        -   Example: `logs/YYYY-MM-DD/SESSION_ID/UTILITY_COUNTER_uuid/utility.log`

-   **B. Main Process Capture of `stdout`/`stderr`:**
    -   **Configuration**: Handled in the main process, typically within `electron/main/index.ts` when utility processes are spawned.
    -   **Mechanism**: The main process captures the standard output (`stdout`) and standard error (`stderr`) streams from each utility process. It then parses these streams to extract structured log information (level, scope, message).
    -   **Log File**: This parsed information is logged using the main process's `electron-log` instance. The `resolvePathFn` in the main logger is configured to direct these specific logs into the same utility-specific log file (`UTILITY_SCOPE_ID/utility.log`) used by the utility process's direct logger. This ensures all console output from utility processes is also captured and correctly filed.

## Log Message Format

A consistent log message format is applied across all processes for both console and file outputs:

`{h}:{i}:{s} [{processType}{scope}] [{level}] > {text}`

-   `{h}:{i}:{s}`: Timestamp (hour:minute:second).
-   `{processType}`: Indicates the source process (e.g., `main`, `renderer`, `utility`).
-   `{scope}`: An optional scope, often used for utility processes to include their specific ID (e.g., `UTILITY_COUNTER_uuid`).
-   `{level}`: The log level (e.g., `info`, `warn`, `error`, `debug`).
-   `{text}`: The actual log message.

This comprehensive logging strategy ensures that all relevant information from various parts of the application is captured in an organized and accessible manner, greatly aiding in development, debugging, and monitoring.