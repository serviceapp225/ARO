const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 8080;

// Простой HTML для скачивания файлов
app.get('/', (req, res) => {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Скачивание файлов AutoBid.TJ</title>
    <meta charset="utf-8">
    <style>
        body { font-family: Arial; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; }
        .file { margin: 20px 0; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
        .download-btn { 
            background: #4CAF50; color: white; padding: 10px 20px; 
            text-decoration: none; border-radius: 5px; display: inline-block;
        }
        .size { color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Файлы для развертывания AutoBid.TJ</h1>
        
        <div class="file">
            <h3>📦 Основной архив приложения</h3>
            <p><strong>autobid-tj-build-final.tar.gz</strong></p>
            <p class="size">Размер: 3.5MB</p>
            <a href="/download/autobid-tj-build-final.tar.gz" class="download-btn">Скачать архив</a>
        </div>
        
        <div class="file">
            <h3>🔧 Скрипт автоматического развертывания</h3>
            <p><strong>deploy-digitalocean.sh</strong></p>
            <p class="size">Размер: 3.8KB</p>
            <a href="/download/deploy-digitalocean.sh" class="download-btn">Скачать скрипт</a>
        </div>
        
        <div class="file">
            <h3>📖 Инструкции по SSH развертыванию</h3>
            <p><strong>SSH_DEPLOYMENT_INSTRUCTIONS.md</strong></p>
            <a href="/download/SSH_DEPLOYMENT_INSTRUCTIONS.md" class="download-btn">Скачать инструкции</a>
        </div>
        
        <hr>
        <p><strong>После скачивания:</strong></p>
        <ol>
            <li>Убедитесь что размер архива 3.5MB (не 0KB!)</li>
            <li>Запустите: <code>chmod +x deploy-digitalocean.sh && ./deploy-digitalocean.sh</code></li>
        </ol>
    </div>
</body>
</html>`;
  res.send(html);
});

// Скачивание файлов
app.get('/download/:filename', (req, res) => {
  const filename = req.params.filename;
  const filepath = path.join(__dirname, filename);
  
  if (!fs.existsSync(filepath)) {
    return res.status(404).send('Файл не найден');
  }
  
  const stat = fs.statSync(filepath);
  
  res.writeHead(200, {
    'Content-Type': 'application/octet-stream',
    'Content-Length': stat.size,
    'Content-Disposition': `attachment; filename="${filename}"`
  });
  
  const readStream = fs.createReadStream(filepath);
  readStream.pipe(res);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Сервер скачивания запущен: http://0.0.0.0:${PORT}`);
  console.log('📁 Доступные файлы для скачивания:');
  
  const files = ['autobid-tj-build-final.tar.gz', 'deploy-digitalocean.sh', 'SSH_DEPLOYMENT_INSTRUCTIONS.md'];
  files.forEach(file => {
    if (fs.existsSync(file)) {
      const size = fs.statSync(file).size;
      console.log(`   ✅ ${file} (${(size/1024/1024).toFixed(1)}MB)`);
    } else {
      console.log(`   ❌ ${file} - не найден`);
    }
  });
});