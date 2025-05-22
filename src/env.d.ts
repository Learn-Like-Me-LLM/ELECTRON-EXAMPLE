interface Window {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => Promise<any>;
    on: (channel: string, listener: (...args: any[]) => void) => void;
    // Add other ipcRenderer methods you use if any
  };
  env: {
    CUSTOM_ENV_VAR: string;
    NODE_ENV: string;
    // Add other environment variables exposed via preload
  };
} 