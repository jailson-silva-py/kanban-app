
interface Iprops {
  children:React.ReactNode
}

const CardsColumn: React.FC<Iprops> = ({ children }) => {

  return (
    <div className="flex flex-col justify-baseline w-full h-full" aria-label="cards-column">
      { children }
    </div>
  );
};

export default CardsColumn;
