/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface Window {
  // expose in the `electron/preload/index.ts`
  ipcRenderer: import('electron').IpcRenderer
  electronAPI: {
    launchCounterUtility: () => Promise<{ success: boolean; message: string; error?: string }>
    launchRngUtility: () => Promise<{ success: boolean; message: string; error?: string }>
  env: {
    CUSTOM_ENV_VAR: string
    NODE_ENV: string
  }
}
