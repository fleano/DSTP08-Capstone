import { useState, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import Homepage from "./homepage.jsx";
import MenuPage from "./MenuPage.jsx";
import LoginPage from "./LoginPage.jsx";
import AdminCreateAccount from "./AdminCreateAccount.jsx";
import CartPanel from "./CartPanel.jsx";
import StaffDashboard from "./staff/StaffDashboard.jsx";
import { mockCategories, mockMenuItems } from "./mockMenuData.js";
import "./App.css";

function App() {
    const navigate = useNavigate();
    const location = useLocation();

    const [user, setUser] = useState(null);
    const [loginNotice, setLoginNotice] = useState("");

    // Menu data from the backend
    const [categories, setCategories] = useState([]);
    const [menuItems, setMenuItems] = useState([]);
    const [loading, setLoading] = useState(true);

    // Cart
    const [cart, setCart] = useState([]);
    const [cartOpen, setCartOpen] = useState(false);

    // Roles from the API: guest = -1, admin = 0, manager = 1, staff = 2, customer = 3
    // The role might come back as a number (0), a text number ("0") or a word ("admin"),
    // so we turn it into lowercase text first and check all of them
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

    function isGuestRole(role) {
        const r = String(role).toLowerCase();
        return r === "-1" || r === "guest";
    }

    const isGuest = user !== null && isGuestRole(user.role);

    // Get the categories and food items from the backend when the app first loads
    useEffect(() => {
        async function loadMenu() {
            try {
                const categoryResponse = await fetch("/api/categories");
                const menuResponse = await fetch("/api/menu");

                if (categoryResponse.ok && menuResponse.ok) {
                    const categoryData = await categoryResponse.json();
                    const menuData = await menuResponse.json();

                    setCategories(categoryData);
                    // make sure every item has an id (some databases call it _id)
                    setMenuItems(menuData.map((item) => ({ ...item, id: item.id || item._id })));
                } else {
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

        // Staff go to the dashboard, everyone else goes to the homepage
        if (isStaffRole(loggedInUser.role)) {
            navigate("/staff");
        } else {
            navigate("/");
        }
    }

    function handleGuest() {
        setUser({ username: "Guest", name: "Guest", role: -1 });
        navigate("/");
    }

    async function handleLogout() {
        // Tell the backend we are logging out too
        try {
            await fetch("/auth/logout", { method: "POST" });
        } catch (err) {
            console.log("Logout request failed:", err);
        }

        setUser(null);
        setCart([]);
        navigate("/");
    }

    // ---------- Cart ----------

    function addToCart(item, quantity) {
        setCart((prevCart) => {
            const existing = prevCart.find((c) => c.id === item.id);

            // Already in the cart? Just add to the quantity
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

    // The cart button only shows on the customer pages
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

                {/* Only staff, managers and the admin can open the dashboard */}
                <Route
                    path="/staff"
                    element={
                        user && isStaffRole(user.role) ? (
                            <div>
                                {isAdminRole(user.role) && (
                                    <div className="admin-bar">
                                        <span>Logged in as {user.username} (admin)</span>
                                        <button
                                            className="admin-bar-btn"
                                            onClick={() => navigate("/create-account")}
                                        >
                                            Create Account
                                        </button>
                                    </div>
                                )}
                                <StaffDashboard user={user} onLogout={handleLogout} />
                            </div>
                        ) : (
                            <Navigate to="/" />
                        )
                    }
                />

                {/* Only the admin (root) can open the create account page */}
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
