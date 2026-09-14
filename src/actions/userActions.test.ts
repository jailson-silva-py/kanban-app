import { prisma } from "prisma";
import { auth } from "auth";
import { cloudinary } from "@/libs/cloudinary";
import { protectedActions } from "@/actions/wrappers";
import {
  getUser,
  verifyUserExistsByEmail,
  getInBoxBoard,
  updateImageUser,
  changeUsername,
} from "./userActions";

vi.mock("prisma", () => ({
  prisma: {
    user: { findFirst: vi.fn(), count: vi.fn(), update: vi.fn() },
    board: { findMany: vi.fn() },
  },
}));

vi.mock("@/libs/cloudinary", () => ({
  cloudinary: { uploader: { upload: vi.fn() } },
}));

const session = { user: { id: "123", email: "test@example.com" } };
const selectUser = {
  name: true,
  image: true,
  id: true,
  email: true,
  emailVerified: true,
};

beforeEach(() => {
  vi.mocked(auth).mockResolvedValue(session as never);
});

describe("getUser", () => {
  it("retorna null quando não há sessão", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);

    await expect(getUser()).resolves.toBeNull();
    expect(prisma.user.findFirst).not.toHaveBeenCalled();
  });

  it("retorna null quando a sessão não possui user.id", async () => {
    vi.mocked(auth).mockResolvedValueOnce({ user: {} } as never);

    await expect(getUser()).resolves.toBeNull();
  });

  it("busca o usuário logado com o select correto", async () => {
    const user = { id: "123", name: "Teste", image: null, email: "test@example.com", emailVerified: null };
    vi.mocked(prisma.user.findFirst).mockResolvedValueOnce(user as never);

    await expect(getUser()).resolves.toEqual(user);
    expect(prisma.user.findFirst).toHaveBeenCalledWith({
      where: { id: "123" },
      select: selectUser,
    });
  });
});

describe("verifyUserExistsByEmail", () => {
  it("chama count com o email informado e retorna a quantidade", async () => {
    vi.mocked(prisma.user.count).mockResolvedValueOnce(1);

    await expect(verifyUserExistsByEmail("fulano@email.com")).resolves.toBe(1);
    expect(prisma.user.count).toHaveBeenCalledWith({
      where: { email: "fulano@email.com" },
    });
  });
});

describe("getInBoxBoard", () => {
  it("retorna undefined quando não há sessão", async () => {
    vi.mocked(auth).mockResolvedValueOnce(null as never);

    await expect(getInBoxBoard("123")).resolves.toBeUndefined();
    expect(prisma.board.findMany).not.toHaveBeenCalled();
  });

  it("busca os boards inbox do owner informado", async () => {
    const boards = [{ id: "inbox-1", title: "InBox" }];
    vi.mocked(prisma.board.findMany).mockResolvedValueOnce(boards as never);

    await expect(getInBoxBoard("123")).resolves.toEqual(boards);
    expect(prisma.board.findMany).toHaveBeenCalledWith({
      where: { isInbox: true, ownerId: "123" },
    });
  });
});

describe("updateImageUser", () => {
  it("faz upload na cloudinary e atualiza a imagem do usuário", async () => {
    const secureUrl = "https://res.cloudinary.com/xxx/image/upload/v1/avatar.jpg";
    vi.mocked(cloudinary.uploader.upload).mockResolvedValueOnce({ secure_url: secureUrl } as never);
    vi.mocked(prisma.user.update).mockResolvedValueOnce({ id: "test-user", image: secureUrl } as never);

    await expect(updateImageUser({ url: "data:image/png;base64,abc" })).resolves.toBe(secureUrl);

    expect(cloudinary.uploader.upload).toHaveBeenCalledWith("data:image/png;base64,abc", {
      resource_type: "image",
    });
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "test-user" },
      data: { image: secureUrl },
    });
  });

  it("não atualiza o usuário quando a resposta não possui secure_url", async () => {
    vi.mocked(cloudinary.uploader.upload).mockResolvedValueOnce({} as never);

    await expect(updateImageUser({ url: "data:image/png;base64,abc" })).resolves.toBeUndefined();
    expect(prisma.user.update).not.toHaveBeenCalled();
  });

  it("propaga erro da cloudinary", async () => {
    vi.mocked(cloudinary.uploader.upload).mockRejectedValueOnce(new Error("upload falhou"));

    await expect(updateImageUser({ url: "x" })).rejects.toThrow("upload falhou");
  });
});

describe("changeUsername", () => {
  it("atualiza o nome do usuário logado e retorna o usuário", async () => {
    const updated = {
      id: "test-user",
      name: "Novo Nome",
      email: "test@example.com",
      image: null,
      emailVerified: null,
    };
    vi.mocked(prisma.user.update).mockResolvedValueOnce(updated as never);

    await expect(changeUsername({ newName: "Novo Nome" })).resolves.toEqual(updated);
    expect(prisma.user.update).toHaveBeenCalledWith({
      where: { id: "test-user" },
      data: { name: "Novo Nome" },
      select: selectUser,
    });
  });

  it("é executada por meio do protectedActions", async () => {
    await changeUsername({ newName: "X" });
    expect(protectedActions).toHaveBeenCalled();
  });
});