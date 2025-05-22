import log from 'electron-log/main';
import moment from 'moment';
import path from 'path'
import { electronLogMessageFormat } from '../utils/constants'

log.transports.file.resolvePathFn = (variables: any, message: any) => {
  const IS_PACKAGED: string = process.env.IS_PACKAGED || 'false'
  const SESSION_ID: string = process.env.SESSION_ID || 'unknown-session' 
  
  // Use UTILITY_PROCESS_ID from env for the utility process ID directory
  // This ID is generated in the main process (e.g., UTILITY_COUNTER_uuid) and passed as an env var.
  const UTILITY_PROCESS_ID = process.env.UTILITY_PROCESS_ID || 'unknown-utility-instance' 
  
  const now = moment().utc()
  const year = now.year().toString()
  const month = (now.month() + 1).toString().padStart(2, '0')
  const day = now.date().toString().padStart(2, '0')
  
  const datePath = `${year}-${month}-${day}`;
  const fileName = `utility.log`;

  return path.join(
    variables.userData,
    'logs',
    IS_PACKAGED === 'true' ? 'prod' : 'dev',
    datePath,
    SESSION_ID,
    message.scope || 'undefined-utility-scope',
    UTILITY_PROCESS_ID,
    fileName
  );
};

log.transports.file.format = electronLogMessageFormat;

// Configure electron-log for all renderer console output
log.transports.console.format = electronLogMessageFormat;

log.scope.labelPadding = false;

export default log;