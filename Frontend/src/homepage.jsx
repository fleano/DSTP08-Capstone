import React, { useEffect, useState } from 'react';
import './App.css';

export default function Homepage({ onNavigateToLogin, user, onLogout }) {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch food items from backend API when component mounts
  useEffect(() => {
    async function fetchMenu() {
      try {
        // REPLACE URL WITH THE BACKEND API
        const response = await fetch('http://localhost:5000/api/menu'); 
        
        if (response.ok) {
          const data = await response.json();
          setFoodItems(data);
        } else {
          // Fallback mock data if no backend
          setFoodItems(mockFoodData);
        }
      } catch (err) {
        console.warn('Backend fetch failed, using fallback data:', err);
        setFoodItems(mockFoodData);
      } finally {
        setLoading(false);
      }
    }

    fetchMenu();
  }, []);

  return (
    <div className="homepage-wrapper">
      {/* 1. TOP NAVBAR */}
      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">🍜</span> Golden Dragon
        </div>
        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#menu">Menu</a>
          <a href="#contact">Contact Us</a>
          
          {/* Adding a logout button here */}
          {user ? (
            <div className="nav-user-section" style={{ display: 'inline-flex', gap: '10px', alignItems: 'center' }}>
              <button className="nav-login-btn" onClick={onNavigateToLogin}>
                Account ({user.email})
              </button>
              <button className="nav-logout-btn" onClick={onLogout}>
                Logout
              </button>
            </div>
          ) : (
            <button className="nav-login-btn" onClick={onNavigateToLogin}>
              Login / Register
            </button>
          )}

        </div>
      </nav>

      {/* 2. HERO BANNER */}
      <section id="home" className="hero-banner">
        <div className="hero-content">
          <h1>Authentic Chinese Cuisine</h1>
          <p>Experience the finest flavors crafted with passion and fresh ingredients.</p>
          <a href="#menu" className="hero-btn">View Menu</a>
        </div>
      </section>

      {/* 3. FEATURED FOOD ITEMS (FROM BACKEND) */}
      <section id="menu" className="menu-section">
        <h2 className="section-title">Our Featured Dishes</h2>
        
        {loading ? (
          <p className="loading-text">Loading delicious items...</p>
        ) : (
          <div className="food-grid">
            {foodItems.map((item) => (
              <div key={item.id || item._id} className="food-card">
                <div className="food-image-placeholder">
                  {item.image ? (
                    <img src={item.image} alt={item.name} />
                  ) : (
                    <span className="dish-icon">🥡🍣</span>
                  )}
                </div>
                <div className="food-info">
                  <h3>{item.name}</h3>
                  <p className="food-description">{item.description}</p>
                  <div className="food-footer">
                    <span className="food-price">${item.price?.toFixed(2)}</span>
                    <button className="order-btn">Order Now</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. ADDRESS & CONTACT SECTION */}
      <section id="contact" className="contact-section">
        <h2 className="section-title">Visit & Contact Us</h2>
        <div className="contact-container">
          <div className="contact-info">
            <div className="info-item">
              <span className="info-icon">📍</span>
              <div>
                <h4>Address</h4>
                <p>123 Culinary Street, Chinatown, Cityville</p>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">📞</span>
              <div>
                <h4>Phone Number</h4>
                <p>+1 (123) 123-4567</p>
              </div>
            </div>

            <div className="info-item">
              <span className="info-icon">🕒</span>
              <div>
                <h4>Opening Hours</h4>
                <p>Tue - Sun: 09:00 AM - 06:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="homepage-footer">
        <p>Made by DSTP08 group X &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

// Temporary Mock Data in case backend isn't running yet
const mockFoodData = [
  {
    id: 1,
    name: 'Peking Roasted Duck',
    description: 'Crispy skin sliced with soft steamed buns, scallions, and XO sauce.',
    price: 28.99,
  },
  {
    id: 2,
    name: 'Kung Pao Chicken',
    description: 'Spicy stir-fried chicken with peanuts, vegetables and chili peppers.',
    price: 15.50,
  },
  {
    id: 3,
    name: 'Xiao Long Bao (Soup Dumplings)',
    description: 'Steamed pork dumplings with every bite that melts inside.',
    price: 12.00,
  },
  {
    id: 4,
    name: 'Szechuan Mapo Tofu',
    description: 'Tofu set in a spicy sauce mixed with douban sauce and minced meat.',
    price: 13.50,
  },
];