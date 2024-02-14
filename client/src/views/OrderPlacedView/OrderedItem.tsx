import { TOrderedItem } from "../../@types/TOrderedItem";
import { useNavigate } from "react-router-dom";

interface Props {
  item: TOrderedItem,
  isFirst?: boolean,
  noBorder?: boolean,
  styles?: string,
  buyAgain?: boolean
}

const OrderedItem: React.FC<Props> = ({ item, isFirst, noBorder, styles, buyAgain }) => {
  const navigate = useNavigate();

  const goToProduct = () => {
    navigate(`/products/${item.product_id}`);
    window.scrollTo(0, 0);
  }

  return (
    <div className={`lg:py-5 max-lg:py-2 ${styles} border-b border-b-light-border dark:border-b-main-gray-border flex lg:gap-7 
    max-lg:gap-2 items-center ${isFirst ? "!pt-0" : ""} ${noBorder ? "!pb-0 !border-none" : ""}`}>
      <div className="w-[120px] h-[120px] max-lg:hidden bg-cover bg-center rounded-[8px] border border-light-border dark:border-search-border" 
      style={{backgroundImage: `url(${item.thumbnail})`}}>
      </div>
      <div className="pt-2 pb-2">
        <h2 className="text-main-text-black dark:text-main-text-white lg:text-[19px] max-lg:text-[17px] cursor-pointer 
        hover:!text-bg-primary-btn-hover btn w-fit" onClick={goToProduct}>
          {item.product_name}
        </h2>
        <p className="text-side-text-light dark:text-side-text-gray mt-[2px]">
          Size:
          <span className="text-main-text-black dark:text-main-text-white ml-2">{item.size}</span>
        </p>
        <p className="text-side-text-light dark:text-side-text-gray mt-[2px] md:hidden">
          Qty:
          <span className="text-main-text-black dark:text-main-text-white ml-2">{item.quantity}</span>
        </p>
      </div>
      <div className="flex items-center justify-end lg:gap-[150px] max-lg:gap-[70px] flex-grow">
        <p className="text-side-text-light dark:text-side-text-gray text-[17px] max-md:hidden">
          Qty.
          <span className="text-main-text-black dark:text-main-text-white ml-2">{item.quantity}</span>
        </p>
        <p className="text-main-text-black dark:text-main-text-white text-[17px] font-semibold mr-5">
          £{(item.price * item.quantity).toFixed(2)}
        </p>
      </div>
    </div>
  )
};

export default OrderedItem;