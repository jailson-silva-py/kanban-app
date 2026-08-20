import "@testing-library/jest-dom";
import "@testing-library/user-event";
import type * as actions from "@/actions/actions"
import { PromiseReturnType } from "@prisma/client/extension";
//eslint-disable-next-line @typescript-eslint/no-explicit-any
type typeActionsMock = {[K in keyof typeof actions]?:typeof actions[K] extends (...args:any[]) => any ? ReturnType<typeof vi.fn>:never}

afterAll(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

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
vi.mock("@/actions/actions", ():typeActionsMock => {
  return {

    createCartForColumn: vi.fn(),
    getColumnForInBoxUser: vi.fn().mockResolvedValue({ id: "id-1", cards: [{ id: "1", columnId: "col-1", completed: false, position: 100, title: "cartão" }] }),
    createColumnFromBoard: vi.fn(),
    createCartForColumnInBox: vi.fn(),
    DeleteColumn: vi.fn(),
    changeBoardTitle: vi.fn(),
    ChangeColumnTitle: vi.fn(),
    getColumnById: vi.fn().mockResolvedValue({
      title: "Coluna Bacana!", id: "col-1", order: 100, boardId:"board-123",
      cards: [{ id: "card-1", title: "legal", completed:false, columnId:"col-1", position:100 }]
    } satisfies PromiseReturnType<typeof actions.getColumnById>
    ),
    getBoardById: vi.fn(),
    ChangeCompletedCard: vi.fn(),
    DeleteCard: vi.fn(),
    }
})


vi.mock("next/navigation", () => {
  return {
    useParams: () => ({ id: "board-123" })
  }
})
