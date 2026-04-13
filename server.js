const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Store data
const products = [
    { id: 1, name: "Men's Shirt", price: 29.99, category: "clothing" },
    { id: 2, name: "Women's Shoes", price: 49.99, category: "footwear" },
    { id: 3, name: "Leather Bag", price: 89.99, category: "accessories" }
];

// Routes
app.get('/', (req, res) => {
    res.json({ message: "🛍️ Usman Store Backend is Running!" });
});

app.get('/api/products', (req, res) => {
    res.json(products);
});

app.post('/api/products', (req, res) => {
    const newProduct = {
        id: products.length + 1,
        name: req.body.name,
        price: req.body.price,
        category: req.body.category || 'general'
    };
    products.push(newProduct);
    res.status(201).json(newProduct);
});

app.delete('/api/products/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
        return res.status(404).json({ error: "Product not found" });
    }
    
    products.splice(index, 1);
    res.status(204).send();
});

app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
    console.log(`📦 Products API: http://localhost:${PORT}/api/products`);
});