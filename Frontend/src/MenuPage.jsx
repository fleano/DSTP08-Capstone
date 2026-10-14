import { useState } from "react";
import Navbar from "./Navbar.jsx";
import MenuItemCard from "./MenuItemCard.jsx";
import ContactFooter from "./ContactFooter.jsx";
import "./App.css";

function MenuPage({ user, isGuest, categories, menuItems, loading, addToCart, onNavigateToLogin, onLogout }) {
    // "All" or the id of one category
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Which categories to show (all of them, or just the chosen one)
    const shownCategories = categories.filter(
        (cat) => selectedCategory === "All" || String(cat.id) === String(selectedCategory)
    );

    return (
        <div className="homepage-wrapper">
            <Navbar
                user={user}
                isGuest={isGuest}
                onNavigateToLogin={onNavigateToLogin}
                onLogout={onLogout}
            />

            <section className="menu-section">
                <h2 className="section-title">Our Menu</h2>

                {/* Category buttons - the names come from the backend */}
                <div className="category-buttons">
                    <button
                        className={selectedCategory === "All" ? "category-btn active-category" : "category-btn"}
                        onClick={() => setSelectedCategory("All")}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            className={String(selectedCategory) === String(cat.id) ? "category-btn active-category" : "category-btn"}
                            onClick={() => setSelectedCategory(cat.id)}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {loading && <p className="loading-text">Loading menu...</p>}

                {/* One section for each category */}
                {shownCategories.map((cat) => {
                    const itemsInCategory = menuItems.filter(
                        (item) => String(item.category) === String(cat.id)
                    );

                    // Skip categories with no dishes
                    if (itemsInCategory.length === 0) {
                        return null;
                    }

                    return (
                        <div key={cat.id} className="category-section">
                            <h3 className="category-title">{cat.name}</h3>
                            <div className="food-grid">
                                {featuredItems.map((item) => (
                                    <FoodCard
                                        key={item.id}
                                        item={item} 
                                        onOrder={() => addToCart(item, 1)}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}
            </section>

            <ContactFooter />
        </div>
    );
}

export default MenuPage;
