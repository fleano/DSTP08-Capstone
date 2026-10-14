import { useState } from "react";
import PriceTag from "./PriceTag.jsx";
import { getFinalPrice, getBadgeText } from "./priceHelper.js";
import "./App.css";

// Added 'isLoggedIn' to the destructuring of props
function MenuItemCard({ item, onAdd, isLoggedIn }) {
    const [quantity, setQuantity] = useState(1);
    const [addedMessage, setAddedMessage] = useState("");

    const isAvailable = item.available !== false;
    
    // Pass isLoggedIn to the badge helper so guests don't see a "Sale" badge
    const badge = isAvailable ? getBadgeText(item, isLoggedIn) : "";

    const handleIncrease = () => {
        setQuantity(prevQuantity => prevQuantity + 1);
    };

    const handleDecrease = () => {
        setQuantity(prevQuantity => (prevQuantity > 1 ? prevQuantity - 1 : 1));
    };

    const handleAdd = () => {
        onAdd(item, quantity);
        setQuantity(1);
        setAddedMessage("Added to cart ✓");
        setTimeout(() => setAddedMessage(""), 1500);
    };

    // Pass isLoggedIn to get the accurate price (standard for guest, discount for registered)
    const totalPrice = (quantity * getFinalPrice(item, isLoggedIn)).toFixed(2);

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
                
                {/* Pass isLoggedIn to the PriceTag so it renders the correct price view */}
                <p className="menu-card-price">
                    <PriceTag item={item} isLoggedIn={isLoggedIn} /> each
                </p>

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