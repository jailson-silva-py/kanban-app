import { TbIcons, TbInnerShadowTopLeft } from "react-icons/tb";

type Iprops = React.ComponentProps<typeof TbIcons>;

const LoadingSpinner: React.FC<Iprops> = ({ ...props }) => {
  return (
    <TbInnerShadowTopLeft
      {...props}
      className={`animate-spin ${props.className}`}
    />
  );
};

export default LoadingSpinner;
