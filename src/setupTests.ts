import "@testing-library/jest-dom";
import "@testing-library/user-event";
import * as actions from "@/actions/actions"

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { name: "Test User" } },
    status: "authenticated",
  }),
  SessionProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/actions/actions", ():typeof actions => {
  return {
  ChangeColumnTitle: vi.fn(),
  ChangeCompletedCard: vi.fn(),
  DeleteCard: vi.fn(),
  changeBoardTitle: vi.fn(),
  changeUserPassword: vi.fn(),
  changeUsername: vi.fn(),
  createBoardFromUser: vi.fn(),
  createCartForColumn: vi.fn(),
  createCartForColumnInBox: vi.fn(),
  createColumnFromBoard: vi.fn(),
  createToken: vi.fn(),
  createTokenNewUser: vi.fn(),
  deleteBoard: vi.fn(),
  deleteColumnById: vi.fn(),
  getAllBoardFromUser: vi.fn(),
  getAllColumnsById: vi.fn(),
  getBoardById: vi.fn(),
  getCardById: vi.fn(),
  getColumnById: vi.fn(),
  getColumnForInBoxUser: vi.fn(),
  getInBoxBoard: vi.fn(),
  getUser: vi.fn(),
  globalSearchWithText: vi.fn(),
  reOrderCardsFromColumns: vi.fn(),
  updateImageUser: vi.fn(),
  verifyNewUser: vi.fn(),
  verifyTokenCode: vi.fn(),
  verifyUserExistsByEmail: vi.fn(),
  createCommentCard:vi.fn(),
  deleteCommentCard:vi.fn(),
  editCommentCard:vi.fn(),
  editDescriptionCard:vi.fn(),
  editTitleCard:vi.fn(),
  getCommentsByCardId:vi.fn(),
};
});


afterAll(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
});

afterEach(() => {
  vi.resetAllMocks();
  vi.restoreAllMocks();
})
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.mock('auth', () => ({
  auth: vi.fn().mockResolvedValue({
    user: { id:"123", name: 'Test User', email: 'test@example.com', provider:"credentials-login", emailVerified:Date.now() },
  }),
  handlers: {},
  signIn: vi.fn(),
  signOut: vi.fn(),
}));


vi.mock("@/actions/wrappers", () => ({
  protectedActions: vi.fn((cb) => cb({ user: { id: "test-user" } })),
}));

vi.mock("next/navigation", () => {
  return {
    useParams: () => ({ id: "board-123" })
  }
})
