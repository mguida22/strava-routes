/* prettier-ignore-start */

/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file is auto-generated by TanStack Router

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as MapImport } from './routes/map'
import { Route as IndexImport } from './routes/index'
import { Route as ActivityIdImport } from './routes/activity.$id'

// Create Virtual Routes

const StravaAuthRedirectLazyImport = createFileRoute('/strava-auth-redirect')()

// Create/Update Routes

const StravaAuthRedirectLazyRoute = StravaAuthRedirectLazyImport.update({
  path: '/strava-auth-redirect',
  getParentRoute: () => rootRoute,
} as any).lazy(() =>
  import('./routes/strava-auth-redirect.lazy').then((d) => d.Route),
)

const MapRoute = MapImport.update({
  path: '/map',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const ActivityIdRoute = ActivityIdImport.update({
  path: '/activity/$id',
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
    '/map': {
      id: '/map'
      path: '/map'
      fullPath: '/map'
      preLoaderRoute: typeof MapImport
      parentRoute: typeof rootRoute
    }
    '/strava-auth-redirect': {
      id: '/strava-auth-redirect'
      path: '/strava-auth-redirect'
      fullPath: '/strava-auth-redirect'
      preLoaderRoute: typeof StravaAuthRedirectLazyImport
      parentRoute: typeof rootRoute
    }
    '/activity/$id': {
      id: '/activity/$id'
      path: '/activity/$id'
      fullPath: '/activity/$id'
      preLoaderRoute: typeof ActivityIdImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export const routeTree = rootRoute.addChildren({
  IndexRoute,
  MapRoute,
  StravaAuthRedirectLazyRoute,
  ActivityIdRoute,
})

/* prettier-ignore-end */

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/map",
        "/strava-auth-redirect",
        "/activity/$id"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/map": {
      "filePath": "map.tsx"
    },
    "/strava-auth-redirect": {
      "filePath": "strava-auth-redirect.lazy.tsx"
    },
    "/activity/$id": {
      "filePath": "activity.$id.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
