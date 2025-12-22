import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ComponentType } from "react";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
    },
  },
});

export function withQueryClient<P extends object>(Component: ComponentType<P>): ComponentType<P> {
  return function WrappedComponent(props: P) {
    return (
      <QueryClientProvider client={queryClient}>
        <Component {...props} />
      </QueryClientProvider>
    );
  };
}
