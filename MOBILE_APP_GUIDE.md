# AUTOBID.TJ Mobile App Development Guide

## Готово к публикации

Мобильное приложение AUTOBID.TJ готово для публикации в Play Market и App Store с использованием Capacitor.

## Структура проекта

- `capacitor.config.ts` - конфигурация Capacitor
- `android/` - нативный Android проект
- `ios/` - нативный iOS проект  
- `app-icon.svg` - иконка приложения
- Скрипты сборки: `build-mobile.sh`, `mobile-android.sh`, `mobile-ios.sh`

## Команды сборки

### Общая сборка
```bash
./build-mobile.sh
```

### Android
```bash
./mobile-android.sh
# или
npx cap open android
```

### iOS
```bash
./mobile-ios.sh  
# или
npx cap open ios
```

## Процесс публикации

### Google Play Store
1. Откройте Android Studio: `npx cap open android`
2. Настройте подпись приложения в Android Studio
3. Создайте AAB файл: Build → Generate Signed Bundle
4. Загрузите в Google Play Console

### Apple App Store
1. Откройте Xcode: `npx cap open ios`
2. Настройте Apple Developer сертификаты
3. Создайте Archive: Product → Archive
4. Загрузите в App Store Connect

## Требования для публикации

### Play Market
- Google Play Console аккаунт ($25 разовый платеж)
- Политика конфиденциальности
- Описание приложения
- Скриншоты (минимум 2)
- Иконка 512x512px

### App Store  
- Apple Developer Program ($99/год)
- macOS для сборки
- Политика конфиденциальности
- Описание приложения
- Скриншоты для разных устройств

## Настройки приложения

- **App ID**: com.autobid.tj
- **Название**: AutoBid.TJ
- **Иконка**: app-icon.svg (создана)
- **Версия**: 1.0.0

## Дополнительные возможности

Приложение готово для интеграции:
- Пуш-уведомлений
- Камеры для фото
- Геолокации
- Контактов

## Статус

✅ Capacitor настроен
✅ Android проект создан
✅ iOS проект создан  
✅ Иконка приложения создана
✅ Скрипты сборки готовы
🚀 Готово к публикации