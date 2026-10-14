import { getFinalPrice, hasDiscount } from "./priceHelper.js";
import "./App.css";

function PriceTag({ item }) {
    // Guard clause in case item is missing
    if (!item || item.price === undefined) {
        return <span className="food-price">$0.00</span>;
    }

    const originalPrice = Number(item.price);
    const finalPrice = getFinalPrice(item);

    if (hasDiscount(item)) {
        return (
            <span>
                <span className="old-price">${originalPrice.toFixed(2)}</span>
                <span className="food-price">${finalPrice.toFixed(2)}</span>
            </span>
        );
    }

    return <span className="food-price">${originalPrice.toFixed(2)}</span>;
}

export default PriceTag;