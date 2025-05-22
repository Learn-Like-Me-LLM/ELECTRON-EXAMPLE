import cx from 'classnames'
import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '../lib/queryClient'

export const Route = createRootRoute({
  component: Root,
})

export function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className={cx(
        'flex flex-col', 
        'items-center',
        'min-h-screen', 'bg-blue-500', 'overflow-y-auto'
      )}>
        <Outlet />
      </div>
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}