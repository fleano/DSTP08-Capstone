import { useState, useEffect } from "react";
import CartLine from "./CartLine.jsx";
import "./App.css";

function CartPanel({ cart, user, isOpen, onToggle, onChangeQuantity, onRemove, onClearCart, onNeedLogin }) {
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [checkingOut, setCheckingOut] = useState(false);

    // Work out the total price and the number of items
    let total = 0;
    let itemCount = 0;
    cart.forEach((item) => {
        total += item.price * item.quantity;
        itemCount += item.quantity;
    });

    // Clear old messages when new items are added
    useEffect(() => {
        if (cart.length > 0) {
            setMessage("");
            setError("");
        }
    }, [cart]);

    async function handleCheckout() {
        setMessage("");
        setError("");

        if (cart.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        // Must be logged in or a guest to check out
        if (user === null) {
            onNeedLogin();
            return;
        }

        // Only send the item ids and quantities - the backend works out the prices
        //const orderItems = cart.map((item) => ({ id: item.id, quantity: item.quantity }));

        // 1) foodID, 2) costPrice, 3) quantity of food
        const orderItems = cart.map((item) => ({
            foodID: item.id,
            costPrice: item.price,
            quantity: item.quantity
        }));

        setCheckingOut(true);

        let response;
        try {
            response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu/cart/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token") || ""
                },
                body: JSON.stringify({ items: orderItems })
            });
        } catch (err) {
            setError("Cannot reach the server. Please try again later.");
            setCheckingOut(false);
            return;
        }

        let data = {};
        try {
            data = await response.json();
        } catch (err) {
            console.log("Reply was not JSON. Status:", response.status);
        }
        console.log("Order response from backend:", response.status, data);

        setCheckingOut(false);

        if (!response.ok) {
            setError(data.message || "Checkout failed (status " + response.status + ").");
            return;
        }

        onClearCart();
        setMessage(data.message || "Order placed! Thank you.");
    }

    return (
        <div>
            {/* Button on the right side of the page */}
            <button className="cart-toggle-btn" onClick={onToggle}>
                🛒 Cart ({itemCount})
            </button>

            {isOpen && (
                <div className="cart-panel">
                    <div className="cart-header">
                        <h3>Your Cart</h3>
                        <button className="cart-close-btn" onClick={onToggle}>
                            &times;
                        </button>
                    </div>

                    {message !== "" && <div className="success-message">{message}</div>}
                    {error !== "" && <div className="error-message">{error}</div>}

                    {cart.length === 0 && message === "" && (
                        <p className="cart-empty">Your cart is empty.</p>
                    )}

                    {cart.map((item) => (
                        <CartLine
                            key={item.id}
                            item={item}
                            onChangeQuantity={onChangeQuantity}
                            onRemove={onRemove}
                        />
                    ))}

                    {cart.length > 0 && (
                        <div className="cart-footer">
                            <p className="cart-total-row">
                                Total: <span className="food-price">${total.toFixed(2)}</span>
                            </p>

                            {user === null && (
                                <p className="cart-hint">
                                    You'll be asked to sign in or continue as a guest.
                                </p>
                            )}

                            <button
                                className="checkout-btn"
                                onClick={handleCheckout}
                                disabled={checkingOut}
                            >
                                {checkingOut ? "Placing order..." : "Checkout"}
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CartPanel;
