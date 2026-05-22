import LoadingSpinner from "./LoadingSpinner";

const CardsLoading = () => {
  return (
    <ul className="relative px-8 py-4 w-full items-center gap-4 h-full justify-center opacity-25">
      <LoadingSpinner size={ 64 } className="relative top-[calc(50%-64px)] left-[calc(50%-32px)]" />
    </ul>
  );
};

export default CardsLoading;
