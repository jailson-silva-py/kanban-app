"use client";
import { TbChalkboard, TbColumns, TbFile, TbSearch } from "react-icons/tb";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import useOutClick from "@/hooks/useOutClick";
import { globalSearchWithText } from "@/actions/actions";
import { useQuery } from "@tanstack/react-query";
import { Url } from "next/dist/shared/lib/router/router";
import { PromiseReturnType } from "@prisma/client/extension";
import { useRouter } from "next/navigation";

interface FormSearchProps {
  refInput: React.RefObject<HTMLInputElement | null>;
  setDebouncedText: React.Dispatch<React.SetStateAction<string>>;
}

type Result = PromiseReturnType<typeof globalSearchWithText>;

type ListItemProps = {
  valor: Result[keyof Result][number];
  children: React.ReactNode;
  href: Url;
  onClose: () => void;
} & React.ComponentProps<"li">;

const FormSearch = ({ refInput, setDebouncedText }: FormSearchProps) => {
  const [searchText, setSearchText] = useState("");

  const onSearch = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDebouncedText(searchText);
  };
  const handleChangeText = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedText(searchText);
    }, 300);
    return () => clearTimeout(timeout);
    //eslint-disable-next-line
  }, [searchText]);

  return (
    <form className="relative w-full" onSubmit={onSearch}>
      <TbSearch
        size={18}
        className="absolute left-2 top-1/2 -translate-y-1/2"
      />
      <input
        ref={refInput}
        type="search"
        placeholder="Pesquise algo..."
        name="search"
        value={searchText}
        max={100}
        onChange={handleChangeText}
        className="font-geist font-extralight bg-primary/30 pl-8 pr-4 py-2 text-xs h-10 w-full outline-none shadow-default rounded-lg tracking-widest shadow-shadow focus:shadow-seccondary/80"
      />
    </form>
  );
};

const ListItem = ({
  href,
  children,
  valor: value,
  onClose,
  ...props
}: ListItemProps) => {
  const router = useRouter();
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    onClose();
    router.push(e.currentTarget.href);
  };

  return (
    <li
      key={value.id}
      className="px-4 py-1 h-15 w-full text-xs tracking-widest font-geist overflow-y-auto not-last:border-b border-shadow/50 hover:pl-6 transition-[padding] duration-300"
      {...props}
    >
      <Link
        onClick={handleClick}
        href={href}
        className={`w-full h-full flex flex-col justify-center`}
      >
        {children}
        <p className="text-sm font-medium truncate">{value.title}</p>
      </Link>
    </li>
  );
};

const ListResultSearchContent = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <ul className="bg-primary/40 shadow-shadow/30 shadow-default min-h-30 rounded-lg overflow-x-auto max-h-120 ">
    {children}
  </ul>
);

const ListResultSearchSkeleton = () => (
  <ListResultSearchContent>
    <div className="px-4 py-1 h-15 w-full border-b border-shadow/30 text-xs tracking-widest font-geist overflow-y-auto">
      <div className="w-full h-full flex flex-col gap-1 justify-center">
        <div className="w-20 h-2 bg-shadow/50 animate-pulse" />
        <div className="w-60 h-4 bg-shadow/50 animate-pulse" />
      </div>
    </div>
    <div className="px-4 py-1 h-15 w-full  border-shadow/30 text-xs tracking-widest font-geist overflow-y-auto">
      <div className="w-full h-full flex flex-col gap-1 justify-center">
        <div className="w-20 h-2 bg-shadow/50 animate-pulse" />
        <div className="w-60 h-4 bg-shadow/50 animate-pulse" />
      </div>
    </div>
  </ListResultSearchContent>
);

const ListResultSearch = ({
  isPending,
  data,
  onClose,
}: {
  data: PromiseReturnType<typeof globalSearchWithText> | undefined;
  isPending: boolean;
  onClose: () => void;
}) => {
  if (
    !isPending &&
    (!data ||
      (data.cards.length === 0 &&
        data.columns.length === 0 &&
        data.boards.length === 0))
  )
    return (
      <ListResultSearchContent>
        <p className="px-8 py-8 text-center font-geist tracking-widest text-sm font-medium text-text/70">
          Nenhum resultado encontrado.
        </p>
      </ListResultSearchContent>
    );
  else if (isPending && !data)
    return (
      <ListResultSearchContent>
        <ListResultSearchSkeleton />
      </ListResultSearchContent>
    );
  else
    return (
      <ListResultSearchContent>
        {data?.boards.map((value) => (
          <ListItem
            key={value.id}
            href={`/board/${value.id}`}
            valor={value}
            onClose={onClose}
          >
            <div className="flex gap-1 items-center">
              <TbChalkboard size={16} />
              <small>Board</small>
            </div>
          </ListItem>
        ))}
        {data?.columns.map((value) => (
          <ListItem
            key={value.id}
            href={`/board/${value.boardId}#column-${value.id}`}
            valor={value}
            onClose={onClose}
          >
            <div className="flex gap-1 items-center">
              <TbColumns size={16} />
              <small>Column</small>
            </div>
          </ListItem>
        ))}
        {data?.cards.map((value) => (
          <ListItem
            key={value.id}
            href={`/board/${value.column.boardId}#card-${value.id}`}
            valor={value}
            onClose={onClose}
          >
            <div className="flex gap-1 items-center">
              <TbFile size={16} />
              <small>Card</small>
            </div>
          </ListItem>
        ))}
      </ListResultSearchContent>
    );
};

export default function GlobalSearch() {
  const [isSearching, setIsSearching] = useState(false);
  const [debouncedText, setDebouncedText] = useState("");

  const refContextSearchContext = useOutClick<HTMLDivElement>(() =>
    setIsSearching(false),
  );

  const refInput = useRef<HTMLInputElement>(null);

  const { isLoading, data } = useQuery({
    queryKey: ["globalSearch", debouncedText],
    queryFn: () => globalSearchWithText({ text: debouncedText }),
    enabled: debouncedText.length > 0,
    gcTime: 1000 * 60,
  });

  const handleSearchClick = () => {
    setDebouncedText("");
    setIsSearching(true);
  };

  const onClose = () => {
    setIsSearching(false);
  };

  useEffect(() => {
    if (!refInput?.current) return;
    refInput.current.focus();
  }, [isSearching]);

  return (
    <>
      {!isSearching ? (
        <button
          className="relative cursor-text text-start font-geist font-extralight bg-secondary/20 pl-8 pr-4 py-2 text-xs h-8 w-100 outline-none shadow-default rounded-lg tracking-widest shadow-shadow focus:shadow-primary/80"
          onClick={handleSearchClick}
        >
          <TbSearch
            size={18}
            className="absolute left-2 top-1/2 -translate-y-1/2"
          />
          Pesquise algo...
        </button>
      ) : (
        <div className="p-4 z-10 top-0 left-0 fixed  flex justify-center h-screen w-screen bg-primary/50 backdrop-blur-sm ">
          <div
            ref={refContextSearchContext}
            className="w-9/10 max-w-150 min-w-75  h-max flex flex-col gap-2"
          >
            <FormSearch
              refInput={refInput}
              setDebouncedText={setDebouncedText}
            />
            <ListResultSearch
              isPending={isLoading}
              data={data}
              onClose={onClose}
            />
          </div>
        </div>
      )}
    </>
  );
}
