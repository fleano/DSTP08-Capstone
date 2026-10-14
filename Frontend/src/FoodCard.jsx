import "./App.css";

function FoodCard({ name, description, price, image, onOrder }) {
    return (
        <div className="food-card">
            <div className="food-image-placeholder">
                {image ? (
                    <img src={image} alt={name} />
                ) : (
                    <span className="dish-icon">🥡</span>
                )}
            </div>
            <div className="food-info">
                <h3>{name}</h3>
                <p className="food-description">{description}</p>
                <div className="food-footer">
                    <span className="food-price">${Number(price).toFixed(2)}</span>
                    <button className="order-btn" onClick={onOrder}>Order Now</button>
                </div>
            </div>
        </div>
    );
}

export default FoodCard;
