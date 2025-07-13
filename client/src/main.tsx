import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Глобальный обработчик ошибок для отслеживания "user is not defined"
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('user is not defined')) {
    console.error('🚨 НАЙДЕНА ОШИБКА "user is not defined":', {
      message: event.error.message,
      stack: event.error.stack,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  }
});

// Глобальный обработчик unhandledrejection для Promise ошибок
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('user is not defined')) {
    console.error('🚨 НАЙДЕНА PROMISE ОШИБКА "user is not defined":', {
      reason: event.reason,
      promise: event.promise
    });
  }
});

createRoot(document.getElementById("root")!).render(<App />);
