export const CAR_MAKES_MODELS = {
  "BMW": [
    "1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series",
    "X1", "X2", "X3", "X4", "X5", "X6", "X7", "Z4", "i3", "i4", "iX", "M2", "M3", "M4", "M5", "M8"
  ],
  "Mercedes-Benz": [
    "A-Class", "B-Class", "C-Class", "CLA", "CLS", "E-Class", "S-Class", "G-Class", "GLA", "GLB", 
    "GLC", "GLE", "GLS", "SL", "SLC", "AMG GT", "EQS", "EQC", "EQA", "EQB", "Maybach S-Class"
  ],
  "Audi": [
    "A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q4 e-tron", "Q5", "Q7", "Q8", 
    "TT", "R8", "RS3", "RS4", "RS5", "RS6", "RS7", "e-tron", "e-tron GT"
  ],
  "Toyota": [
    "Corolla", "Camry", "Prius", "RAV4", "Highlander", "4Runner", "Tacoma", "Tundra", 
    "Sienna", "Avalon", "C-HR", "Venza", "Supra", "86", "Yaris", "Prius Prime"
  ],
  "Honda": [
    "Civic", "Accord", "CR-V", "HR-V", "Pilot", "Passport", "Ridgeline", "Odyssey", 
    "Insight", "Fit", "CR-V Hybrid", "Accord Hybrid", "Clarity"
  ],
  "Ford": [
    "Fiesta", "Focus", "Mondeo", "Mustang", "F-150", "Explorer", "Escape", "Edge", 
    "Expedition", "Ranger", "Bronco", "Maverick", "EcoSport", "Kuga", "Puma"
  ],
  "Volkswagen": [
    "Golf", "Polo", "Passat", "Jetta", "Tiguan", "Touareg", "Atlas", "Arteon", 
    "ID.3", "ID.4", "Up!", "T-Cross", "T-Roc", "Sharan", "Touran"
  ],
  "Nissan": [
    "Sentra", "Altima", "Maxima", "Rogue", "Murano", "Pathfinder", "Armada", 
    "Frontier", "Titan", "370Z", "GT-R", "Kicks", "Versa", "Leaf"
  ],
  "Hyundai": [
    "Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Kona", "Venue", 
    "Genesis G70", "Genesis G80", "Genesis G90", "Ioniq", "Veloster", "Accent"
  ],
  "Kia": [
    "Rio", "Forte", "Optima", "Stinger", "Soul", "Seltos", "Sportage", "Sorento", 
    "Telluride", "Carnival", "EV6", "Niro", "Cadenza"
  ],
  "Lexus": [
    "IS", "ES", "GS", "LS", "UX", "NX", "RX", "GX", "LX", "LC", "RC", 
    "CT", "HS", "LFA"
  ],
  "Infiniti": [
    "Q50", "Q60", "Q70", "QX30", "QX50", "QX60", "QX80", "QX55"
  ],
  "Acura": [
    "ILX", "TLX", "RLX", "RDX", "MDX", "NSX", "Integra"
  ],
  "Cadillac": [
    "ATS", "CTS", "CT4", "CT5", "XT4", "XT5", "XT6", "Escalade", "Eldorado"
  ],
  "Chevrolet": [
    "Spark", "Sonic", "Cruze", "Malibu", "Impala", "Camaro", "Corvette", 
    "Trax", "Equinox", "Traverse", "Tahoe", "Suburban", "Silverado", "Colorado"
  ],
  "Mazda": [
    "Mazda2", "Mazda3", "Mazda6", "CX-3", "CX-30", "CX-5", "CX-9", "MX-5 Miata", "CX-50"
  ],
  "Subaru": [
    "Impreza", "Legacy", "Outback", "Forester", "Ascent", "WRX", "BRZ", "Crosstrek"
  ],
  "Mitsubishi": [
    "Mirage", "Lancer", "Eclipse Cross", "Outlander", "Pajero", "ASX", "L200"
  ],
  "Volvo": [
    "S60", "S90", "V60", "V90", "XC40", "XC60", "XC90", "C40", "EX30", "EX90"
  ],
  "Jaguar": [
    "XE", "XF", "XJ", "F-Pace", "E-Pace", "I-Pace", "F-Type"
  ],
  "Land Rover": [
    "Defender", "Discovery", "Discovery Sport", "Range Rover", "Range Rover Sport", 
    "Range Rover Velar", "Range Rover Evoque"
  ],
  "Porsche": [
    "911", "718 Boxster", "718 Cayman", "Panamera", "Cayenne", "Macan", "Taycan"
  ],
  "Tesla": [
    "Model S", "Model 3", "Model X", "Model Y", "Cybertruck", "Roadster"
  ]
};

export const CAR_MAKES = Object.keys(CAR_MAKES_MODELS);

export function getModelsForMake(make: string): string[] {
  return CAR_MAKES_MODELS[make as keyof typeof CAR_MAKES_MODELS] || [];
}