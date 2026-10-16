import { useState, useEffect } from "react";
import "./App.css";

const API = import.meta.env.VITE_API_BASE_URL;

function authHeaders() {
    return {
        "Content-Type": "application/json",
        Authorization: localStorage.getItem("token") || "",
    };
}

function ManageCoupons({ menuItems, onBack }) {
    const [customers, setCustomers] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [orders, setOrders] = useState([]);
    const [accountID, setAccountID] = useState("");
    const [foodID, setFoodID] = useState("");
    const [percent, setPercent] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    async function loadData() {
        try {
            const [custRes, couponRes, orderRes] = await Promise.all([
                fetch(`${API}/menu/coupons/customers`, { headers: authHeaders() }),
                fetch(`${API}/menu/coupons`, { headers: authHeaders() }),
                fetch(`${API}/menu/coupons/order-summary`, { headers: authHeaders() }),
            ]);
            if (!custRes.ok || !couponRes.ok || !orderRes.ok) {
                setError("Could not load coupon data.");
                return;
            }
            const custData = await custRes.json();
            const couponData = await couponRes.json();
            const orderData = await orderRes.json();
            setCustomers(custData.message || []);
            setCoupons(couponData.message || []);
            setOrders(orderData.message || []);
        } catch (err) {
            setError("Cannot reach the server. Please try again later.");
        }
    }

    useEffect(() => {
        loadData();
    }, []);

    // Fill the form from an order-history row so the manager only enters the %
    function handlePrefill(row) {
        setAccountID(String(row.accountID));
        setFoodID(String(row.foodID));
        setPercent(row.currentDiscount > 0 ? String(row.currentDiscount) : "");
        setMessage("");
        setError("");
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    async function handleSave() {
        setMessage("");
        setError("");

        const pct = Number(percent);
        if (accountID === "" || foodID === "") {
            setError("Choose a customer and a dish.");
            return;
        }
        if (!Number.isInteger(pct) || pct < 1 || pct > 100) {
            setError("Discount must be a whole number from 1 to 100.");
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`${API}/menu/coupons`, {
                method: "POST",
                headers: authHeaders(),
                body: JSON.stringify({
                    accountID: Number(accountID),
                    foodID: Number(foodID),
                    discountPercent: pct,
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setError(data.error || "Failed to save coupon.");
            } else {
                setMessage("Coupon saved.");
                setPercent("");
                await loadData();
            }
        } catch (err) {
            setError("Cannot reach the server. Please try again later.");
        }
        setSaving(false);
    }

    async function handleRemove(coupon) {
        setMessage("");
        setError("");
        try {
            const response = await fetch(`${API}/menu/coupons`, {
                method: "DELETE",
                headers: authHeaders(),
                body: JSON.stringify({
                    accountID: coupon.accountID,
                    foodID: coupon.foodID,
                }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                setError(data.error || "Failed to remove coupon.");
            } else {
                setMessage("Coupon removed.");
                await loadData();
            }
        } catch (err) {
            setError("Cannot reach the server. Please try again later.");
        }
    }

    return (
        <div className="homepage-wrapper">
            <section className="menu-section">
                <button className="admin-bar-btn" onClick={onBack}>
                    ← Back
                </button>
                <h2 className="section-title">Manage Coupons</h2>

                {message !== "" && <div className="success-message">{message}</div>}
                {error !== "" && <div className="error-message">{error}</div>}

                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", margin: "1rem 0" }}>
                    <select value={accountID} onChange={(e) => setAccountID(e.target.value)}>
                        <option value="">Select customer…</option>
                        {customers.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.username}
                            </option>
                        ))}
                    </select>

                    <select value={foodID} onChange={(e) => setFoodID(e.target.value)}>
                        <option value="">Select dish…</option>
                        {menuItems.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.name}
                            </option>
                        ))}
                    </select>

                    <input
                        type="number"
                        min="1"
                        max="100"
                        placeholder="% off"
                        value={percent}
                        onChange={(e) => setPercent(e.target.value)}
                        style={{ width: "6rem" }}
                    />

                    <button className="admin-bar-btn" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Coupon"}
                    </button>
                </div>

                <h3 className="category-title">Customer Order History</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "2rem" }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: "left" }}>Customer</th>
                            <th style={{ textAlign: "left" }}>Food ID</th>
                            <th style={{ textAlign: "left" }}>Dish</th>
                            <th style={{ textAlign: "left" }}>Qty Ordered</th>
                            <th style={{ textAlign: "left" }}>Orders</th>
                            <th style={{ textAlign: "left" }}>Total Spent</th>
                            <th style={{ textAlign: "left" }}>Current Discount</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan="8">No customer orders yet.</td>
                            </tr>
                        )}
                        {orders.map((o) => (
                            <tr key={`${o.accountID}-${o.foodID}`}>
                                <td>{o.username}</td>
                                <td>{o.foodID}</td>
                                <td>{o.foodName || "(deleted dish)"}</td>
                                <td>{o.totalQuantity}</td>
                                <td>{o.orderCount}</td>
                                <td>${Number(o.totalSpent).toFixed(2)}</td>
                                <td>{o.currentDiscount > 0 ? `${o.currentDiscount}%` : "-"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                <h3 className="category-title">Current Coupons</h3>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                        <tr>
                            <th style={{ textAlign: "left" }}>Customer</th>
                            <th style={{ textAlign: "left" }}>Dish</th>
                            <th style={{ textAlign: "left" }}>Discount</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {coupons.length === 0 && (
                            <tr>
                                <td colSpan="4">No coupons yet.</td>
                            </tr>
                        )}
                        {coupons.map((c) => (
                            <tr key={`${c.accountID}-${c.foodID}`}>
                                <td>{c.username}</td>
                                <td>{c.foodName}</td>
                                <td>{c.discountPercent}%</td>
                                <td>
                                    <button className="remove-btn" onClick={() => handleRemove(c)}>
                                        Remove
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>
        </div>
    );
}

export default ManageCoupons;
