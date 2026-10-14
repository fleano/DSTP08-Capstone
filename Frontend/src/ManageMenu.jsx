import ManageItemRow from "./ManageItemRow.jsx";
import "./App.css";

function ManageMenu({ categories, menuItems, loading, onItemUpdated, onBack }) {
    // Find the category name for an item
    function getCategoryName(item) {
        const category = categories.find((cat) => String(cat.id) === String(item.category));
        return category ? category.name : "No category";
    }

    return (
        <div className="homepage-wrapper">
            <div className="manage-container">
                <button className="back-button" onClick={onBack}>
                    &larr; Back to dashboard
                </button>

                <h2 className="section-title">Manage Menu</h2>
                <p className="manage-text">
                    Upload photos, mark dishes as available or unavailable, and set prices and specials.
                    Changes show on the customer menu straight away.
                </p>

                {loading && <p className="loading-text">Loading menu...</p>}

                {menuItems.map((item) => (
                    <ManageItemRow
                        key={item.id}
                        item={item}
                        categoryName={getCategoryName(item)}
                        onItemUpdated={onItemUpdated}
                    />
                ))}
            </div>
        </div>
    );
}

export default ManageMenu;
