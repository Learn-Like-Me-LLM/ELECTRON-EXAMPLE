import { app } from "electron";
import { fileURLToPath } from 'url';
import path from 'path';

export const isMac = () => {
  return process.platform === 'darwin'
}

/**
 * System Directory
 * Get the user directory under appdata, which points to C:\Users\username\AppData\Roaming on win
 * @returns string
 */
export const getAppHand = () => {
  return app.getPath("appData");
};

/**
 * Get current file directory
 * @param importMetaUrl import.meta.url
 * @returns string
 */
export function getDirname(importMetaUrl: string) {
  return path.dirname(fileURLToPath(importMetaUrl));
}
