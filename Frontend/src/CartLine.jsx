import "./App.css";

function CartLine({ item, onChangeQuantity, onRemove }) {
    const lineTotal = (item.quantity * item.price).toFixed(2);

    return (
        <div className="cart-line">
            <div className="cart-line-top">
                <span className="cart-line-name">{item.name}</span>
                <span className="cart-line-price">${Number(item.price).toFixed(2)} each</span>
            </div>

            <div className="quantity-controls">
                <button
                    onClick={() => onChangeQuantity(item.id, -1)}
                    disabled={item.quantity === 1}
                    className="qty-btn"
                >
                    -
                </button>
                <span className="quantity-display">{item.quantity}</span>
                <button onClick={() => onChangeQuantity(item.id, 1)} className="qty-btn">
                    +
                </button>
            </div>

            <div className="cart-line-bottom">
                <button className="remove-btn" onClick={() => onRemove(item.id)}>
                    Remove
                </button>
                <span>Total: <span className="food-price">${lineTotal}</span></span>
            </div>
        </div>
    );
}

export default CartLine;
