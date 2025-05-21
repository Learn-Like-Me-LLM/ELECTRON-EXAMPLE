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
    base: process.env.NODE_ENV === 'production' ? './' : '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      emptyOutDir: true,
      sourcemap: true, // Enable sourcemaps for debugging
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'tanstack-router': ['@tanstack/react-router']
          }
        }
      }
    },
    server: {
      port: 5173,
      strictPort: true,
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    plugins: [
      TanStackRouterVite({ 
        target: 'react', 
        autoCodeSplitting: true,
        generatedRouteTree: './src/routeTree.gen.ts'
      }),
      react(),
      electron([
        {
          // Main process entry point
          entry: 'electron/main/index.ts',
          onstart(args) {
            if (process.env.RENDERER_ONLY_MODE === 'true') {
              console.log('[startup] RENDERER_ONLY_MODE: Main process startup skipped.');
            } else if (process.env.VSCODE_DEBUG) {
              console.log('[startup] Electron App');
            } else {
              args.startup();
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
          // Utility process entry point
          entry: 'electron/utility/utilityCounter.ts',
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main', // Output to the same directory as main.js
              rollupOptions: {
                external: Object.keys(pkg.dependencies || {}),
              },
            },
          },
        },
        {
          // Utility process entry point for RNG
          entry: 'electron/utility/utilityRng.ts',
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: 'dist-electron/main', // Output to the same directory as main.js
              rollupOptions: {
                external: Object.keys(pkg.dependencies || {}),
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
    clearScreen: false,
  }
})