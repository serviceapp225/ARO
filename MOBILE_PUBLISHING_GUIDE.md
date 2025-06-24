# Руководство по публикации AutoBid в магазинах приложений

## Подготовка мобильного приложения

Ваше веб-приложение AutoBid теперь готово к публикации в App Store и Google Play Market с помощью Capacitor.

### 1. Сборка мобильного приложения

```bash
# Запустите сборку мобильного приложения
./build-mobile.sh
```

### 2. Настройка для Android (Google Play)

#### Открытие проекта в Android Studio:
```bash
npx cap open android
```

#### Настройка в Android Studio:
1. Измените `applicationId` в `android/app/build.gradle`
2. Настройте иконку приложения в `android/app/src/main/res/`
3. Добавьте права доступа в `android/app/src/main/AndroidManifest.xml`
4. Создайте keystore для подписания APK

#### Создание релизной сборки:
1. Build → Generate Signed Bundle/APK
2. Выберите Android App Bundle (AAB)
3. Загрузите AAB в Google Play Console

### 3. Настройка для iOS (App Store)

#### Открытие проекта в Xcode:
```bash
npx cap open ios
```

#### Настройка в Xcode:
1. Настройте Bundle Identifier в настройках проекта
2. Добавьте иконки приложения в Assets.xcassets
3. Настройте Info.plist с разрешениями
4. Подключите Apple Developer аккаунт

#### Создание релизной сборки:
1. Product → Archive
2. Distribute App → App Store Connect
3. Загрузите в App Store Connect

## Требования для публикации

### Google Play Store:
- Аккаунт Google Play Developer ($25 разовый платеж)
- Подписанный APK/AAB файл
- Описание приложения, скриншоты
- Политика конфиденциальности

### Apple App Store:
- Аккаунт Apple Developer ($99/год)
- Подписанный IPA файл
- Описание приложения, скриншоты
- Соответствие App Store Guidelines

## Конфигурация приложения

Файл `capacitor.config.ts` уже настроен с:
- Правильным App ID: `com.autoauction.autobid`
- Настройками сплеш-скрина
- Безопасной схемой для Android

## Следующие шаги

1. Зарегистрируйте аккаунты разработчика
2. Подготовьте графические материалы (иконки, скриншоты)
3. Создайте описания приложения на русском и таджикском языках
4. Соберите и протестируйте приложения
5. Отправьте на модерацию в магазины

## Обновления

После публикации обновления выпускаются следующим образом:
1. Внесите изменения в веб-код
2. Запустите `./build-mobile.sh`
3. Пересоберите и переотправьте в магазины