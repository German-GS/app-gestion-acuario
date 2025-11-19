// constants/parameterRanges.js

// Estos rangos definen los valores mínimos y máximos aceptables
// para cada tipo de acuario. Las llaves (ej: mixedReef, sps, lps)
// deben coincidir EXACTAMENTE con las llaves usadas en 'createAquarium.js'.

export const RANGES = {
  // --- Rangos para Acuarios Marinos ---
  fishOnly: {
    kh: { name: "KH", min: 7, max: 12 },
    ca: { name: "Calcio", min: 380, max: 450 },
    mg: { name: "Magnesio", min: 1250, max: 1400 },
    no3: { name: "Nitratos", min: 1, max: 20 },
    po4: { name: "Fosfatos", min: 0.02, max: 0.2 },
    temp: { name: "Temperatura", min: 24, max: 27 },
  },
  softCorals: {
    kh: { name: "KH", min: 7, max: 11 },
    ca: { name: "Calcio", min: 400, max: 450 },
    mg: { name: "Magnesio", min: 1250, max: 1410 },
    no3: { name: "Nitratos", min: 2, max: 15 },
    po4: { name: "Fosfatos", min: 0.06, max: 0.15 },
    temp: { name: "Temperatura", min: 24, max: 27 },
  },
  lps: {
    kh: { name: "KH", min: 7, max: 12 },
    ca: { name: "Calcio", min: 400, max: 450 },
    mg: { name: "Magnesio", min: 1280, max: 1410 },
    no3: { name: "Nitratos", min: 2, max: 10 },
    po4: { name: "Fosfatos", min: 0.04, max: 0.12 },
    temp: { name: "Temperatura", min: 25, max: 27 },
  },
  sps: {
    kh: { name: "KH", min: 7, max: 9 },
    ca: { name: "Calcio", min: 420, max: 460 },
    mg: { name: "Magnesio", min: 1300, max: 1410 },
    no3: { name: "Nitratos", min: 1, max: 5 },
    po4: { name: "Fosfatos", min: 0.01, max: 0.1 },
    temp: { name: "Temperatura", min: 25, max: 27 },
  },
  mixedReef: {
    kh: { name: "KH", min: 8, max: 12 },
    ca: { name: "Calcio", min: 400, max: 450 },
    mg: { name: "Magnesio", min: 1280, max: 1410 },
    no3: { name: "Nitratos", min: 2, max: 10 },
    po4: { name: "Fosfatos", min: 0.02, max: 0.1 },
    temp: { name: "Temperatura", min: 25, max: 27 },
  },

  // --- Rangos para Acuarios de Agua Dulce ---
  community: {
    // Acuario comunitario tropical estándar
    ph: { name: "pH", min: 6.5, max: 7.8 },
    gh: { name: "GH", min: 4, max: 12 },
    kh: { name: "KH", min: 3, max: 8 },
    ammonia: { name: "Amonio", min: 0, max: 0.02 },
    nitrite: { name: "Nitrito", min: 0, max: 0.1 },
    no3: { name: "Nitratos", min: 0, max: 40 },
    po4: { name: "Fosfatos", min: 0, max: 2 },
    temp: { name: "Temperatura", min: 22, max: 26 },
  },

  plantedLow: {
    // Plantado de bajos requerimientos (low-tech)
    ph: { name: "pH", min: 6.4, max: 7.2 },
    gh: { name: "GH", min: 3, max: 10 },
    kh: { name: "KH", min: 2, max: 6 },
    ammonia: { name: "Amonio", min: 0, max: 0.02 },
    nitrite: { name: "Nitrito", min: 0, max: 0.1 },
    no3: { name: "Nitratos", min: 5, max: 20 },
    po4: { name: "Fosfatos", min: 0.3, max: 1 },
    iron: { name: "Hierro", min: 0.05, max: 0.2 },
    temp: { name: "Temperatura", min: 22, max: 26 },
  },

  goldfish: {
    // Goldfish / Peces dorados orientales
    ph: { name: "pH", min: 6.8, max: 7.6 },
    gh: { name: "GH", min: 4, max: 12 },
    kh: { name: "KH", min: 4, max: 8 },
    ammonia: { name: "Amonio", min: 0, max: 0.02 },
    nitrite: { name: "Nitrito", min: 0, max: 0.1 },
    no3: { name: "Nitratos", min: 10, max: 40 },
    po4: { name: "Fosfatos", min: 0, max: 2 },
    iron: { name: "Hierro", min: 0, max: 0.1 }, // No se recomienda hierro
    temp: { name: "Temperatura", min: 18, max: 23 },
  },

  americanCichlids: {
    // Cíclidos Americanos (Oscar, Severum, Dempsey)
    ph: { name: "pH", min: 6.4, max: 7.4 },
    gh: { name: "GH", min: 3, max: 12 },
    kh: { name: "KH", min: 3, max: 8 },
    ammonia: { name: "Amonio", min: 0, max: 0.02 },
    nitrite: { name: "Nitrito", min: 0, max: 0.1 },
    no3: { name: "Nitratos", min: 5, max: 30 },
    po4: { name: "Fosfatos", min: 0, max: 1 },
    iron: { name: "Hierro", min: 0, max: 0.1 }, // Solo si hay plantas
    temp: { name: "Temperatura", min: 24, max: 28 },
  },

  africanCichlids: {
    // Malawi, Tanganica, Victoria
    ph: { name: "pH", min: 7.8, max: 8.6 },
    gh: { name: "GH", min: 8, max: 20 },
    kh: { name: "KH", min: 7, max: 12 },
    ammonia: { name: "Amonio", min: 0, max: 0.02 },
    nitrite: { name: "Nitrito", min: 0, max: 0.1 },
    no3: { name: "Nitratos", min: 5, max: 40 },
    po4: { name: "Fosfatos", min: 0, max: 2 },
    iron: { name: "Hierro", min: 0, max: 0.05 },
    temp: { name: "Temperatura", min: 24, max: 27 },
  },

  plantedHigh: {
    // Plantado high-tech, CO2 y luz intensa
    ph: { name: "pH", min: 6.0, max: 6.8 },
    gh: { name: "GH", min: 3, max: 8 },
    kh: { name: "KH", min: 1, max: 4 },
    ammonia: { name: "Amonio", min: 0, max: 0.02 },
    nitrite: { name: "Nitrito", min: 0, max: 0.1 },
    no3: { name: "Nitratos", min: 10, max: 25 },
    po4: { name: "Fosfatos", min: 1, max: 2 },
    iron: { name: "Hierro", min: 0.05, max: 0.5 },
    temp: { name: "Temperatura", min: 22, max: 25 },
  },
  // ...puedes añadir aquí el resto de los sub-tipos de agua dulce
  // como 'goldfish', 'americanCichlids', etc.
};
