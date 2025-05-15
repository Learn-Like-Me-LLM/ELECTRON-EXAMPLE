/// <reference types="vite-plugin-electron/electron-env" />

declare namespace NodeJS {
  interface ProcessEnv {
    VSCODE_DEBUG?: 'true'
    /**
     * The built directory structure
     *
     * ```tree
     * ├─┬ dist-electron
     * │ ├─┬ main
     * │ │ └── index.js    > Electron-Main
     * │ └─┬ preload
     * │   └── index.mjs   > Preload-Scripts
     * ├─┬ dist
     * │ └── index.html    > Electron-Renderer
     * ```
     */
    APP_ROOT: string
    /** /dist/ or /public/ */
    VITE_PUBLIC: string
  }
}

// Import types from our types file
interface IPCResponse<T = any> {
  code: number;
  msg?: string;
  data?: T;
}

interface User {
  id: number;
  username: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

interface NewUser {
  username: string;
  email: string;
}

interface Window {
  ipcRenderer: {
    on: (channel: string, func: (...args: any[]) => void) => void
    off: (channel: string, func: (...args: any[]) => void) => void
    send: (channel: string, ...args: any[]) => void
    invoke: (channel: string, ...args: any[]) => Promise<any>
  }
  electronAPI: {
    sendLog: (level: string, data: any[]) => void
  }
  env: {
    CUSTOM_ENV_VAR: string
    NODE_ENV: string
  }
}