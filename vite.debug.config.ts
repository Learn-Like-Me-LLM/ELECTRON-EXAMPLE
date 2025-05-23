import { defineConfig } from 'vite'
import electron from 'vite-plugin-electron'
import path from 'node:path'
import pkg from './package.json'

// Vite config for building Electron files for debugging purposes ONLY.
// This is intended to be used by `npm run debug:build:main` which is a preLaunchTask in VS Code.
export default defineConfig(() => {
  const sourcemap = true; // Always true for debug builds
  const minify = false;   // Never minify for debug builds

  return {
    // The following are less relevant for a config focused only on Electron file builds via `vite build -c`,
    // but vite-plugin-electron might rely on the structure.
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    plugins: [
      electron([
        {
          // MAIN PROCESS entry point
          entry: 'electron/main/index.ts',
          vite: {
            build: {
              sourcemap,
              minify,
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: Object.keys(pkg.dependencies || {})
              },
            },
          },
        },
        {
          // Example UTILITY PROCESS entry point
          entry: 'electron/main/utilityCounter.ts',
          vite: {
            build: {
              sourcemap,
              minify,
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: Object.keys(pkg.dependencies || {}),
              },
            },
          },
        },
        {
          entry: 'electron/preload/index.ts',
          vite: {
            build: {
              sourcemap: 'inline', // Inline sourcemap for preload is fine for debug
              minify,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys(pkg.dependencies || {})
              },
            },
          },
        }
      ]),
    ],
    // Ensure Vite doesn't try to clear dist-electron if this config is accidentally used for `vite dev`
    // However, `vite build` with an outDir usually clears it.
    // The plugin's outDir configuration for each entry should handle its own destination.
    clearScreen: false,
  }
}) 