#!/bin/bash
echo "Starting Flutter AUTOAUCTION app..."
cd /home/runner/autoauction_flutter
flutter clean
flutter pub get
flutter run -d linux --release