import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Глобальный обработчик ошибок для отладки
window.onerror = (message, source, lineno, colno, error) => {
  console.error("ГЛОБАЛЬНАЯ ОШИБКА:", { message, source, lineno, colno, error });
  
  // Ищем ошибку "user is not defined"
  if (message.includes('user is not defined')) {
    console.error("❌ НАЙДЕНА ОШИБКА user is not defined:");
    console.error("- Файл:", source);
    console.error("- Строка:", lineno);
    console.error("- Столбец:", colno);
    console.error("- Стек:", error?.stack);
  }
  
  return false; // Не блокируем обработку ошибки
};

createRoot(document.getElementById("root")!).render(<App />);
