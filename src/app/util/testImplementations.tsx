import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render } from "@testing-library/react";

const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      mutations: { retry: false },
      queries: { gcTime: 0, retry: false }, // gcTime: 0 evita vazamento de cache entre testes
    },
  });
};

export const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={createQueryClient()}>
      {ui}
    </QueryClientProvider>
  );
};
