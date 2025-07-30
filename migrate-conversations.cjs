const Database = require('better-sqlite3');
const { db } = require('./server/db.ts');
const { conversations, messages } = require('./shared/schema.ts');

const SQLITE_DB_PATH = './autoauction.db';

async function migrateConversationsAndMessages() {
  try {
    console.log('🔄 Начинаем миграцию переписок и сообщений из SQLite в PostgreSQL...');
    
    // Подключаемся к SQLite
    const sqlite = new Database(SQLITE_DB_PATH);
    
    // Получаем все переписки из SQLite
    const sqliteConversations = sqlite.prepare('SELECT * FROM conversations').all();
    console.log(`📊 Найдено ${sqliteConversations.length} переписок в SQLite`);
    
    // Мигрируем переписки
    let conversationsMigrated = 0;
    for (const conv of sqliteConversations) {
      try {
        await db.insert(conversations).values({
          buyerId: conv.buyer_id,
          sellerId: conv.seller_id,
          listingId: conv.listing_id,
          createdAt: new Date(conv.created_at)
        });
        conversationsMigrated++;
      } catch (error) {
        if (error.message.includes('duplicate key value')) {
          console.log(`⚠️ Переписка ${conv.id} уже существует, пропускаем`);
        } else {
          console.error(`❌ Ошибка миграции переписки ${conv.id}:`, error.message);
        }
      }
    }
    
    // Получаем все сообщения из SQLite
    const sqliteMessages = sqlite.prepare('SELECT * FROM messages ORDER BY created_at').all();
    console.log(`📊 Найдено ${sqliteMessages.length} сообщений в SQLite`);
    
    // Мигрируем сообщения
    let messagesMigrated = 0;
    for (const msg of sqliteMessages) {
      try {
        await db.insert(messages).values({
          conversationId: msg.conversation_id,
          senderId: msg.sender_id,
          messageText: msg.message_text,
          isRead: Boolean(msg.is_read),
          createdAt: new Date(msg.created_at)
        });
        messagesMigrated++;
      } catch (error) {
        if (error.message.includes('duplicate key value')) {
          console.log(`⚠️ Сообщение ${msg.id} уже существует, пропускаем`);
        } else {
          console.error(`❌ Ошибка миграции сообщения ${msg.id}:`, error.message);
        }
      }
    }
    
    sqlite.close();
    
    console.log(`✅ Миграция завершена:`);
    console.log(`   📨 Переписки: ${conversationsMigrated} из ${sqliteConversations.length}`);
    console.log(`   💬 Сообщения: ${messagesMigrated} из ${sqliteMessages.length}`);
    
  } catch (error) {
    console.error('❌ Ошибка миграции:', error);
    process.exit(1);
  }
}

// Запускаем миграцию
migrateConversationsAndMessages().then(() => {
  console.log('🎉 Миграция успешно завершена!');
  process.exit(0);
});