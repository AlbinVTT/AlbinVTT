import React, { useState } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import ProductList from './ProductList';
import Cart from './Cart';
import OrderConfirmation from './OrderConfirmation';
import PaymentPage from './PaymentPage';
import axios from 'axios';

// ❌ REMOVE hardcoded baseURL — let browser resolve /login to API Gateway
// axios.defaults.baseURL = 'http://localhost:3001';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cart, setCart] = useState([]);
  const [order, setOrder] = useState({ items: [], total: 0 });
  const [error, setError] = useState('');

  const login = async () => {
    try {
      const response = await axios.post('/login', {
        user_id: username,
        password: password
      });

      if (response.data.status === 'success') {
        setIsLoggedIn(true);
        setError('');
      } else {
        setError('❌ Invalid username or password');
      }
    } catch (err) {
      console.error('Login error:', err.message);
      setError('❌ Login failed. Backend not reachable?');
    }
  };

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const handleUpdateQuantity = (productId, action) => {
    const index = cart.findIndex((item) => item.id === productId);
    if (index === -1) return;

    let updatedCart = [...cart];

    if (action === 'increase') {
      updatedCart.push(cart[index]);
    } else if (action === 'decrease') {
      const i = updatedCart.findIndex(item => item.id === productId);
      if (i !== -1) updatedCart.splice(i, 1);
    } else if (action === 'remove') {
      updatedCart = updatedCart.filter(item => item.id !== productId);
    }

    setCart(updatedCart);
  };

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert("🛒 Cart is empty, cannot checkout.");
      return;
    }

    const groupedItems = cart.reduce((acc, item) => {
      if (acc[item.id]) {
        acc[item.id].quantity += 1;
      } else {
        acc[item.id] = { ...item, quantity: 1 };
      }
      return acc;
    }, {});

    const items = Object.values(groupedItems);
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const deliveryFee = 40;
    const totalAmount = subtotal + deliveryFee;

    const orderPayload = {
      user_id: username,
      items: items.map(item => ({
        product_id: item.id || '',
        name: item.name || '',
        quantity: item.quantity || 1,
        price: item.price || 0
      })),
      total: totalAmount
    };

    try {
      const response = await axios.post("/submitorder", orderPayload);
      console.log("✅ Order submitted:", response.data);

      if (response.data.status === 'success') {
        setOrder({ items, total: totalAmount });
        setCart([]);
      } else {
        alert("Order failed at server.");
      }
    } catch (err) {
      console.error("❌ Order submission failed:", err.message);
      alert("Order submission failed");
    }
  };

  return (
    <Router>
      {!isLoggedIn ? (
        <div className="App">
          <img src="/images/logo.png" alt="eMart Logo" className="logo" />
          <h1 className="multicolor-title bounce">
            <span className="blue">e</span>
            <span className="green">M</span>
            <span className="orange">a</span>
            <span className="red">r</span>
            <span className="purple">t</span>&nbsp;
          </h1>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={e => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Enter your password"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button onClick={login}>Login</button>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <p className="register-link">New user? Register here</p>
        </div>
      ) : (
        <div>
          <nav className="top-nav">
            <Link to="/" className="brand">
              <img src="/images/logo.png" alt="eMart Logo" className="brand-logo" />
              <h1 className="brand-title bounce">
                <span className="blue">e</span>
                <span className="green">M</span>
                <span className="orange">a</span>
                <span className="red">r</span>
                <span className="purple">t</span>
              </h1>
            </Link>
            <Link to="/" className="nav-link product-link">🛍️ Products</Link>
            <Link to="/cart" className="nav-link cart-link">🛒 Cart <span className="cart-count">({cart.length})</span></Link>
          </nav>

          <Routes>
            <Route path="/" element={<ProductList onAddToCart={addToCart} />} />
            <Route path="/cart" element={<Cart cartItems={cart} onUpdateQuantity={handleUpdateQuantity} />} />
            <Route path="/payment" element={<PaymentPage cartItems={cart} setCart={setCart} onCheckout={handleCheckout} />} />
            <Route path="/confirmation" element={<OrderConfirmation order={order} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      )}
    </Router>
  );
}

export default App;

