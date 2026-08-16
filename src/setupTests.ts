import "@testing-library/jest-dom";
import "@testing-library/user-event";

globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Test User" } },
    status: "authenticated",
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));
vi.mock("@/actions/actions", () => {
  return {
    createCartForColumn: vi.fn(),
    getColumnForInBoxUser: vi.fn().mockResolvedValue({ id: "id-1", cards: [{ id: "1", columnId: "col-1", completed: false, position: 100, title: "cartão" }] }),
    createColumnFromBoard:vi.fn(),
  }
})

vi.mock("@/app/util/mutations", () => ({
  onMutateFunction: vi.fn(),
}))

afterAll(() => {
  vi.resetAllMocks();
});
