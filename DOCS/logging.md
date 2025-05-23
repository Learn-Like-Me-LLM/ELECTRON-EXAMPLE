# Consolidated logging with `electron-log`

1.  **Centralize Renderer Logs via IPC:**  
Logs from all `RENDER PROCESS(es)` are transmitted via `Inter-Process Communication (IPC)` to the `MAIN PROCESS`. The `MAIN PROCESS` then manages all configurations, formatting, and file path resolution for writing these logs, typically to `.../renderer.log`.

2.  **Independent Utility Logs:** 
`UTILITY PROCESS(es)`, which run as separate Node.js contexts and use their own instance to `electron-log/main` to log directly to their own files. This maintains separation while ensuring their logs are part of the overall session's log collection.

3.  **Consistent Formatting:**  
A standard log message format is applied across all processes and log outputs (console and file).

4.  **Structured Log Storage:**  
Logs are stored in a predictable directory structure.

## Log Storage Structure

All application logs are written to a structured directory within the user's application data path:

- **Windows**: `%APPDATA%\{APP_NAME}\logs\...`
- **macOS**: `~/Library/Application Support/{APP_NAME}/logs/...`
- **Linux**: `~/.config/{APP_NAME}/logs/...`

```
.../logs/
  <YYYY-MM-DD>/
    <SESSION_ID>/
      main.log
      renderer.log
      <utility scope>/
        <UTILITY_PROCESS_ID>/
          utility.log
```

Key components of the structure:
- `{APP_NAME}`: The name of the application (e.g., `electron_example`).
- `<YYYY-MM-DD>`: A directory for each day's logs.
- `<SESSION_ID>`: A directory for each unique session (each time the application is opened).
- `<utility scope>` : Additional log context
- `<UTILITY_PROCESS_ID>`: A directory for each unique instance of a utility process.

## Log Message Format

A consistent log message format is applied across all processes for both console and file outputs:

`{h}:{i}:{s} [{processType}{scope}] [{level}] > {text}`

-   `{h}:{i}:{s}`: Timestamp (hour:minute:second).
-   `{processType}`: Indicates the source process (e.g., `main`, `renderer`, `utility`).
-   `{scope}`: An optional scope context
-   `{level}`: The log level (e.g., `info`, `warn`, `error`, `debug`).
-   `{text}`: The actual log message.

## How Processes Collaborate for Logging

This application's logging strategy relies on `electron-log` capabilities, particularly its IPC mechanism for renderer-to-main communication and the ability to configure independent loggers for utility processes.

> [!IMPORTANT]
> **Main Process Initialization is Key:** Calling `log.initialize()` in the `MAIN PROCESS` is crucial. It configures the main `electron-log` instance and automatically sets up the IPC listeners required to receive log messages from any `electron-log/renderer` instances used in `RENDER PROCESS(es)`. This is fundamental to the v5+ architecture for handling renderer logs.

**1. Main Process [`electron/main/logger/index.ts`](../electron/main/logger/index.ts)**

*   **Initialization:**
Imports `electron-log/main` and initializes `electron-log` using `log.initialize()`. This step prepares the main process to act as the central hub for renderer logs.

*   **Own Logs:**
Logs its own activities to a dedicated file.
    *   Output: `logs/<YYYY-MM-DD>/<SESSION_ID>/main.log`

*   **Renderer Log Aggregation & Processing:**
The main `electron-log` instance, after `log.initialize()`, listens for log messages sent from `electron-log/renderer` instances in `RENDER PROCESS(es)` via IPC. It then processes these logs according to its own configuration (e.g., formatting, file writing).
    *   Output: `logs/<YYYY-MM-DD>/<SESSION_ID>/renderer.log`

*   **Log Transmission:**
Not applicable in the sense of sending its own logs elsewhere for aggregation; it *is* the central aggregator for renderer logs. It does not transmit its own logs to another process.

*   **File Path Resolution:**
Dynamically determines log file paths using `log.transports.file.resolvePathFn`. This function is configured in the main process to differentiate output files, for example, directing its own logs to `main.log` and aggregated renderer logs to `renderer.log`.

*   **Formatting & Console Output:**
Applies the defined `electronLogMessageFormat` to both its file and console outputs. This formatting is applied to its own logs and the logs received from renderer processes.

**2. Renderer Process [`src/lib/logger.ts`](../src/lib/logger.ts)**

*   **Initialization:**
Imports `electron-log/renderer`. This specialized version is designed to seamlessly send log messages to the main process.

*   **Own Logs (Transmission Focus):**
The `electron-log/renderer` instance does not write to files directly. Its primary role is to capture log messages within the renderer process and transmit them over IPC to the `MAIN PROCESS` logger. The main process logger then handles the actual log writing to the `.../renderer.log` file, according to its centralized configuration.

*   **Log Transmission:**
Log messages generated using `electron-log/renderer` are automatically sent to the main process via IPC. This relies on the `log.initialize()` call made in the main process.

*   **File Path Resolution:**
Not applicable directly in the renderer process. File writing and path resolution are managed entirely by the `MAIN PROCESS`.

*   **Formatting & Console Output:**
Renderer logs are output to its own developer console, formatted using the local `electronLogMessageFormat`. The formatting of logs written to file is handled by the `MAIN PROCESS` logger.

**3. Utility Process [`electron/utility/lib/logger.ts`](../electron//utility/lib/logger.ts)**

*   **Initialization:**  
Imports `electron-log/main` (unlike renderers) and configures its own file transport.

*   **Own Logs:**  
Writes logs directly to namespaced files.
    *   Output: `logs/<YYYY-MM-DD>/<SESSION_ID>/<scope>/<UTILITY_PROCESS_ID>/utility.log`

*   **Log Transmission:**  
Not applicable in the same way as `RENDER PROCESS(es)`. `UTILITY PROCESS(es)` log independently to their own files and do not transmit logs to the main process for aggregation. Their logs are co-located in the same session directory.

*   **File Path Resolution:**  
Uses its own `log.transports.file.resolvePathFn` to construct its specific log file path, incorporating `UTILITY_PROCESS_ID` and `scope`.

*   **Formatting & Console Output:**  
Applies `electronLogMessageFormat` to both its file and console outputs.

*   **Independence:**  
Logs are not directly aggregated by the main process's logger instance but are co-located under the same date and session directory.

