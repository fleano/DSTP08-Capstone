import { useState } from "react";
import { getFinalPrice } from "./priceHelper.js";
import "./App.css";

// One menu item in the Manage Menu page
function ManageItemRow({ item, categoryName, onItemUpdated }) {
    const [price, setPrice] = useState(String(item.price));
    const [discountType, setDiscountType] = useState(item.discountType || "none");
    const [discountValue, setDiscountValue] = useState(item.discountValue ? String(item.discountValue) : "");
    const [file, setFile] = useState(null);
    const [fileInputKey, setFileInputKey] = useState(0); // changing this empties the file box
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [busy, setBusy] = useState(false);

    const isAvailable = item.available !== false;

    // What the customer would pay with the numbers typed in right now
    const previewPrice = getFinalPrice({
        price: Number(price),
        discountType: discountType,
        discountValue: Number(discountValue)
    });

    // Sends a change to the backend (price, available, discount...). Returns true if it worked
    async function sendUpdate(changes) {
        let response;
        try {
            response = await fetch("/api/menu/" + item.id, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(changes)
            });
        } catch (err) {
            setError("Cannot reach the server. Please try again later.");
            return false;
        }

        let data = {};
        try {
            data = await response.json();
        } catch (err) {
            console.log("Reply was not JSON. Status:", response.status);
        }
        console.log("Update response from backend:", response.status, data);

        if (!response.ok) {
            setError(data.message || "Update failed (status " + response.status + ").");
            return false;
        }

        // Update the menu in App so customers see the change straight away
        onItemUpdated({ id: item.id, ...changes });
        return true;
    }

    async function handleToggleAvailable() {
        setMessage("");
        setError("");
        setBusy(true);

        const ok = await sendUpdate({ available: !isAvailable });
        if (ok) {
            setMessage(isAvailable ? "Marked as unavailable." : "Marked as available.");
        }

        setBusy(false);
    }

    async function handleSavePricing() {
        setMessage("");
        setError("");

        const newPrice = Number(price);
        if (price === "" || isNaN(newPrice) || newPrice <= 0) {
            setError("Please enter a valid price.");
            return;
        }

        let newValue = 0;

        if (discountType === "percent") {
            newValue = Number(discountValue);
            if (discountValue === "" || isNaN(newValue) || newValue <= 0 || newValue >= 100) {
                setError("Percent off must be more than 0 and less than 100.");
                return;
            }
        }

        if (discountType === "fixed") {
            newValue = Number(discountValue);
            if (discountValue === "" || isNaN(newValue) || newValue <= 0 || newValue >= newPrice) {
                setError("Special price must be more than 0 and lower than the regular price.");
                return;
            }
        }

        setBusy(true);

        const ok = await sendUpdate({
            price: newPrice,
            discountType: discountType,
            discountValue: newValue
        });
        if (ok) {
            setMessage("Pricing saved.");
        }

        setBusy(false);
    }

    async function handleUpload() {
        setMessage("");
        setError("");

        if (file === null) {
            setError("Please choose a photo first.");
            return;
        }
        if (!file.type.startsWith("image/")) {
            setError("That file is not an image.");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("The photo must be smaller than 5 MB.");
            return;
        }

        const formData = new FormData();
        formData.append("image", file);

        setBusy(true);

        let response;
        try {
            // No Content-Type header here - the browser sets it for file uploads
            response = await fetch("/api/menu/" + item.id + "/image", {
                method: "POST",
                body: formData
            });
        } catch (err) {
            setError("Cannot reach the server. Please try again later.");
            setBusy(false);
            return;
        }

        let data = {};
        try {
            data = await response.json();
        } catch (err) {
            console.log("Reply was not JSON. Status:", response.status);
        }
        console.log("Upload response from backend:", response.status, data);

        setBusy(false);

        if (!response.ok) {
            setError(data.message || "Upload failed (status " + response.status + ").");
            return;
        }
        if (!data.image) {
            setError("The server did not send back the new image link.");
            return;
        }

        // data.image is the link to the picture in the backend folder
        onItemUpdated({ id: item.id, image: data.image });
        setFile(null);
        setFileInputKey(fileInputKey + 1);
        setMessage("Photo uploaded!");
    }

    return (
        <div className={isAvailable ? "manage-row" : "manage-row manage-row-off"}>
            <div className="manage-image-box">
                {item.image ? (
                    <img src={item.image} alt={item.name} />
                ) : (
                    <span className="dish-icon">🥡</span>
                )}
            </div>

            <div className="manage-details">
                <div className="manage-top">
                    <div>
                        <h3 className="manage-name">{item.name}</h3>
                        <p className="manage-category">{categoryName}</p>
                    </div>
                    <div className="manage-availability">
                        <span className={isAvailable ? "status-pill status-on" : "status-pill status-off"}>
                            {isAvailable ? "Available" : "Unavailable"}
                        </span>
                        <button className="manage-btn" onClick={handleToggleAvailable} disabled={busy}>
                            {isAvailable ? "Mark Unavailable" : "Mark Available"}
                        </button>
                    </div>
                </div>

                {/* Photo */}
                <div className="manage-section">
                    <label className="manage-label">Photo</label>
                    <div className="manage-inline">
                        <input
                            key={fileInputKey}
                            type="file"
                            accept="image/*"
                            onChange={(e) => setFile(e.target.files[0] || null)}
                        />
                        <button className="manage-btn" onClick={handleUpload} disabled={busy}>
                            Upload Photo
                        </button>
                    </div>
                </div>

                {/* Pricing */}
                <div className="manage-section">
                    <label className="manage-label">Pricing</label>
                    <div className="manage-inline">
                        <div className="manage-field">
                            <span>Regular price ($)</span>
                            <input
                                className="manage-input"
                                type="number"
                                min="0"
                                step="0.01"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>

                        <div className="manage-field">
                            <span>Special / discount</span>
                            <select
                                className="manage-input"
                                value={discountType}
                                onChange={(e) => setDiscountType(e.target.value)}
                            >
                                <option value="none">None</option>
                                <option value="percent">Percent off (%)</option>
                                <option value="fixed">Special price ($)</option>
                            </select>
                        </div>

                        {discountType !== "none" && (
                            <div className="manage-field">
                                <span>{discountType === "percent" ? "Percent off" : "Special price"}</span>
                                <input
                                    className="manage-input"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    value={discountValue}
                                    onChange={(e) => setDiscountValue(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <p className="manage-preview">
                        Customers will pay: <strong>${previewPrice.toFixed(2)}</strong>
                    </p>
                    <button className="manage-btn" onClick={handleSavePricing} disabled={busy}>
                        Save Pricing
                    </button>
                </div>

                {message !== "" && <div className="success-message">{message}</div>}
                {error !== "" && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
}

export default ManageItemRow;
