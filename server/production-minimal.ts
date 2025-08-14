import express from "express";

const app = express();

// Минимальный health check
app.get('/health', (req, res) => {
  console.log('🏥 Health check OK');
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Основная страница
app.get('/', (req, res) => {
  console.log('📄 Root page requested');
  res.send('AutoBid.tj - Minimal Server Running');
});

// Запуск сервера
const PORT = parseInt(process.env.PORT || "8080");
const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 MINIMAL SERVER: Запущен на порту ${PORT}`);
  console.log(`🔧 NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`🔧 HOST: 0.0.0.0:${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export { app, server };