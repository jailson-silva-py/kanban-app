
interface Iprops {
  children:React.ReactNode
}

const CardsColumn: React.FC<Iprops> = ({ children }) => {

  return (
    <div className="flex flex-col justify-baseline w-full h-full">
      { children }
    </div>
  );
};

export default CardsColumn;
