"use client";

import {
  QueryClientProvider,
  QueryClient,
  MutationCache,
} from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 5,
    },
  },
  mutationCache: new MutationCache({
    onSuccess: (data, variables, result, context) => {
      const keys = (context.options.mutationKey as string[]) || [];

      const triggers = ["delete", "create", "change-title"];

      const isTarget = triggers.some((trigger) => keys.includes(trigger));

      if (isTarget) {
        queryClient.invalidateQueries({ queryKey: ["globalSearch"] });
      }
    },
  }),
});

interface Iprops {
  children: React.ReactNode;
}

export const QueryProvider = ({ children }: Iprops) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};
