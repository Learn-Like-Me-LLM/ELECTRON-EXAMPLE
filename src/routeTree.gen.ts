/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as UtilityProcessesImport } from './routes/utility-processes'
import { Route as FallbackImport } from './routes/fallback'
import { Route as R404Import } from './routes/_404'
import { Route as IndexImport } from './routes/index'

// Create/Update Routes

const UtilityProcessesRoute = UtilityProcessesImport.update({
  id: '/utility-processes',
  path: '/utility-processes',
  getParentRoute: () => rootRoute,
} as any)

const FallbackRoute = FallbackImport.update({
  id: '/fallback',
  path: '/fallback',
  getParentRoute: () => rootRoute,
} as any)

const R404Route = R404Import.update({
  id: '/_404',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/_404': {
      id: '/_404'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof R404Import
      parentRoute: typeof rootRoute
    }
    '/fallback': {
      id: '/fallback'
      path: '/fallback'
      fullPath: '/fallback'
      preLoaderRoute: typeof FallbackImport
      parentRoute: typeof rootRoute
    }
    '/utility-processes': {
      id: '/utility-processes'
      path: '/utility-processes'
      fullPath: '/utility-processes'
      preLoaderRoute: typeof UtilityProcessesImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '': typeof R404Route
  '/fallback': typeof FallbackRoute
  '/utility-processes': typeof UtilityProcessesRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '': typeof R404Route
  '/fallback': typeof FallbackRoute
  '/utility-processes': typeof UtilityProcessesRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/_404': typeof R404Route
  '/fallback': typeof FallbackRoute
  '/utility-processes': typeof UtilityProcessesRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '' | '/fallback' | '/utility-processes'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '' | '/fallback' | '/utility-processes'
  id: '__root__' | '/' | '/_404' | '/fallback' | '/utility-processes'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  R404Route: typeof R404Route
  FallbackRoute: typeof FallbackRoute
  UtilityProcessesRoute: typeof UtilityProcessesRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  R404Route: R404Route,
  FallbackRoute: FallbackRoute,
  UtilityProcessesRoute: UtilityProcessesRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/_404",
        "/fallback",
        "/utility-processes"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/_404": {
      "filePath": "_404.tsx"
    },
    "/fallback": {
      "filePath": "fallback.tsx"
    },
    "/utility-processes": {
      "filePath": "utility-processes.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
