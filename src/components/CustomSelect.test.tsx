import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CustomSelect } from "./CustomSelect";

describe("CustomSelect Component testing", () => {
  const options = [
    { value: "board-1", label: "Board Legal" },
    { value: "board-2", label: "Board de Test" },
  ];
  const handleSelect = vi.fn();

  beforeEach(() => {
    handleSelect.mockClear();
  });

  test("Renderiza o input de busca com o placeholder correto", () => {
    render(
      <CustomSelect
        options={options}
        handleSelect={handleSelect}
        placeholder="Pesquise um board..."
      />,
    );
    const input = screen.getByRole("textbox");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Pesquise um board...");
  });

  test("Ao focar no input, o menu abre com todas as opções", async () => {
    const user = userEvent.setup();
    render(
      <CustomSelect
        options={options}
        handleSelect={handleSelect}
        placeholder="Pesquise um board..."
      />,
    );
    await user.click(screen.getByRole("textbox"));
    options.forEach(({ label }) => {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    });
  });

  test("O menu fecha ao clicar fora do componente", async () => {
    const user = userEvent.setup();
    render(
      <CustomSelect
        options={options}
        handleSelect={handleSelect}
        placeholder="Pesquise um board..."
      />,
    );
    await user.click(screen.getByRole("textbox"));
    expect(screen.getByRole("button", { name: "Board Legal" })).toBeInTheDocument();
    await user.click(document.body);
    expect(screen.queryByRole("button", { name: "Board Legal" })).not.toBeInTheDocument();
  });

  test("Filtra as opções pelo texto de busca ignorando maiúsculas e espaços", async () => {
    const user = userEvent.setup();
    render(
      <CustomSelect
        options={options}
        handleSelect={handleSelect}
        placeholder="Pesquise um board..."
      />,
    );
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.type(input, "LEGAL");
    expect(screen.getByRole("button", { name: "Board Legal" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Board de Test" })).not.toBeInTheDocument();
  });

  test("Mostra 'Nenhum resultado encontrado.' quando não há coincidências", async () => {
    const user = userEvent.setup();
    render(
      <CustomSelect
        options={options}
        handleSelect={handleSelect}
        placeholder="Pesquise um board..."
      />,
    );
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.type(input, "zzz");
    expect(screen.getByText("Nenhum resultado encontrado.")).toBeInTheDocument();
  });

  test("Ao selecionar uma opção, chama handleSelect com { id, idx }, atualiza o input e fecha o menu", async () => {
    const user = userEvent.setup();
    render(
      <CustomSelect
        options={options}
        handleSelect={handleSelect}
        placeholder="Pesquise um board..."
      />,
    );
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.click(screen.getByRole("button", { name: "Board de Test" }));
    expect(handleSelect).toHaveBeenCalledWith({ id: "board-2", idx: 1 });
    expect(input).toHaveValue("Board de Test");
    expect(screen.queryByRole("button", { name: "Board de Test" })).not.toBeInTheDocument();
  });

  test("Selecionar a mesma opção de novo volta a chamar handleSelect", async () => {
    const user = userEvent.setup();
    render(
      <CustomSelect
        options={options}
        handleSelect={handleSelect}
        placeholder="Pesquise um board..."
      />,
    );
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.click(screen.getByRole("button", { name: "Board Legal" }));
    expect(handleSelect).toHaveBeenCalledTimes(1);
    await user.click(input);
    await user.click(screen.getByRole("button", { name: "Board Legal" }));
    expect(handleSelect).toHaveBeenCalledTimes(2);
  });

  test("O idx enviado a handleSelect corresponde à lista filtrada", async () => {
    const user = userEvent.setup();
    render(
      <CustomSelect
        options={options}
        handleSelect={handleSelect}
        placeholder="Pesquise um board..."
      />,
    );
    const input = screen.getByRole("textbox");
    await user.click(input);
    await user.type(input, "test");
    await user.click(screen.getByRole("button", { name: "Board de Test" }));
    expect(handleSelect).toHaveBeenCalledWith({ id: "board-2", idx: 0 });
  });
});
