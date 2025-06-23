import express from 'express';

const adminRouter = express.Router();

// Простая HTML админ-панель
const adminHTML = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AutoBid Admin Panel</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; }
        .header { background: #059669; color: white; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 20px; }
        .card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .card h3 { color: #059669; margin-bottom: 10px; }
        .card p { color: #666; margin-bottom: 15px; }
        .btn { display: inline-block; background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; }
        .btn:hover { background: #10b981; }
        .stats { background: #e6fffa; border-left: 4px solid #059669; }
        .api-info { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 15px; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <div class="container">
            <h1>📊 AutoBid Admin Panel</h1>
            <p>Панель управления платформой автоаукционов</p>
        </div>
    </div>

    <div class="container">
        <div class="grid">
            <div class="card stats">
                <h3>📈 Статистика</h3>
                <p>Просмотр общей статистики платформы</p>
                <a href="/api/admin/stats" target="_blank" class="btn">Открыть статистику</a>
            </div>

            <div class="card">
                <h3>👥 Пользователи</h3>
                <p>Управление пользователями и аккаунтами</p>
                <a href="/api/admin/users" target="_blank" class="btn">Управление пользователями</a>
            </div>

            <div class="card">
                <h3>🚗 Объявления</h3>
                <p>Модерация объявлений автомобилей</p>
                <a href="/api/admin/listings" target="_blank" class="btn">Модерация объявлений</a>
            </div>

            <div class="card">
                <h3>💰 Ставки</h3>
                <p>Мониторинг всех ставок и торгов</p>
                <a href="/api/admin/bids" target="_blank" class="btn">Просмотр ставок</a>
            </div>

            <div class="card">
                <h3>🎯 Секция "Продай авто"</h3>
                <p>Редактирование главного баннера</p>
                <a href="/api/admin/sell-car-section" target="_blank" class="btn">Редактировать</a>
            </div>

            <div class="card">
                <h3>📰 Баннеры</h3>
                <p>Управление рекламными баннерами</p>
                <a href="/api/banners" target="_blank" class="btn">Управление баннерами</a>
            </div>
        </div>

        <div class="api-info">
            <h3>🔧 API Information</h3>
            <p><strong>Base URL:</strong> https://task-tracker-serviceapp225.replit.app</p>
            <p><strong>Admin API Key:</strong> retool-admin-key-2024</p>
            <p><strong>Главный сайт:</strong> <a href="https://task-tracker-serviceapp225.replit.app" target="_blank">AutoBid.tj</a></p>
        </div>
    </div>
</body>
</html>
`;

adminRouter.get('/', (req, res) => {
    res.send(adminHTML);
});

export { adminRouter };