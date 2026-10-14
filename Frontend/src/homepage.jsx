import { Link } from "react-router-dom";
import Navbar from "./Navbar.jsx";
import FoodCard from "./FoodCard.jsx";
import ContactFooter from "./ContactFooter.jsx";
import "./App.css";

function Homepage({ user, isGuest, menuItems, loading, addToCart, onNavigateToLogin, onLogout }) {
    // Only show the first 6 dishes on the homepage
    const featuredItems = menuItems.slice(0, 6);

    return (
        <div className="homepage-wrapper">
            <Navbar
                user={user}
                isGuest={isGuest}
                onNavigateToLogin={onNavigateToLogin}
                onLogout={onLogout}
            />

            {/* Hero banner */}
            <section id="home" className="hero-banner">
                <div className="hero-content">
                    <h1>Authentic Chinese Cuisine</h1>
                    <p>Experience the finest flavors crafted with passion and fresh ingredients.</p>
                    <Link to="/menu" className="hero-btn">View Menu</Link>
                </div>
            </section>

            {/* Featured food items */}
            <section id="featured" className="menu-section">
                <h2 className="section-title">Our Featured Dishes</h2>

                {loading && <p className="loading-text">Loading delicious items...</p>}

                <div className="food-grid">
                    {featuredItems.map((item) => (
                        <FoodCard
                            key={item.id}
                            name={item.name}
                            description={item.description}
                            price={item.price}
                            image={item.image}
                            onOrder={() => addToCart(item, 1)}
                        />
                    ))}
                </div>

                <div className="see-menu-wrapper">
                    <Link to="/menu" className="hero-btn">See Full Menu</Link>
                </div>
            </section>

            <ContactFooter />
        </div>
    );
}

export default Homepage;
