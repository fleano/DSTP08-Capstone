import { useState } from "react";
import PriceTag from "./PriceTag.jsx";
import { getFinalPrice, getBadgeText } from "./priceHelper.js";
import "./App.css";

// One dish on the menu page. Works like CartItem: + and - buttons and a total
function MenuItemCard({ item, onAdd }) {
    const [quantity, setQuantity] = useState(1);
    const [addedMessage, setAddedMessage] = useState("");

    // Items are available unless the backend says available: false
    const isAvailable = item.available !== false;
    const badge = isAvailable ? getBadgeText(item) : "";

    const handleIncrease = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };

    const handleDecrease = () => {
        // Minimum is 1
        setQuantity(prevQuantity => (prevQuantity > 1 ? prevQuantity - 1 : 1));
    };

    const handleAdd = () => {
        onAdd(item, quantity);
        setQuantity(1);
        setAddedMessage("Added to cart ✓");
        setTimeout(() => setAddedMessage(""), 1500);
    };

    // Total price for the chosen quantity (uses the special / discount price)
    const totalPrice = (quantity * getFinalPrice(item)).toFixed(2);

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
                <p className="menu-card-price"><PriceTag item={item} /> each</p>

                <div className="quantity-controls">
                    <button
                        onClick={handleDecrease}
                        disabled={quantity === 1 || !isAvailable}
                        className="qty-btn"
                    >
                        -
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button onClick={handleIncrease} disabled={!isAvailable} className="qty-btn">
                        +
                    </button>
                </div>

                <p className="menu-card-total">
                    Total: <span className="food-price">${totalPrice}</span>
                </p>

                <button className="add-cart-btn" onClick={handleAdd} disabled={!isAvailable}>
                    {isAvailable ? "Add to Cart" : "Unavailable"}
                </button>

                {addedMessage !== "" && <p className="added-message">{addedMessage}</p>}
            </div>
        </div>
    );
}

export default MenuItemCard;
