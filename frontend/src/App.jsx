import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Homepage from "./homepage.jsx";
import MenuPage from "./MenuPage.jsx";
import LoginPage from "./LoginPage.jsx";
import AdminCreateAccount from "./AdminCreateAccount.jsx";
import CartPanel from "./CartPanel.jsx";
import ManageMenu from "./ManageMenu.jsx";
import StaffDashboard from "./staff/StaffDashboard.jsx";
import { mockCategories, mockMenuItems } from "./mockMenuData.js";
import { getFinalPrice } from "./priceHelper.js";
import "./App.css";

function App() {
    const navigate = useNavigate();
    const location = useLocation();

    // 1. Initialize user state by reading from localStorage
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem("restaurant_user");
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const [loginNotice, setLoginNotice] = useState("");

    // Menu data from the backend
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cart
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);

    function isStaffRole(role) {
        const r = String(role).toLowerCase();
        return (
            r === "0" || r === "1" || r === "2" ||
            r === "admin" || r === "root" || r === "manager" || r === "staff"
        );
    }

    function isAdminRole(role) {
        const r = String(role).toLowerCase();
        return r === "0" || r === "admin" || r === "root";
    }

    function isManagerPlusRole(role) {
        const r = String(role).toLowerCase();
        return r === "0" || r === "1" || r === "admin" || r === "root" || r === "manager";
    }

    function isGuestRole(role) {
        const r = String(role).toLowerCase();
        return r === "-1" || r === "guest";
    }

    const isGuest = user !== null && isGuestRole(user.role);

    // Get categories and food items from the backend
    useEffect(() => {
        async function loadMenu() {
            try {
                const menuResponse = await fetch(`${import.meta.env.VITE_API_BASE_URL}/menu/all`);

                if (menuResponse.ok) {
                    const menuData = await menuResponse.json();

                    // Use your static category array for the filter buttons
                    setCategories(mockCategories);

                    // Extract and normalize menu items from menuData.message
                    const rawItems = menuData.message || [];
                    const normalizedItems = rawItems.map((item) => ({
                        ...item,
                        id: item.id || item._id,
                        // Map backend 'imageLink' to frontend 'image' with full URL
                        image: item.imageLink ? `${import.meta.env.VITE_API_BASE_URL}/${item.imageLink}` : null,
                        // Map backend 'foodCategory' ID to frontend 'category'
                        category: item.foodCategory,
                        // Convert integer flags (1/0) to booleans
                        available: item.available === 1,
                        enabled: item.enabled === 1,
                    }));

                    setMenuItems(normalizedItems);
                } else {
                    console.error("Failed to fetch menu, status:", menuResponse.status);
                    setCategories(mockCategories);
                    setMenuItems(mockMenuItems);
                }
            } catch (err) {
                console.log("Backend fetch failed, using mock data:", err);
                setCategories(mockCategories);
                setMenuItems(mockMenuItems);
            }
            setLoading(false);
        }

        loadMenu();
    }, []);

    // ---------- Login / logout ----------

    function goToLogin(message) {
        setLoginNotice(message);
        navigate("/login");
    }

    function handleLogin(loggedInUser) {
        setUser(loggedInUser);
        // Save user to localStorage for persistence on refresh
        localStorage.setItem("restaurant_user", JSON.stringify(loggedInUser));

        // Staff go to dashboard, others go to homepage
        if (isStaffRole(loggedInUser.role)) {
            navigate("/staff");
        } else {
            navigate("/");
        }
    }

    function handleGuest() {
        const guestUser = { username: "Guest", name: "Guest", role: -1 };
        setUser(guestUser);
        // Save guest session as well if needed
        localStorage.setItem("restaurant_user", JSON.stringify(guestUser));
        navigate("/");
    }

    async function handleLogout() {
        try {
            await fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/logout`, { method: "POST" });
        } catch (err) {
            console.log("Logout request failed:", err);
        }

        setUser(null);
        // Clear user from localStorage on logout
        localStorage.removeItem("restaurant_user");
        setCart([]);
        navigate("/");
    }

    // ---------- Cart ----------

    function addToCart(item, quantity) {
        if (item.available === false) {
            return;
        }

        const finalPrice = getFinalPrice(item);

        setCart((prevCart) => {
            const existing = prevCart.find((c) => c.id === item.id);

            if (existing) {
                return prevCart.map((c) =>
                    c.id === item.id ? { ...c, quantity: c.quantity + quantity } : c
                );
            }

            return [
                ...prevCart,
                { id: item.id, name: item.name, price: Number(item.price), quantity: quantity }
            ];
        });
    }

    function changeQuantity(id, change) {
        setCart((prevCart) =>
            prevCart.map((c) =>
                c.id === id ? { ...c, quantity: Math.max(1, c.quantity + change) } : c
            )
        );
    }

    function removeFromCart(id) {
        setCart((prevCart) => prevCart.filter((c) => c.id !== id));
    }

    function clearCart() {
        setCart([]);
    }

    function updateMenuItem(updatedItem) {
        setMenuItems((prevItems) =>
            prevItems.map((item) =>
                item.id === updatedItem.id ? { ...item, ...updatedItem } : item
            )
        );
    }

    const showCart = location.pathname === "/" || location.pathname === "/menu";

    return (
        <div>
            <Routes>
                <Route
                    path="/"
                    element={
                        <Homepage
                            user={user}
                            isGuest={isGuest}
                            menuItems={menuItems}
                            loading={loading}
                            addToCart={addToCart}
                            onNavigateToLogin={() => goToLogin("")}
                            onLogout={handleLogout}
                        />
                    }
                />

                <Route
                    path="/menu"
                    element={
                        <MenuPage
                            user={user}
                            isGuest={isGuest}
                            categories={categories}
                            menuItems={menuItems}
                            loading={loading}
                            addToCart={addToCart}
                            onNavigateToLogin={() => goToLogin("")}
                            onLogout={handleLogout}
                        />
                    }
                />

                <Route
                    path="/login"
                    element={
                        <LoginPage
                            notice={loginNotice}
                            onLogin={handleLogin}
                            onGuest={handleGuest}
                            onBack={() => navigate("/")}
                        />
                    }
                />

                <Route
                    path="/staff"
                    element={
                        user && isStaffRole(user.role) ? (
                            <div>
                                {isManagerPlusRole(user.role) && (
                                    <div className="admin-bar">
                                        <span>
                                            Logged in as {user.username} ({isAdminRole(user.role) ? "admin" : "manager"})
                                        </span>
                                        <div>
                                            <button
                                                className="admin-bar-btn"
                                                onClick={() => navigate("/manage-menu")}
                                            >
                                                Manage Menu
                                            </button>
                                            {isAdminRole(user.role) && (
                                                <button
                                                    className="admin-bar-btn"
                                                    onClick={() => navigate("/create-account")}
                                                >
                                                    Create Account
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                                <StaffDashboard user={user} onLogout={handleLogout} />
                            </div>
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />

                <Route
                    path="/create-account"
                    element={
                        user && isAdminRole(user.role) ? (
                            <AdminCreateAccount onBack={() => navigate("/staff")} />
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />

                <Route
                    path="/manage-menu"
                    element={
                        user && isManagerPlusRole(user.role) ? (
                            <ManageMenu
                                categories={categories}
                                menuItems={menuItems}
                                loading={loading}
                                onItemUpdated={updateMenuItem}
                                onBack={() => navigate("/staff")}
                            />
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />
            </Routes>

            {showCart && (
                <CartPanel
                    cart={cart}
                    user={user}
                    isOpen={cartOpen}
                    onToggle={() => setCartOpen(!cartOpen)}
                    onChangeQuantity={changeQuantity}
                    onRemove={removeFromCart}
                    onClearCart={clearCart}
                    onNeedLogin={() => goToLogin("Please sign in or continue as a guest to check out.")}
                />
            )}
        </div>
    );
}

export default App;