# Google Play Store Release Guide - AutoBid.TJ

## 1. Создание Release Build в Android Studio

### Шаг 1: Подготовка к Release Build
1. Откройте проект в Android Studio
2. Убедитесь что проект собирается без ошибок (Build → Make Project)

### Шаг 2: Создание Keystore (для подписи приложения)
```
Build → Generate Signed Bundle / APK...
```

**Важно:** Keystore файл нужен для всех будущих обновлений!

#### Настройки Keystore:
- **Key store path:** Выберите путь для сохранения keystore
- **Password:** Придумайте надежный пароль (запишите!)
- **Key alias:** autobid-tj-key
- **Key password:** Тот же пароль или отдельный
- **Validity (years):** 25 лет
- **Certificate:**
  - First and Last Name: AutoBid TJ
  - Organizational Unit: AutoBid Team
  - Organization: AutoBid.TJ
  - City: Dushanbe
  - State: Tajikistan
  - Country Code: TJ

### Шаг 3: Генерация Release Bundle (AAB)
1. Выберите **Android App Bundle** (рекомендуется для Play Store)
2. Выберите созданный keystore
3. Build Variants: **release**
4. Signature Versions: **V1 и V2**

### Шаг 4: Проверка build.gradle (app уровня)
Убедитесь что в android/app/build.gradle есть:

```gradle
android {
    ...
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
            signingConfig signingConfigs.release
        }
    }
    
    signingConfigs {
        release {
            storeFile file('path/to/your/keystore.jks')
            storePassword 'your_store_password'
            keyAlias 'autobid-tj-key'
            keyPassword 'your_key_password'
        }
    }
}
```

## 2. Результат
После успешной сборки получите файл:
- **AAB файл:** `android/app/build/outputs/bundle/release/app-release.aab`

Этот файл загружается в Google Play Console.

## 3. Следующие шаги
1. ✅ Создание Release Build (УСПЕШНО ЗАВЕРШЕНО)
2. 🔄 Регистрация в Google Play Console
3. 🔄 Подготовка материалов для Store
4. 🔄 Загрузка приложения

## 4. Местоположение AAB файла
Ваш готовый файл для Google Play Store находится в:
```
C:\Users\fonda\StudioProjects\NarxiTu\android\app\build\outputs\bundle\release\app-release.aab
```

Этот файл нужно загрузить в Google Play Console.

## 4. Важные заметки
- **Keystore файл храните в безопасном месте!** Без него невозможно обновить приложение
- **Запишите все пароли** - они понадобятся для каждого обновления
- **AAB формат предпочтительнее APK** для Google Play Store
- **Минимальная версия Android:** API 24 (Android 7.0)