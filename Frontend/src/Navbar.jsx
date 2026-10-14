import { Link } from "react-router-dom";
import "./App.css";

function Navbar({ user, isGuest, onNavigateToLogin, onLogout }) {
    return (
        <nav className="navbar">
            <div className="nav-brand">🍜 Golden Dragon</div>
            <div className="nav-links">
                <Link to="/">Home</Link>
                <Link to="/menu">Menu</Link>
                <a href="#contact">Contact Us</a>

                {/* Logged in customers see Logout. Guests and visitors see Login */}
                {user && !isGuest ? (
                    <div className="nav-user-section">
                        <span>Hi, {user.name}</span>
                        <button className="nav-login-btn" onClick={onLogout}>
                            Logout
                        </button>
                    </div>
                ) : (
                    <div className="nav-user-section">
                        {isGuest && <span>Hi, Guest</span>}
                        <button className="nav-login-btn" onClick={onNavigateToLogin}>
                            Login / Register
                        </button>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
