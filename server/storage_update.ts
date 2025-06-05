// Данные о статусах для всех автомобилей
export const vehicleStatusData = [
  // Porsche 911 Turbo S - полный пакет: растаможен, утилизирован, техосмотр до 2026
  { customsCleared: true, recycled: true, technicalInspectionValid: true, technicalInspectionDate: "2026-03-15" },
  
  // BMW M3 - не растаможен, не утилизирован, но техосмотр действует
  { customsCleared: false, recycled: false, technicalInspectionValid: true, technicalInspectionDate: "2025-08-20" },
  
  // Mercedes-Benz C-Class - растаможен, не утилизирован, техосмотр действует
  { customsCleared: true, recycled: false, technicalInspectionValid: true, technicalInspectionDate: "2025-11-10" },
  
  // Audi A4 - растаможен, утилизирован, техосмотр просрочен
  { customsCleared: true, recycled: true, technicalInspectionValid: false, technicalInspectionDate: null },
  
  // Toyota Camry - не растаможен, не утилизирован, техосмотр действует
  { customsCleared: false, recycled: false, technicalInspectionValid: true, technicalInspectionDate: "2025-09-30" },
  
  // Honda Civic - растаможен, утилизирован, техосмотр действует до 2026
  { customsCleared: true, recycled: true, technicalInspectionValid: true, technicalInspectionDate: "2026-01-25" },
  
  // Ford Mustang - не растаможен, утилизирован, техосмотр просрочен
  { customsCleared: false, recycled: true, technicalInspectionValid: false, technicalInspectionDate: null },
  
  // Nissan GT-R - растаможен, не утилизирован, техосмотр действует
  { customsCleared: true, recycled: false, technicalInspectionValid: true, technicalInspectionDate: "2025-10-05" },
  
  // Volkswagen Golf - растаможен, утилизирован, техосмотр действует до 2025
  { customsCleared: true, recycled: true, technicalInspectionValid: true, technicalInspectionDate: "2025-12-31" },
  
  // Chevrolet Camaro - не растаможен, не утилизирован, техосмотр просрочен
  { customsCleared: false, recycled: false, technicalInspectionValid: false, technicalInspectionDate: null },
  
  // Mazda CX-5 - растаможен, утилизирован, техосмотр действует до 2026
  { customsCleared: true, recycled: true, technicalInspectionValid: true, technicalInspectionDate: "2026-02-14" },
  
  // Subaru Outback - растаможен, не утилизирован, техосмотр действует
  { customsCleared: true, recycled: false, technicalInspectionValid: true, technicalInspectionDate: "2025-11-28" },
  
  // Infiniti Q50 - не растаможен, утилизирован, техосмотр действует
  { customsCleared: false, recycled: true, technicalInspectionValid: true, technicalInspectionDate: "2025-09-12" }
];