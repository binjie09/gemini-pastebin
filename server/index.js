require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
const uploadDir = process.env.UPLOAD_DIR || 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use('/uploads', express.static(path.join(__dirname, uploadDir)));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cbj-tools-pastbin')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

const pasteRoutes = require('./routes/paste');
app.use('/api', pasteRoutes);

// Serve Static Frontend Files (mounted as public)
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// SPA fallback for any route not caught by /api or /uploads
app.get('/*splat', (req, res) => {
    // If it's an API call that wasn't matched, return 404
    if (req.path.startsWith('/api')) {
        return res.status(404).json({ error: 'API route not found' });
    }
    // Otherwise serve the index.html
    const indexPath = path.join(publicPath, 'index.html');
    if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
    } else {
        res.status(200).send('CBJ Tools Pastbin API is running (Frontend build not found in /public)');
    }
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
