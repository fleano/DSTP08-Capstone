import { useState } from "react";
import Navbar from "./Navbar.jsx";
import MenuItemCard from "./MenuItemCard.jsx";
import ContactFooter from "./ContactFooter.jsx";
import "./App.css";

function MenuPage({ user, isGuest, categories, menuItems, loading, addToCart, onNavigateToLogin, onLogout }) {
    const [selectedCategory, setSelectedCategory] = useState("All");
    const isLoggedIn = user !== null && !isGuest;

    const shownCategories = categories.filter(
        (cat) => selectedCategory === "All" || String(cat.id) === String(selectedCategory)
    );

    const validCategoryIds = new Set(categories.map((cat) => String(cat.id)));

    // Find items that don't match ANY category in the categories array
    const uncategorizedItems = menuItems.filter((item) => {
        const itemCat = item.category ?? item.foodCategory;
        return itemCat === undefined || itemCat === null || !validCategoryIds.has(String(itemCat));
    });

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

                {/* Category buttons */}
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
                    {/* Optional: Add button for Uncategorized if any exist */}
                    {uncategorizedItems.length > 0 && (
                        <button
                            className={selectedCategory === "Uncategorized" ? "category-btn active-category" : "category-btn"}
                            onClick={() => setSelectedCategory("Uncategorized")}
                        >
                            Other / Uncategorized
                        </button>
                    )}
                </div>

                {loading && <p className="loading-text">Loading menu...</p>}

                {/* Render items by category */}
                {selectedCategory !== "Uncategorized" && shownCategories.map((cat) => {
                    const itemsInCategory = menuItems.filter((item) => {
                        const itemCat = item.category ?? item.foodCategory;
                        return String(itemCat) === String(cat.id);
                    });

                    // Skip categories with no dishes
                    if (itemsInCategory.length === 0) {
                        return null;
                    }

                    return (
                        <div key={cat.id} className="category-section">
                            <h3 className="category-title">{cat.name}</h3>
                            <div className="food-grid">
                                {itemsInCategory.map((item) => (
                                    <MenuItemCard
                                        key={item.id || item._id}
                                        item={item} 
                                        onAdd={addToCart}
                                        isLoggedIn={isLoggedIn}
                                    />
                                ))}
                            </div>
                        </div>
                    );
                })}

                {/* Render Uncategorized / Other Section */}
                {(selectedCategory === "All" || selectedCategory === "Uncategorized") && uncategorizedItems.length > 0 && (
                    <div className="category-section">
                        <h3 className="category-title">Other Items</h3>
                        <div className="food-grid">
                            {uncategorizedItems.map((item) => (
                                <MenuItemCard
                                    key={item.id || item._id}
                                    item={item} 
                                    onAdd={addToCart}
                                        isLoggedIn={isLoggedIn}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </section>

            <ContactFooter />
        </div>
    );
}

export default MenuPage;