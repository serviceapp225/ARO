#!/bin/bash

echo "🚀 Развертывание AutoBid.TJ на DigitalOcean VPS..."

ssh root@188.166.61.86 << 'REMOTE'
cd ~ && mkdir -p autobid-tj && cd autobid-tj

echo "const express=require('express');const app=express();app.get('/',(r,s)=>s.send('<h1 style=\"text-align:center;padding:50px;background:#667eea;color:white\">🚗 AutoBid.TJ работает на 188.166.61.86!</h1>'));app.get('/health',(r,s)=>s.json({status:'OK',time:new Date()}));app.listen(3001,()=>console.log('AutoBid запущен на 3001'));" > app.js

if ! command -v node; then curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs; fi

npm init -y && npm install express

nohup node app.js > app.log 2>&1 &

echo "✅ Развернуто! Сайт: http://188.166.61.86:3001"
REMOTE

echo "🌐 Откройте в браузере: http://188.166.61.86:3001"