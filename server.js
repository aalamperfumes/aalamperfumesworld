const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const Razorpay = require('razorpay');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// File Paths
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

// Helper Functions to Read/Write JSON Data
const readData = (filePath) => {
    if (!fs.existsSync(filePath)) return [];
    try {
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data || '[]');
    } catch (err) {
        return [];
    }
};

const writeData = (filePath, data) => {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

// Razorpay Instance Setup
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'YOUR_RAZORPAY_KEY_ID';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'YOUR_RAZORPAY_KEY_SECRET';

const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET
});

// ================= PRODUCT APIS =================

// Get All Products
app.get('/api/products', (req, res) => {
    const products = readData(PRODUCTS_FILE);
    res.json(products);
});

// Get Single Product by ID (കാർട്ടിലേക്ക് ആഡ് ചെയ്യാൻ ഇത് ആവശ്യമാണ്)
app.get('/api/products/:id', (req, res) => {
    const products = readData(PRODUCTS_FILE);
    const product = products.find(p => p.id == req.params.id);
    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
});

// Add New Product
app.post('/api/products', (req, res) => {
    try {
        const products = readData(PRODUCTS_FILE);
        const newProduct = {
            id: 'prod_' + Date.now(),
            name: req.body.name,
            category: req.body.category || 'General',
            sub: req.body.sub || '',
            price: Number(req.body.price),
            sizes: req.body.sizes || [],
            image: req.body.image,
            description: req.body.description || ''
        };
        
        products.push(newProduct);
        writeData(PRODUCTS_FILE, products);
        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// Delete Product
app.delete('/api/products/:id', (req, res) => {
    try {
        let products = readData(PRODUCTS_FILE);
        products = products.filter(p => p.id != req.params.id);
        writeData(PRODUCTS_FILE, products);
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// ================= ORDER APIS =================

// Get All Orders
app.get('/api/orders', (req, res) => {
    const orders = readData(ORDERS_FILE);
    res.json(orders);
});

// Create Order (Razorpay Payment Integration)
app.post('/api/create-order', async (req, res) => {
    try {
        const { amount, customerInfo, items } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        const orderAmount = Number(amount) || 0;
        if (orderAmount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid order amount' });
        }

        const options = {
            amount: Math.round(orderAmount * 100), // Amount in paise
            currency: 'INR',
            receipt: 'rcpt_' + Date.now()
        };

        const razorpayOrder = await razorpay.orders.create(options);

        // Save order details to orders.json
        const orders = readData(ORDERS_FILE);
        const newOrder = {
            id: razorpayOrder.id,
            customerName: customerInfo?.name || 'Guest',
            phone: customerInfo?.phone || '',
            address: customerInfo?.address || '',
            items: items || [],
            totalAmount: orderAmount,
            status: 'Pending',
            createdAt: new Date().toLocaleString()
        };

        orders.push(newOrder);
        writeData(ORDERS_FILE, orders);

        return res.status(200).json({
            success: true,
            orderId: razorpayOrder.id,
            razorpayKey: RAZORPAY_KEY_ID,
            amount: options.amount,
            currency: 'INR'
        });

    } catch (error) {
        console.error('Razorpay Error:', error);
        return res.status(500).json({ 
            success: false, 
            message: error.description || error.message || 'Failed to create Razorpay order' 
        });
    }
});

// Catch-all route for SPA
app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});