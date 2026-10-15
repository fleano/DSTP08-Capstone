import { useState, useEffect } from "react";
import "./App.css";
import "./ManageMenu.css";

function ManageMenu({ categories, menuItems, loading, onItemUpdated, onItemDeleted, onBack }) {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Get current category name
    function getCategoryName(item) {
        if (!item || !categories) return "No category";
        const category = categories.find((cat) => String(cat.id) === String(item.category));
        return category ? category.name : "No category";
    }

    if (loading) {
        return <div className="manage-menu-container"><p className="loading-text">Loading menu items...</p></div>;
    }

    if (!menuItems || menuItems.length === 0) {
        return (
            <div className="manage-menu-container">
                <button className="back-button" onClick={onBack}>
                    &larr; Back to dashboard
                </button>
                <p style={{ marginTop: "2rem", color: "#ebd9bd" }}>No menu items available to manage.</p>
            </div>
        );
    }

    // Ensure index doesn't go out of bounds if an item is deleted
    const safeIndex = currentIndex >= menuItems.length ? Math.max(0, menuItems.length - 1) : currentIndex;
    const currentItem = menuItems[safeIndex] || {};

    const handleNext = () => {
        setCurrentIndex((prev) => (prev >= menuItems.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = () => {
        setCurrentIndex((prev) => (prev === 0 ? menuItems.length - 1 : prev - 1));
    };

    return (
        <div className="manage-menu-container">
            <button className="back-button" onClick={onBack} style={{ float: "left", marginBottom: "1rem" }}>
                &larr; Back to dashboard
            </button>
            <div style={{ clear: "both" }} />

            <div className="manage-menu-header">
                <h2 className="manage-menu-title">🍽️ Manage Menu</h2>
                <p className="manage-menu-subtitle">
                    Use the carousel arrows to switch dishes. Update details, toggle availability, change photos, or delete items.
                </p>
            </div>

            <div className="carousel-card">
                <div className="carousel-counter">
                    Item {safeIndex + 1} of {menuItems.length}
                </div>

                <div className="carousel-display-row">
                    <button className="carousel-arrow-btn" onClick={handlePrev}>
                        &#10094;
                    </button>

                    <div className="carousel-slide-content">
                        <ManageCarouselSlide 
                            key={currentItem.id} 
                            item={currentItem} 
                            categoryName={getCategoryName(currentItem)}
                            onItemUpdated={onItemUpdated}
                            onItemDeleted={onItemDeleted}
                        />
                    </div>

                    <button className="carousel-arrow-btn" onClick={handleNext}>
                        &#10095;
                    </button>
                </div>

                {/* Indicator Dots */}
                <div className="carousel-dots-container">
                    {menuItems.map((_, index) => (
                        <span
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`carousel-dot ${index === safeIndex ? "active" : "inactive"}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

// Sub-component that handles edits and deletion for the active carousel item
function ManageCarouselSlide({ item, categoryName, onItemUpdated, onItemDeleted }) {
    const [name, setName] = useState(item.name || "");
    const [description, setDescription] = useState(item.description || "");
    const [price, setPrice] = useState(item.price || 0);
    const [available, setAvailable] = useState(item.available !== false);
    const [isSpecial, setIsSpecial] = useState(item.isSpecial || false);
    const [discountedPrice, setDiscountedPrice] = useState(item.discountedPrice || "");
    
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(item.image || null);
    
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Keep state in sync if parent item updates or carousel changes slide
    useEffect(() => {
        setName(item.name || "");
        setDescription(item.description || "");
        setPrice(item.price || 0);
        setAvailable(item.available !== false);
        setIsSpecial(item.isSpecial || false);
        setDiscountedPrice(item.discountedPrice || "");
        setPreviewUrl(item.image || null);
        setImageFile(null); 
    }, [item]);

    function handleFileChange(e) {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    }

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        setError("");
        setSuccess("");

        if (!imageFile && !item.image) {
            setError("An image file is required to update this item.");
            setSaving(false);
            return;
        }

        const token = localStorage.getItem("token");
        const formData = new FormData();
        
        formData.append("id", item.id);
        formData.append("name", name);
        formData.append("description", description || "No description provided");
        formData.append("price", price);
        formData.append("foodCategory", item.category || 3);
        formData.append("enabled", "1");
        formData.append("available", available ? "1" : "0");
        formData.append("featured", isSpecial ? "1" : "0");

        if (isSpecial && discountedPrice !== "" && discountedPrice !== null) {
            formData.append("discountedPrice", discountedPrice);
        }

        if (imageFile) {
            formData.append("file", imageFile);
        }

        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu/editFood`, {
                method: "PUT",
                headers: {
                    "Authorization": token ? token : "",
                },
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || data.validationErrors || data.message || "Failed to update item.");
                setSaving(false);
                return;
            }

            const updatedImage = data.file && data.file.path
                ? `${import.meta.env.VITE_API_BASE_URL}/${data.file.path}`
                : previewUrl;

            const updatedItem = {
                ...item,
                name: name,
                description: description,
                price: Number(price),
                available: available,
                isSpecial: isSpecial,
                discountedPrice: isSpecial ? discountedPrice : null,
                image: updatedImage
            };

            onItemUpdated(updatedItem);
            setSuccess("Item updated successfully!");
        } catch (err) {
            console.error("Save error:", err);
            setError("Cannot reach the server.");
        }
        setSaving(false);
    }

    // Delete item handler
    async function handleDelete() {
        if (!window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
            return;
        }

        setDeleting(true);
        setError("");
        setSuccess("");

        const token = localStorage.getItem("token");

        try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu/deleteFood`, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": token ? token : "",
                },
                body: JSON.stringify({ id: item.id }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || data.message || "Failed to delete item.");
                setDeleting(false);
                return;
            }

            // Notify parent component to remove this item from state
            if (onItemDeleted) {
                onItemDeleted(item.id);
            }
        } catch (err) {
            console.error("Delete error:", err);
            setError("Cannot reach the server to delete item.");
            setDeleting(false);
        }
    }

    return (
        <form className="carousel-edit-form" onSubmit={handleSave}>
            <div className="carousel-image-window">
                {previewUrl ? (
                    <img src={previewUrl} alt={name} className="carousel-menu-image" />
                ) : (
                    <span className="carousel-no-image">No Image</span>
                )}
            </div>

            <div className="file-upload-section">
                <label className="upload-label">
                    📷 {imageFile ? "Image Selected" : "Change Photo (Required)"}
                    <input type="file" accept="image/*" onChange={handleFileChange} hidden />
                </label>
            </div>

            {error && <div className="error-message" style={{ whiteSpace: "pre-line" }}>{error}</div>}
            {success && <div className="success-message">{success}</div>}

            {/* Editable Fields Grid */}
            <div className="edit-fields-grid" style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                <div className="field-group">
                    <label>Item Name</label>
                    <input 
                        type="text" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)}
                        required 
                        style={{ width: "100%", padding: "6px 10px", background: "#2a1515", border: "1px solid #4a2525", color: "#f7d070", borderRadius: "4px" }}
                    />
                </div>

                <div className="field-group">
                    <label>Description</label>
                    <input 
                        type="text" 
                        value={description} 
                        onChange={(e) => setDescription(e.target.value)}
                        style={{ width: "100%", padding: "6px 10px", background: "#2a1515", border: "1px solid #4a2525", color: "#f7d070", borderRadius: "4px" }}
                    />
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                    <div className="field-group">
                        <label>Price ($)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            value={price} 
                            onChange={(e) => setPrice(e.target.value)}
                            required 
                        />
                    </div>

                    <div className="field-group">
                        <label>Discounted Price ($)</label>
                        <input 
                            type="number" 
                            step="0.01" 
                            disabled={!isSpecial}
                            placeholder={isSpecial ? "e.g., 6.00" : "Check Special Offer"}
                            value={discountedPrice} 
                            onChange={(e) => setDiscountedPrice(e.target.value)} 
                        />
                    </div>
                </div>

                <div style={{ display: "flex", gap: "2rem", marginTop: "0.5rem" }}>
                    <div className="field-group checkbox-group">
                        <label>
                            <input 
                                type="checkbox" 
                                checked={available} 
                                onChange={(e) => setAvailable(e.target.checked)} 
                            />
                            Available
                        </label>
                    </div>

                    <div className="field-group checkbox-group">
                        <label>
                            <input 
                                type="checkbox" 
                                checked={isSpecial} 
                                onChange={(e) => setIsSpecial(e.target.checked)} 
                            />
                            Special Offer (Featured)
                        </label>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="submit" className="save-item-btn" disabled={saving || deleting}>
                    {saving ? "Saving Changes..." : "💾 Save Changes"}
                </button>

                <button type="button" className="delete-item-btn" onClick={handleDelete} disabled={saving || deleting}>
                    {deleting ? "Deleting Item..." : "🗑️ Delete Item"}
                </button>
            </div>
        </form>
    );
}

export default ManageMenu;