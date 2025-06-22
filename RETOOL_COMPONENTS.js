// RETOOL COMPONENT CONFIGURATIONS
// Скопируйте эти конфигурации в соответствующие компоненты

// 1. ТАБЛИЦА ПОЛЬЗОВАТЕЛЕЙ
// Table Component: usersTable
{
  data: {{ getUsers.data }},
  columns: [
    { name: "id", displayName: "ID", type: "number" },
    { name: "username", displayName: "Username", type: "string" },
    { name: "email", displayName: "Email", type: "string" },
    { name: "fullName", displayName: "Full Name", type: "string" },
    { 
      name: "isActive", 
      displayName: "Active", 
      type: "boolean",
      cellType: "toggle"
    },
    { name: "role", displayName: "Role", type: "string" },
    { 
      name: "createdAt", 
      displayName: "Created", 
      type: "datetime",
      format: "YYYY-MM-DD HH:mm"
    }
  ],
  searchable: true,
  sortable: true,
  showRefreshButton: true
}

// 2. КНОПКИ УПРАВЛЕНИЯ ПОЛЬЗОВАТЕЛЯМИ
// Button Component: toggleUserStatusBtn
{
  text: {{ usersTable.selectedRow ? (usersTable.selectedRow.isActive ? "Деактивировать" : "Активировать") : "Выберите пользователя" }},
  disabled: {{ !usersTable.selectedRow }},
  color: {{ usersTable.selectedRow?.isActive ? "red" : "green" }},
  onClick: [
    {
      action: "trigger",
      query: "updateUserStatus"
    }
  ]
}

// 3. СТАТИСТИКА ДАШБОРДА
// Stat Component: pendingListingsStat
{
  label: "Ожидают модерации",
  value: {{ getStats.data?.pendingListings || 0 }},
  color: "orange",
  format: "number"
}

// Stat Component: activeAuctionsStat  
{
  label: "Активные аукционы",
  value: {{ getStats.data?.activeAuctions || 0 }},
  color: "green",
  format: "number"
}

// Stat Component: totalUsersStat
{
  label: "Всего пользователей", 
  value: {{ getStats.data?.totalUsers || 0 }},
  color: "blue",
  format: "number"
}

// Stat Component: bannedUsersStat
{
  label: "Заблокированные",
  value: {{ getStats.data?.bannedUsers || 0 }},
  color: "red", 
  format: "number"
}

// 4. ТАБЛИЦА ОБЪЯВЛЕНИЙ
// Table Component: listingsTable
{
  data: {{ getListings.data }},
  columns: [
    { name: "id", displayName: "ID", type: "number" },
    { name: "lotNumber", displayName: "Лот №", type: "string" },
    { name: "make", displayName: "Марка", type: "string" },
    { name: "model", displayName: "Модель", type: "string" },
    { name: "year", displayName: "Год", type: "number" },
    { 
      name: "startingPrice", 
      displayName: "Начальная цена", 
      type: "currency",
      currency: "TJS"
    },
    { 
      name: "currentBid", 
      displayName: "Текущая ставка", 
      type: "currency",
      currency: "TJS"
    },
    { 
      name: "status", 
      displayName: "Статус", 
      type: "badge",
      badgeColor: {{ 
        {
          'pending': 'orange',
          'active': 'green', 
          'ended': 'gray',
          'rejected': 'red'
        }[self] || 'gray'
      }}
    },
    { name: "seller.username", displayName: "Продавец", type: "string" },
    { name: "bidCount", displayName: "Ставок", type: "number" }
  ],
  searchable: true,
  sortable: true,
  showRefreshButton: true
}

// 5. КНОПКИ МОДЕРАЦИИ
// Button Component: approveListingBtn
{
  text: "Одобрить",
  disabled: {{ !listingsTable.selectedRow || listingsTable.selectedRow.status !== 'pending' }},
  color: "green",
  onClick: [
    {
      action: "trigger", 
      query: "approveListing"
    }
  ]
}

// Button Component: rejectListingBtn
{
  text: "Отклонить",
  disabled: {{ !listingsTable.selectedRow || listingsTable.selectedRow.status !== 'pending' }},
  color: "red",
  onClick: [
    {
      action: "trigger",
      query: "rejectListing" 
    }
  ]
}

// 6. ФИЛЬТРЫ
// Select Component: statusFilter
{
  label: "Фильтр по статусу",
  placeholder: "Выберите статус",
  options: [
    { label: "Все", value: "" },
    { label: "Ожидают модерации", value: "pending" },
    { label: "Активные", value: "active" },
    { label: "Завершенные", value: "ended" },
    { label: "Отклоненные", value: "rejected" }
  ],
  defaultValue: "pending",
  onChange: [
    {
      action: "trigger",
      query: "getListings"
    }
  ]
}

// Text Input Component: userSearchInput
{
  label: "Поиск пользователей",
  placeholder: "Введите имя пользователя или email",
  debounceMs: 500
}

// 7. ТАБЛИЦА С ФИЛЬТРАЦИЕЙ ПОЛЬЗОВАТЕЛЕЙ
// Используйте в Table Component вместо {{ getUsers.data }}:
{{ 
  (getUsers.data || []).filter(user => {
    if (!userSearchInput.value) return true;
    const search = userSearchInput.value.toLowerCase();
    return user.username.toLowerCase().includes(search) || 
           user.email.toLowerCase().includes(search) ||
           (user.fullName && user.fullName.toLowerCase().includes(search));
  })
}}

// 8. АВТООБНОВЛЕНИЕ
// JavaScript Query: autoRefresh (Run on page load)
{
  code: `
    // Автообновление каждые 30 секунд
    if (window.autoRefreshInterval) {
      clearInterval(window.autoRefreshInterval);
    }
    
    window.autoRefreshInterval = setInterval(() => {
      getUsers.trigger();
      getStats.trigger(); 
      getListings.trigger();
    }, 30000);
    
    return "Auto-refresh started";
  `
}

// 9. NOTIFICATION HANDLERS
// Добавьте в Event Handlers каждого query:

// On Success:
{
  action: "trigger",
  query: "notification1.trigger",
  additionalParams: {
    type: "success",
    title: "Успешно",
    description: "Операция выполнена"
  }
}

// On Failure:
{
  action: "trigger", 
  query: "notification1.trigger",
  additionalParams: {
    type: "error",
    title: "Ошибка",
    description: "{{ self.error }}"
  }
}

// 10. LAYOUT SUGGESTIONS
/*
Рекомендуемая структура страницы:

1. Header с названием "AutoAuction Admin Dashboard"
2. Container с 4 Stat компонентами в ряд
3. Tabs Component:
   - Tab 1: "Пользователи" 
     - userSearchInput
     - usersTable
     - toggleUserStatusBtn
   - Tab 2: "Модерация объявлений"
     - statusFilter  
     - listingsTable
     - approveListingBtn + rejectListingBtn
   - Tab 3: "Аналитика"
     - Charts и дополнительная статистика
4. Footer с информацией об обновлении
*/