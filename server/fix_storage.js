const fs = require('fs');

// Читаем файл
let content = fs.readFileSync('storage.ts', 'utf8');

// Данные для обновления каждого автомобиля
const statusData = [
  { id: 1, customsCleared: true, recycled: false, technicalInspectionValid: true, technicalInspectionDate: "2025-12-15" },
  { id: 2, customsCleared: false, recycled: true, technicalInspectionValid: true, technicalInspectionDate: "2025-08-20" },
  { id: 3, customsCleared: true, recycled: false, technicalInspectionValid: true, technicalInspectionDate: "2025-11-10" },
  { id: 4, customsCleared: true, recycled: true, technicalInspectionValid: false, technicalInspectionDate: null },
  { id: 5, customsCleared: false, recycled: false, technicalInspectionValid: true, technicalInspectionDate: "2025-09-30" },
  { id: 6, customsCleared: true, recycled: true, technicalInspectionValid: true, technicalInspectionDate: "2026-01-25" },
  { id: 8, customsCleared: false, recycled: true, technicalInspectionValid: false, technicalInspectionDate: null },
  { id: 9, customsCleared: true, recycled: false, technicalInspectionValid: true, technicalInspectionDate: "2025-10-05" },
  { id: 10, customsCleared: true, recycled: true, technicalInspectionValid: true, technicalInspectionDate: "2025-12-31" },
  { id: 11, customsCleared: false, recycled: false, technicalInspectionValid: false, technicalInspectionDate: null },
  { id: 12, customsCleared: true, recycled: true, technicalInspectionValid: true, technicalInspectionDate: "2026-02-14" },
  { id: 13, customsCleared: true, recycled: false, technicalInspectionValid: true, technicalInspectionDate: "2025-11-28" },
  { id: 14, customsCleared: false, recycled: true, technicalInspectionValid: true, technicalInspectionDate: "2025-09-12" }
];

// Регулярное выражение для поиска объектов listing
const listingRegex = /(const listing\d+: CarListing = \{[\s\S]*?)(createdAt: now\s*\})/g;

let listingCount = 1;
content = content.replace(listingRegex, (match, p1, p2) => {
  const data = statusData.find(item => item.id === listingCount) || statusData[0];
  listingCount++;
  
  const dateValue = data.technicalInspectionDate ? `"${data.technicalInspectionDate}"` : 'null';
  
  return p1 + 
    `customsCleared: ${data.customsCleared},\n      ` +
    `recycled: ${data.recycled},\n      ` +
    `technicalInspectionValid: ${data.technicalInspectionValid},\n      ` +
    `technicalInspectionDate: ${dateValue},\n      ` +
    p2;
});

// Записываем обратно
fs.writeFileSync('storage.ts', content);
console.log('Storage updated successfully');
