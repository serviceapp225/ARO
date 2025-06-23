// === RETOOL QUERIES ===
// Скопируйте эти запросы в ваш Retool приложении

// 1. ЗАПРОС СТАТИСТИКИ (getStats)
// Type: REST API Query
// URL: {{API_BASE_URL}}/api/admin/stats
// Method: GET
// Headers: 
{
  "x-admin-key": "retool-admin-key-2024"
}

// 2. ЗАПРОС ПОЛЬЗОВАТЕЛЕЙ (getUsers)
// Type: REST API Query
// URL: {{API_BASE_URL}}/api/admin/users
// Method: GET
// Headers:
{
  "x-admin-key": "retool-admin-key-2024"
}
// Transformer:
return data.map(user => ({
  ...user,
  statusDisplay: user.isActive ? 'Активен' : 'Неактивен',
  statusColor: user.isActive ? 'green' : 'red',
  createdDisplay: new Date(user.createdAt).toLocaleDateString('ru-RU'),
  phoneDisplay: user.phoneNumber || 'Не указан'
}));

// 3. ЗАПРОС ОБЪЯВЛЕНИЙ (getListings)
// Type: REST API Query
// URL: {{API_BASE_URL}}/api/admin/listings
// Method: GET
// Headers:
{
  "x-admin-key": "retool-admin-key-2024"
}
// Transformer:
return data.map(listing => ({
  ...listing,
  currentBidDisplay: `${listing.currentBid || listing.startingPrice} сомони`,
  sellerDisplay: listing.seller?.fullName || 'Неизвестно',
  carDisplay: `${listing.make} ${listing.model} ${listing.year}`,
  statusColor: {
    'pending': 'orange',
    'active': 'green', 
    'ended': 'gray',
    'rejected': 'red'
  }[listing.status] || 'gray'
}));

// 4. ЗАПРОС СТАВОК (getBids)
// Type: REST API Query
// URL: {{API_BASE_URL}}/api/admin/bids
// Method: GET
// Headers:
{
  "x-admin-key": "retool-admin-key-2024"
}
// Transformer:
return data.map(bid => ({
  ...bid,
  amountDisplay: `${bid.amount} сомони`,
  bidderDisplay: bid.bidder?.fullName || 'Неизвестно',
  carDisplay: `${bid.listing?.make} ${bid.listing?.model} ${bid.listing?.year}`,
  lotDisplay: bid.listing?.lotNumber,
  dateDisplay: new Date(bid.createdAt).toLocaleDateString('ru-RU')
}));

// 5. АКТИВАЦИЯ ПОЛЬЗОВАТЕЛЯ (activateUser)
// Type: REST API Query
// URL: {{API_BASE_URL}}/api/admin/users/{{usersTable.selectedRow.id}}/status
// Method: PATCH
// Headers:
{
  "x-admin-key": "retool-admin-key-2024",
  "Content-Type": "application/json"
}
// Body:
{
  "isActive": true
}
// Success Event Handlers:
// - getUsers.trigger()
// - getStats.trigger()

// 6. ДЕАКТИВАЦИЯ ПОЛЬЗОВАТЕЛЯ (deactivateUser)
// Type: REST API Query
// URL: {{API_BASE_URL}}/api/admin/users/{{usersTable.selectedRow.id}}/status
// Method: PATCH
// Headers:
{
  "x-admin-key": "retool-admin-key-2024",
  "Content-Type": "application/json"
}
// Body:
{
  "isActive": false
}
// Success Event Handlers:
// - getUsers.trigger()
// - getStats.trigger()

// 7. ОДОБРЕНИЕ ОБЪЯВЛЕНИЯ (approveListing)
// Type: REST API Query
// URL: {{API_BASE_URL}}/api/listings/{{listingsTable.selectedRow.id}}/status
// Method: PATCH
// Headers:
{
  "x-admin-key": "retool-admin-key-2024",
  "Content-Type": "application/json"
}
// Body:
{
  "status": "active"
}
// Success Event Handlers:
// - getListings.trigger()
// - getStats.trigger()

// 8. ОТКЛОНЕНИЕ ОБЪЯВЛЕНИЯ (rejectListing)
// Type: REST API Query
// URL: {{API_BASE_URL}}/api/listings/{{listingsTable.selectedRow.id}}/status
// Method: PATCH
// Headers:
{
  "x-admin-key": "retool-admin-key-2024",
  "Content-Type": "application/json"
}
// Body:
{
  "status": "rejected"
}
// Success Event Handlers:
// - getListings.trigger()
// - getStats.trigger()