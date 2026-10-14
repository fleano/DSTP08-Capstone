import PriceTag from "./PriceTag.jsx";
import { getBadgeText } from "./priceHelper.js";
import "./App.css";

function FoodCard({ item, onOrder }) {
    // Guard clause: if item is undefined or null, don't crash the app
    if (!item) {
        return null; 
    }

    // Items are available unless the backend says available: false
    const isAvailable = item.available !== false;
    const badge = isAvailable ? getBadgeText(item) : "";

    return (
        <div className={isAvailable ? "food-card" : "food-card unavailable"}>
            <div className="food-image-placeholder">
                {item.image ? (
                    <img src={item.image} alt={item.name} />
                ) : (
                    <span className="dish-icon">🥡</span>
                )}
                {badge !== "" && <span className="sale-badge">{badge}</span>}
                {!isAvailable && <span className="soldout-badge">Sold Out</span>}
            </div>
            <div className="food-info">
                <h3>{item.name}</h3>
                <p className="food-description">{item.description}</p>
                <div className="food-footer">
                    <PriceTag item={item} />
                    <button className="order-btn" onClick={onOrder} disabled={!isAvailable}>
                        {isAvailable ? "Order Now" : "Sold Out"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default FoodCard;