import { defineConfig } from 'vite'
import { TanStackRouterVite } from '@tanstack/router-plugin/vite'
import react from '@vitejs/plugin-react'
import electron from 'vite-plugin-electron'
import fs from 'node:fs'
import path from 'node:path'
import pkg from './package.json'

// https://vite.dev/config/
export default defineConfig(({ command }) => {
  if (fs.existsSync('dist-electron')) {
    fs.rmSync('dist-electron', { recursive: true, force: true })
  }

  const isServe = command === 'serve'
  const isBuild = command === 'build'
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG

  return {
    server: {
      port: 5173,
      strictPort: true,
    },
    plugins: [
      TanStackRouterVite({ target: 'react', autoCodeSplitting: true }),
      react(),
      electron([
        {
          // Main process entry point
          entry: 'electron/main/index.ts',
          onstart(args) {
            if (process.env.VSCODE_DEBUG) {
              console.log('[startup] Electron App')
            } else {
              args.startup()
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main',
              rollupOptions: {
                external: Object.keys(pkg.dependencies || {})
              },
            },
          },
        },
        {
          entry: 'electron/preload/index.ts',
          onstart(args) {
            // Notify the Renderer process to reload the page when the Preload scripts build is complete, 
            // instead of restarting the entire Electron App.
            args.reload()
          },
          vite: {
            build: {
              sourcemap: sourcemap ? 'inline' : undefined,
              minify: isBuild,
              outDir: 'dist-electron/preload',
              rollupOptions: {
                external: Object.keys(pkg.dependencies || {})
              },
            },
          },
        }
      ]),
    ],
  }
})