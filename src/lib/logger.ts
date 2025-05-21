import log from 'electron-log/renderer';

// Define the standard message format, mirroring the main process setup
const electronLogMessageFormat = '{h}:{i}:{s} [{processType}{scope}] [{level}] > {text}';

// Configure electron-log for all renderer console output
log.transports.console.format = electronLogMessageFormat;
log.scope.labelPadding = false;

export default log;