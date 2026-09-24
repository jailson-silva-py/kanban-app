type Iprops = {
  children: React.ReactNode;
  mode?: "delete" | "normal";
} & React.ComponentProps<"button">;

const getDynamicHover = (mode: Iprops["mode"]) => {

  switch (mode) {
    case "delete":
      return "hover:text-error";
    case "normal":
      return "";
    default:
      return ""
  }

}

export function ButtonGhost({ children, mode = "normal", ...props }: Iprops) {

  const dynamicHover = getDynamicHover(mode);

  return (
    <button className={`flex justify-center items-center p-1 w-full btn-xs btn-ghost rounded-sm ${dynamicHover}`} {...props}>
      {children}
    </button>
  )
}