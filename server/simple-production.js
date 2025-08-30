const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

// Basic middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});