import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
      retry: 2, // Retry failed requests 2 times
      refetchOnWindowFocus: false // Don't refetch when window regains focus
    }
  }
}) 