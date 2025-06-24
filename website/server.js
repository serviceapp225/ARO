const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.WEBSITE_PORT || 3000;

// Serve static files
app.use(express.static(__dirname));

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'AutoBid Corporate Website' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`AutoBid corporate website running on http://0.0.0.0:${PORT}`);
});

module.exports = app;