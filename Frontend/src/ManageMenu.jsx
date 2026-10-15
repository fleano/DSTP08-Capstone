import { useState, useEffect } from "react";
import "./App.css";
import "./ManageMenu.css";

function ManageMenu({
  categories,
  menuItems,
  loading,
  onItemUpdated,
  onItemDeleted,
  onItemAdded,
  onBack,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  function getCategoryName(item) {
    if (!item || !categories) return "No category";
    const category = categories.find(
      (cat) => String(cat.id) === String(item.category),
    );
    return category ? category.name : "No category";
  }

  if (loading) {
    return (
      <div className="manage-menu-container">
        <p className="loading-text">Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="manage-menu-container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <button className="back-button" onClick={onBack}>
          &larr; Back to dashboard
        </button>
        {!isCreatingNew && (
          <button
            className="admin-bar-btn"
            style={{
              background: "#4a2525",
              color: "#f7d070",
              padding: "8px 16px",
              cursor: "pointer",
              border: "1px solid #7a3535",
              borderRadius: "4px",
            }}
            onClick={() => setIsCreatingNew(true)}
          >
            + Add New Dish
          </button>
        )}
      </div>
      <div style={{ clear: "both" }} />

      <div className="manage-menu-header">
        <h2 className="manage-menu-title">
          {isCreatingNew ? "➕ Add New Menu Item" : "🍽️ Manage Menu"}
        </h2>
        <p className="manage-menu-subtitle">
          {isCreatingNew
            ? "Fill out the details below to add a new dish to the menu."
            : "Use the carousel arrows to switch dishes. Update details, toggle availability, change photos, or delete items."}
        </p>
      </div>

      {isCreatingNew ? (
        <ManageCarouselSlide
          isNew={true}
          categories={categories}
          onCancel={() => setIsCreatingNew(false)}
          onItemAdded={(newItem) => {
            onItemAdded(newItem);
            setIsCreatingNew(false);
          }}
        />
      ) : menuItems.length === 0 ? (
        <p style={{ marginTop: "2rem", color: "#ebd9bd" }}>
          No menu items available to manage.
        </p>
      ) : (
        <div className="carousel-card">
          <div className="carousel-counter">
            Item {currentIndex + 1} of {menuItems.length}
          </div>

          <div className="carousel-display-row">
            <button
              className="carousel-arrow-btn"
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev === 0 ? menuItems.length - 1 : prev - 1,
                )
              }
            >
              &#10094;
            </button>

            <div className="carousel-slide-content">
              <ManageCarouselSlide
                key={menuItems[currentIndex].id}
                item={menuItems[currentIndex]}
                categoryName={getCategoryName(menuItems[currentIndex])}
                categories={categories}
                onItemUpdated={onItemUpdated}
                onItemDeleted={onItemDeleted}
              />
            </div>

            <button
              className="carousel-arrow-btn"
              onClick={() =>
                setCurrentIndex((prev) =>
                  prev >= menuItems.length - 1 ? 0 : prev + 1,
                )
              }
            >
              &#10095;
            </button>
          </div>

          <div className="carousel-dots-container">
            {menuItems.map((_, index) => (
              <span
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`carousel-dot ${index === currentIndex ? "active" : "inactive"}`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ManageCarouselSlide({
  item = {},
  categories = [],
  categoryName,
  onItemUpdated,
  onItemDeleted,
  isNew = false,
  onItemAdded,
  onCancel,
}) {
  const [name, setName] = useState(item.name || "");
  const [description, setDescription] = useState(item.description || "");
  const [price, setPrice] = useState(item.price || 0);
  const [unitCost, setUnitCost] = useState(item.unitCost ?? "");
  const [category, setCategory] = useState(
    item.category || (categories[0] ? categories[0].id : 3),
  );
  const [available, setAvailable] = useState(
    isNew ? true : item.available !== false,
  );
  const [isSpecial, setIsSpecial] = useState(item.isSpecial || false);
  const [discountedPrice, setDiscountedPrice] = useState(
    item.discountedPrice || "",
  );

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(item.image || null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!isNew) {
      setName(item.name || "");
      setDescription(item.description || "");
      setPrice(item.price || 0);
      setUnitCost(item.unitCost ?? "");
      setCategory(item.category || 3);
      setAvailable(item.available !== false);
      setIsSpecial(item.isSpecial || false);
      setDiscountedPrice(item.discountedPrice || "");
      setPreviewUrl(item.image || null);
      setImageFile(null);
    }
  }, [item, isNew]);

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

    if (!imageFile && !isNew) {
      setError("An image file is required.");
      setSaving(false);
      return;
    }

    const token = localStorage.getItem("token");
    const formData = new FormData();

    if (!isNew) {
      formData.append("id", item.id);
    }
    formData.append("name", name);
    formData.append("description", description || "No description provided");
    formData.append("price", price);
    formData.append("unitCost", unitCost);
    formData.append("foodCategory", category);
    formData.append("enabled", "1");
    formData.append("available", available ? "1" : "0");
    formData.append("featured", isSpecial ? "1" : "0");

    if (isSpecial && discountedPrice !== "" && discountedPrice !== null) {
      formData.append("discountedPrice", discountedPrice);
    }

    if (imageFile) {
      formData.append("file", imageFile);
    }

    const endpoint = isNew ? "/menu/upload" : "/menu/editFood";
    const method = isNew ? "POST" : "PUT";

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}${endpoint}`,
        {
          method: method,
          headers: {
            Authorization: token ? token : "",
          },
          body: formData,
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.error ||
            data.validationErrors ||
            data.message ||
            "Failed to save item.",
        );
        setSaving(false);
        return;
      }

      const savedImage =
        data.file && data.file.path
          ? `${import.meta.env.VITE_API_BASE_URL}/${data.file.path}`
          : previewUrl;

      const savedItem = {
        id: isNew ? data.id || Date.now() : item.id,
        name: name,
        description: description,
        price: Number(price),
        unitCost: unitCost === "" ? null : Number(unitCost),
        category: Number(category),
        available: available,
        isSpecial: isSpecial,
        discountedPrice: isSpecial ? discountedPrice : null,
        image: savedImage,
        imageLink: data.file ? data.file.path : item.imageLink,
      };

      if (isNew) {
        setSuccess("Item added successfully!");
        if (onItemAdded) onItemAdded(savedItem);
      } else {
        onItemUpdated(savedItem);
        setSuccess("Item updated successfully!");
      }
    } catch (err) {
      console.error("Save error:", err);
      setError("Cannot reach the server.");
    }
    setSaving(false);
  }

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete "${item.name}"?`))
      return;

    setDeleting(true);
    setError("");
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/menu/deleteFood`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? token : "",
          },
          body: JSON.stringify({ id: item.id }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || data.message || "Failed to delete item.");
        setDeleting(false);
        return;
      }

      if (onItemDeleted) onItemDeleted(item.id);
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
          📷 {imageFile ? "Image Selected" : "Upload Photo (Required)"}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            hidden
            required={isNew}
          />
        </label>
      </div>

      {error && (
        <div className="error-message" style={{ whiteSpace: "pre-line" }}>
          {error}
        </div>
      )}
      {success && <div className="success-message">{success}</div>}

      <div
        className="edit-fields-grid"
        style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}
      >
        <div className="field-group">
          <label>Item Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{
              width: "100%",
              padding: "6px 10px",
              background: "#2a1515",
              border: "1px solid #4a2525",
              color: "#f7d070",
              borderRadius: "4px",
            }}
          />
        </div>

        <div className="field-group">
          <label>Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 10px",
              background: "#2a1515",
              border: "1px solid #4a2525",
              color: "#f7d070",
              borderRadius: "4px",
            }}
          />
        </div>

        <div className="field-group">
          <label>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 10px",
              background: "#2a1515",
              border: "1px solid #4a2525",
              color: "#f7d070",
              borderRadius: "4px",
            }}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem",
          }}
        >
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
            <label>Unit Cost ($)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              placeholder="Optional"
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

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "0.5rem",
          marginTop: "1rem",
        }}
      >
        <button
          type="submit"
          className="save-item-btn"
          disabled={saving || deleting}
        >
          {saving
            ? isNew
              ? "Adding Item..."
              : "Saving Changes..."
            : isNew
              ? "➕ Add Dish"
              : "💾 Save Changes"}
        </button>

        {isNew ? (
          <button
            type="button"
            className="delete-item-btn"
            onClick={onCancel}
            style={{ background: "#555" }}
          >
            Cancel
          </button>
        ) : (
          <button
            type="button"
            className="delete-item-btn"
            onClick={handleDelete}
            disabled={saving || deleting}
          >
            {deleting ? "Deleting Item..." : "🗑️ Delete Item"}
          </button>
        )}
      </div>
    </form>
  );
}

export default ManageMenu;
