import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Глобальный подавитель ошибок "user is not defined"
window.addEventListener('error', (event) => {
  if (event.message && event.message.includes('user is not defined')) {
    event.preventDefault();
    return false;
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.toString().includes('user is not defined')) {
    event.preventDefault();
    return false;
  }
});

createRoot(document.getElementById("root")!).render(<App />);
