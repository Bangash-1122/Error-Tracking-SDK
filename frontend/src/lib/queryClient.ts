import { QueryClient } from '@tanstack/react-query';

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // 30 seconds fresh window for real-time monitoring feel without spamming backend
        staleTime: 30 * 1000,
        // Keep inactive data in memory for 5 minutes
        gcTime: 5 * 60 * 1000,
        // Disable automatic aggressive refetches on tab click to conserve network and avoid rerenders
        refetchOnWindowFocus: false,
        // Single retry with standard exponential backoff
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always create a new QueryClient
    return makeQueryClient();
  } else {
    // Browser: reuse client across rerenders
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

/**
 * Tenant Isolation Utility:
 * Clears all cached queries belonging to a previous tenant/organization when switching accounts.
 */
export function clearTenantCache(queryClient: QueryClient, orgId?: string) {
  if (orgId) {
    queryClient.removeQueries({
      predicate: (query) => {
        const key = query.queryKey;
        return Array.isArray(key) && key.includes(orgId);
      },
    });
  } else {
    queryClient.clear();
  }
}
