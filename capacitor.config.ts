import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.autobid.tj',
  appName: 'AutoBid.TJ',
  webDir: 'dist/public',
  server: {
    // Подключение к вашему Replit серверу с базой данных
    url: 'https://your-repl-name.replit.app',
    cleartext: true,
    // Разрешить HTTP в development
    allowNavigation: ['https://your-repl-name.replit.app']
  },
  plugins: {
    // Настройки для пуш-уведомлений
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
