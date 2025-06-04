class CarData {
  static const Map<String, List<String>> carMakesModels = {
    "BMW": [
      "1 Series", "2 Series", "3 Series", "4 Series", "5 Series", "6 Series", "7 Series", "8 Series",
      "X1", "X2", "X3", "X4", "X5", "X6", "X7", "XM", "Z3", "Z4", "Z8", "i3", "i4", "i7", "iX", "iX1", "iX3",
      "M1", "M2", "M3", "M4", "M5", "M6", "M8", "1M", "X3 M", "X4 M", "X5 M", "X6 M"
    ],
    "Mercedes-Benz": [
      "A-Class", "B-Class", "C-Class", "CLA", "CLS", "E-Class", "S-Class", "G-Class", "GLA", "GLB", 
      "GLC", "GLE", "GLS", "SL", "SLC", "SLK", "AMG GT", "EQS", "EQC", "EQA", "EQB", "EQE", "EQV",
      "Maybach S-Class", "Maybach GLS", "AMG A35", "AMG A45", "AMG C43", "AMG C63", "AMG E53", "AMG E63",
      "AMG GLA35", "AMG GLA45", "AMG GLC43", "AMG GLC63", "AMG GLE53", "AMG GLE63", "AMG S63", "AMG G63"
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
    ],
    "Lada": [
      "Granta", "Vesta", "Largus", "XRAY", "Niva", "Kalina", "Priora", "2107", "2110", "2114"
    ],
    "ВАЗ": [
      "2101", "2102", "2103", "2104", "2105", "2106", "2107", "2108", "2109", "2110", 
      "2111", "2112", "2113", "2114", "2115", "Нива", "Калина", "Приора", "Гранта"
    ],
    "ГАЗ": [
      "Волга", "3110", "31105", "3102", "2410", "Газель", "Соболь", "Hunter"
    ],
    "УАЗ": [
      "Patriot", "Hunter", "3909", "452", "Буханка", "3163", "Pickup"
    ],
    "Genesis": [
      "G70", "G80", "G90", "GV60", "GV70", "GV80", "Electrified G80", "Electrified GV70"
    ],
    "Alfa Romeo": [
      "Giulia", "Stelvio", "Giulietta", "4C", "Tonale", "Brera", "159", "Spider"
    ],
    "Fiat": [
      "500", "Panda", "Tipo", "500X", "500L", "Ducato", "Doblo", "Qubo"
    ],
    "Jeep": [
      "Wrangler", "Grand Cherokee", "Cherokee", "Compass", "Renegade", "Gladiator", "Avenger"
    ],
    "Dodge": [
      "Charger", "Challenger", "Durango", "Journey", "Grand Caravan", "Ram 1500", "Ram 2500"
    ],
    "Chrysler": [
      "300", "Pacifica", "Voyager", "Sebring", "PT Cruiser"
    ],
    "Buick": [
      "Encore", "Envision", "Enclave", "Regal", "LaCrosse", "Verano"
    ],
    "GMC": [
      "Sierra", "Canyon", "Acadia", "Terrain", "Yukon", "Savana"
    ],
    "Lincoln": [
      "Navigator", "Aviator", "Corsair", "Nautilus", "MKZ", "Continental"
    ],
    "Ram": [
      "1500", "2500", "3500", "ProMaster", "ProMaster City"
    ],
    "Saab": [
      "9-3", "9-5", "900", "9000", "99", "96"
    ],
    "Skoda": [
      "Octavia", "Superb", "Fabia", "Kodiaq", "Karoq", "Kamiq", "Scala", "Enyaq"
    ],
    "SEAT": [
      "Leon", "Ibiza", "Arona", "Ateca", "Tarraco", "Alhambra", "Mii"
    ],
    "Peugeot": [
      "208", "308", "508", "2008", "3008", "5008", "Partner", "Boxer", "e-208"
    ],
    "Citroen": [
      "C3", "C4", "C5", "C1", "Berlingo", "Jumper", "DS3", "DS4", "DS5"
    ],
    "Renault": [
      "Clio", "Megane", "Scenic", "Captur", "Kadjar", "Koleos", "Talisman", "Zoe"
    ],
    "Dacia": [
      "Duster", "Logan", "Sandero", "Spring", "Jogger", "Lodgy"
    ],
    "Opel": [
      "Corsa", "Astra", "Insignia", "Crossland", "Grandland", "Mokka", "Vivaro"
    ],
    "Smart": [
      "Fortwo", "Forfour", "EQfortwo", "EQforfour", "Roadster"
    ],
    "Mini": [
      "Cooper", "Countryman", "Clubman", "Convertible", "Electric"
    ],
    "Rolls-Royce": [
      "Phantom", "Ghost", "Wraith", "Dawn", "Cullinan", "Spectre"
    ],
    "Bentley": [
      "Continental", "Flying Spur", "Bentayga", "Mulsanne"
    ],
    "Maserati": [
      "Ghibli", "Quattroporte", "Levante", "GranTurismo", "GranCabrio", "MC20"
    ],
    "Ferrari": [
      "488", "F8", "SF90", "Roma", "Portofino", "812", "LaFerrari", "296"
    ],
    "Lamborghini": [
      "Huracan", "Aventador", "Urus", "Revuelto", "Countach"
    ],
    "McLaren": [
      "570S", "720S", "765LT", "Artura", "GT", "P1"
    ],
    "Aston Martin": [
      "Vantage", "DB11", "DBS", "DBX", "Valkyrie"
    ],
    "Lotus": [
      "Evora", "Elise", "Exige", "Emira", "Evija"
    ],
    "Suzuki": [
      "Swift", "Vitara", "S-Cross", "Ignis", "Baleno", "Jimny", "Alto"
    ],
    "Isuzu": [
      "D-Max", "MU-X", "NPR", "FRR", "Trooper"
    ],
    "Daihatsu": [
      "Terios", "Sirion", "Materia", "Copen", "Move"
    ],
    "Geely": [
      "Atlas", "Coolray", "Emgrand", "GC9", "Tugella"
    ],
    "Chery": [
      "Tiggo", "Arrizo", "QQ", "Bonus", "CrossEastar"
    ],
    "BYD": [
      "Han", "Tang", "Song", "Qin", "Yuan", "E6", "F3"
    ],
    "Great Wall": [
      "Hover", "Wingle", "Sailor", "Peri", "Voleex"
    ],
    "Haval": [
      "H6", "H9", "F7", "Jolion", "Dargo"
    ],
    "JAC": [
      "S3", "S5", "T6", "iEV7S", "Refine"
    ],
    "Lifan": [
      "X60", "Solano", "Breez", "Cebrium", "Myway"
    ]
  };

  static List<String> get carMakes => carMakesModels.keys.toList();
  
  static List<String> getModelsForMake(String make) {
    return carMakesModels[make] ?? [];
  }
}