import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PaymentPage.css';
import confetti from 'canvas-confetti';

function PaymentPage({ cartItems, onCheckout, setCart }) {
  const [method, setMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  // Group identical items
  const grouped = cartItems.reduce((acc, item) => {
    if (acc[item.id]) {
      acc[item.id].quantity += 1;
    } else {
      acc[item.id] = { ...item, quantity: 1 };
    }
    return acc;
  }, {});
  const items = Object.values(grouped);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const delivery = 40;
  const total = subtotal + delivery;

  const handlePayment = () => {
    setIsProcessing(true);

    setTimeout(async () => {
      try {
        confetti({ particleCount: 80, spread: 60 });
        await onCheckout();         // Wait for successful backend submission
        setCart([]);                // Clear cart only after success
        navigate('/confirmation');  // Redirect to confirmation page
      } catch (err) {
        alert("❌ Order failed, please try again.");
        setIsProcessing(false);     // Re-enable button
      }
    }, 2000);
  };

  return (
    <div className="payment-wrapper">
      <h2>Choose Payment Method</h2>

      <div className="payment-methods">
        <label>
          <input
            type="radio"
            value="card"
            checked={method === 'card'}
            onChange={() => setMethod('card')}
            disabled={isProcessing}
          />
          💳 Card
        </label>
        <label>
          <input
            type="radio"
            value="upi"
            checked={method === 'upi'}
            onChange={() => setMethod('upi')}
            disabled={isProcessing}
          />
          🏦 UPI
        </label>
        <label>
          <input
            type="radio"
            value="cod"
            checked={method === 'cod'}
            onChange={() => setMethod('cod')}
            disabled={isProcessing}
          />
          📦 Cash on Delivery
        </label>
      </div>

      <div className="payment-form">
        {method === 'card' && (
          <>
            <input type="text" placeholder="Card Number" disabled={isProcessing} />
            <input type="text" placeholder="Cardholder Name" disabled={isProcessing} />
            <div className="card-details">
              <input type="text" placeholder="MM/YY" disabled={isProcessing} />
              <input type="text" placeholder="CVV" disabled={isProcessing} />
            </div>
          </>
        )}
        {method === 'upi' && (
          <input type="text" placeholder="Enter UPI ID (e.g. name@bank)" disabled={isProcessing} />
        )}
        {method === 'cod' && (
          <p>No advance payment required. Please pay on delivery.</p>
        )}
      </div>

      <div className="payment-summary">
        <h3>Payment Summary</h3>
        <p><strong>Items:</strong> {totalItems}</p>
        <p><strong>Subtotal:</strong> ₹{subtotal}</p>
        <p><strong>Delivery Fee:</strong> ₹{delivery}</p>
        <p className="total"><strong>Total Payment:</strong> ₹{total}</p>
      </div>

      <button className="pay-button" onClick={handlePayment} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Pay Now'}
      </button>

      {isProcessing && <div className="payment-progress"><div className="bar" /></div>}
    </div>
  );
}

export default PaymentPage;
