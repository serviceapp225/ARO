import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.autobid.tj',
  appName: 'NARXI TU',
  webDir: 'dist/public',
  server: {
    // Подключение к вашему Replit серверу с базой данных
    url: 'https://autobidtj-serviceapp225.replit.app',
    cleartext: true,
    // Разрешить навигацию к серверу
    allowNavigation: ['https://autobidtj-serviceapp225.replit.app/*'],
    // Для Android эмулятора разрешаем HTTP запросы
    androidScheme: 'https',
    // Включаем поддержку CORS
    iosScheme: 'https'
  },
  plugins: {
    // Настройки для пуш-уведомлений
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
