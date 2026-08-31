const express = require('express');
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// ================= MONGODB DATABASE CONNECTION =================
const MONGO_URI = process.env.MONGO_URI || 'YOUR_MONGODB_ATLAS_CONNECTION_STRING';

mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas Successfully!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Database Schemas & Models
const ProductSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    category: { type: String, default: 'General' },
    sub: { type: String, default: '' },
    price: { type: Number, required: true },
    sizes: { type: Array, default: [] },
    image: { type: String, required: true },
    description: { type: String, default: '' }
}, { timestamps: true });

const OrderSchema = new mongoose.Schema({
    id: { type: String, required: true },
    customerName: { type: String, default: 'Guest' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    items: { type: Array, default: [] },
    totalAmount: { type: Number, required: true },
    status: { type: String, default: 'WhatsApp Pending' }
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);

// ================= PRODUCT APIS =================

// Get All Products
app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Get Single Product by ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const product = await Product.findOne({ id: req.params.id });
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch product' });
    }
});

// Add New Product
app.post('/api/products', async (req, res) => {
    try {
        const newProduct = new Product({
            id: 'prod_' + Date.now(),
            name: req.body.name,
            category: req.body.category || 'General',
            sub: req.body.sub || '',
            price: Number(req.body.price),
            sizes: req.body.sizes || [],
            image: req.body.image,
            description: req.body.description || ''
        });

        await newProduct.save();
        res.status(201).json({ message: 'Product added successfully', product: newProduct });
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ error: 'Failed to add product' });
    }
});

// Delete Product
app.delete('/api/products/:id', async (req, res) => {
    try {
        await Product.deleteOne({ id: req.params.id });
        res.json({ message: 'Product deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// ================= ORDER APIS (WHATSAPP ORDER SAVING) =================

// Get All Orders (Admin കാണാൻ)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Create Order (WhatsApp ഓർഡർ ഡാറ്റാബേസിൽ സേവ് ചെയ്യാൻ)
app.post('/api/orders', async (req, res) => {
    try {
        const { customerInfo, items, totalAmount } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        const newOrder = new Order({
            id: 'ALM-' + Math.floor(100000 + Math.random() * 900000),
            customerName: customerInfo?.name || 'Guest',
            phone: customerInfo?.phone || '',
            address: `${customerInfo?.city || ''}, ${customerInfo?.address || ''} - ${customerInfo?.pincode || ''}`,
            items: items || [],
            totalAmount: Number(totalAmount) || 0,
            status: 'WhatsApp Order'
        });

        await newOrder.save();
        res.status(201).json({ success: true, message: 'Order saved successfully', orderId: newOrder.id });

    } catch (error) {
        console.error('Order Saving Error:', error);
        res.status(500).json({ success: false, message: 'Failed to save order' });
    }
});

// Catch-all route for SPA
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
