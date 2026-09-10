"use client";
import useOutClick from "@/hooks/useOutClick";
import { ChangeEvent, FocusEvent, MouseEvent, useState } from "react";

type CustomSelectProps = {
  options: { value: string, label: string }[],
  handleSelect: (Props: { id: string, idx:number }) => void,
  placeholder:string,
} & React.ComponentProps<'select'>
export function CustomSelect(props: CustomSelectProps) {
  const [searchText, setSearchText] = useState("");
  const [openMenu, setOpenMenu] = useState(false);
  const cleanString = searchText.trim().toLowerCase()
  const filteredOptions = props.options.filter((actual) => actual.label.toLowerCase().trim().includes(cleanString))
  const ref  = useOutClick<HTMLDivElement>(() => {setOpenMenu(false)});
  const handleChangeSearchText = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const text = e.target.value.trim();
    setSearchText(text);
  }

  const changeSelectionText = ({label, value, idx}:{label:string, value:string, idx:number}) => (e: MouseEvent) => {
    e.preventDefault();
    setSearchText(label);
    if (searchText !== label) {
      setSearchText(label);
    }
    setOpenMenu(false);
    const finalObject: { id: string, idx: number } = {
      id: value, idx
    };
    props.handleSelect(finalObject);
  }
  const handleFocusInput = (e: FocusEvent) => {
    e.preventDefault();
    setOpenMenu(true);
  }

  return (
    <div className="relative w-full" ref={ref}>
      <input type="text" className="default-input h-8 focus-primary w-full" name="search-options" value={searchText}
        onChange={handleChangeSearchText} placeholder={props.placeholder} onFocus={handleFocusInput}/>
      {openMenu && <div className="absolute z-2 -bottom-1 translate-y-full flex flex-col gap-1 w-full bg-accent px-1 min-h-8 overflow-y-auto max-h-33 shadow-shadow shadow-default rounded-sm">
        {filteredOptions.map(({ value, label }, idx) => (
          <button type="button" key={value} onClick={changeSelectionText({label, value, idx})} className="btn-sm btn-ghost focus-secondary not-last:border-b border-shadow">
            {label}
          </button>
        ))}
        {filteredOptions.length === 0 && <p className="block mt-4 h-max p-1 text-xs text-center">Nenhum resultado encontrado.</p>}
      </div>
      }
    </div>
  )


}
