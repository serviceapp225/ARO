import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.autobid.tj',
  appName: 'AutoBid.TJ',
  webDir: 'dist/public',
  server: {
    // Для development можно указать IP сервера
    // url: 'http://localhost:5000',
    // cleartext: true
  },
  plugins: {
    // Настройки для пуш-уведомлений
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
