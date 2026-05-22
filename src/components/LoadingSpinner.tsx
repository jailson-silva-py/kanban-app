import { TbIcons, TbLoader3 } from "react-icons/tb";

type Iprops = React.ComponentProps<typeof TbIcons>;

const LoadingSpinner: React.FC<Iprops> = ({ ...props }) => {
  return (
    <TbLoader3 size={ 16 } {...props} className={`[stroke-dasharray:90] [stroke-dashoffset:90] animate-draw-spin ${props.className||""}`}
    />
  );
};

export default LoadingSpinner;
