
interface Iprops {
  children: React.ReactNode
}

const CardsColumn: React.FC<Iprops> = ({ children }) => {

  return (
    <div className="grid grid-rows-[auto_1fr] justify-baseline w-full h-full overflow-hidden" aria-label="cards-column">
      {children}
    </div>
  );
};

export default CardsColumn;
