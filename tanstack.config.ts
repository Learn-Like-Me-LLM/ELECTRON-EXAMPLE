import { defineConfig } from '@tanstack/router-plugin/dist/config'

export default defineConfig({
  routesDirectory: './src/routes',
  generatedRouteTree: './src/routeTree.gen.ts',
  routeFileIgnorePattern: ['**.test.**', '**.spec.**'],
}) 