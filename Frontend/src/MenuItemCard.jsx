import { useState } from "react";
import "./App.css";

// One dish on the menu page. Works like CartItem: + and - buttons and a total
function MenuItemCard({ item, onAdd }) {
    const [quantity, setQuantity] = useState(1);
    const [addedMessage, setAddedMessage] = useState("");

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

    // Total price for the chosen quantity
    const totalPrice = (quantity * Number(item.price)).toFixed(2);

    return (
        <div className="food-card">
            <div className="food-image-placeholder">
                {item.image ? (
                    <img src={item.image} alt={item.name} />
                ) : (
                    <span className="dish-icon">🥡</span>
                )}
            </div>

            <div className="food-info">
                <h3>{item.name}</h3>
                <p className="food-description">{item.description}</p>
                <p className="food-price">${Number(item.price).toFixed(2)} each</p>

                <div className="quantity-controls">
                    <button
                        onClick={handleDecrease}
                        disabled={quantity === 1}
                        className="qty-btn"
                    >
                        -
                    </button>
                    <span className="quantity-display">{quantity}</span>
                    <button onClick={handleIncrease} className="qty-btn">
                        +
                    </button>
                </div>

                <p className="menu-card-total">
                    Total: <span className="food-price">${totalPrice}</span>
                </p>

                <button className="add-cart-btn" onClick={handleAdd}>
                    Add to Cart
                </button>

                {addedMessage !== "" && <p className="added-message">{addedMessage}</p>}
            </div>
        </div>
    );
}

export default MenuItemCard;
