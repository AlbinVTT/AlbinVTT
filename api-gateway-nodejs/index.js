const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Login with better error logging
app.post("/login", async (req, res) => {
    try {
        const response = await axios.post("http://order-processor-python:5002/validateuser", req.body);
        res.json(response.data);
    } catch (error) {
        if (error.response) {
            console.error("Login error:", error.response.status, error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error("Login error (no response):", error.message);
            res.status(500).json({ message: "Unexpected error" });
        }
    }
});

// ✅ Get products
app.get("/products", async (req, res) => {
    try {
        const response = await axios.get("http://order-processor-python:5002/products");
        res.json(response.data);
    } catch (error) {
        console.error("Product fetch error:", error.message);
        res.status(500).json({ message: "Could not fetch products" });
    }
});

// ✅ Submit order (with validation)
app.post("/submitorder", async (req, res) => {
    try {
        const { user_id, items, total } = req.body;

        if (!user_id || !Array.isArray(items) || items.length === 0 || typeof total !== 'number') {
            return res.status(400).json({ message: "Missing or invalid order fields" });
        }

        const allItemsValid = items.every(item =>
            item.product_id != null && item.name && item.quantity > 0 && typeof item.price === 'number'
        );

        if (!allItemsValid) {
            return res.status(400).json({ message: "Invalid item in order" });
        }

        console.log("➡️ Forwarding order:", req.body);

        const response = await axios.post("http://order-processor-python:5002/submitorder", req.body);
        res.json(response.data);
    } catch (error) {
        if (error.response) {
            console.error("Submit order error:", error.response.status, error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error("Submit order error (no response):", error.message);
            res.status(500).json({ message: "Unexpected error" });
        }
    }
});

// ✅ Initiate payment
app.post('/initiatepayment', async (req, res) => {
    const { username, amount } = req.body;

    try {
        const complianceResponse = await axios.post('http://compliance:80/compliancecheck', {
            KycApproved: true,
            Balance: 1000
        });

        if (complianceResponse.data.status !== 'Approved') {
            return res.status(400).json({ error: 'Compliance check failed' });
        }

        const orderResponse = await axios.post('http://order-processor-python:5002/processpayment', {
            username,
            amount
        });

        return res.json({ message: 'Payment successful', order: orderResponse.data });

    } catch (error) {
        if (error.response) {
            console.error("Payment error:", error.response.status, error.response.data);
            res.status(error.response.status).json(error.response.data);
        } else {
            console.error("Payment error (no response):", error.message);
            res.status(500).json({ error: 'Payment processing failed' });
        }
    }
});

app.listen(3001, () => console.log('🌐 API Gateway running on port 3001'));

