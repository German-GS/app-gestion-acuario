// constants/recommendations.js

import i18n from "../i18n";

// Texto base (español) – sirve como fallback y como documentación central.
export const RECOMMENDATIONS = {
  /* ============================
     🔵 ACUARIO MARINO
     ============================ */

  kh: {
    high: "Reduce la dosificación de KH. Un KH muy alto puede causar quemaduras en las puntas de los corales SPS. Ajusta lentamente y revisa consumo diario.",
    low: "Añade un buffer de KH para elevar la alcalinidad gradualmente. Evita subidas mayores de 1 dKH por día.",
  },

  ca: {
    high: "Reduce la dosificación de calcio. Evita niveles muy altos porque afectan la disponibilidad del magnesio y pueden precipitar carbonatos.",
    low: "Añade suplemento de calcio. Asegúrate de que el KH y Mg estén dentro del rango adecuado para evitar desbalances.",
  },

  mg: {
    high: "Suspende suplementos de magnesio y realiza cambios parciales de agua para estabilizar. Niveles muy altos reducen la disponibilidad del calcio.",
    low: "Añade suplemento de magnesio. Mantener Mg estable ayuda a la absorción equilibrada de KH y Ca.",
  },

  no3: {
    high: "Realiza cambio de agua y reduce la alimentación. Limpia el skimmer, y considera usar resinas o reactores anti-nitratos. Revisa sobrepoblación.",
    low: "Un NO₃ muy bajo favorece dinoflagelados. Incrementa ligeramente la alimentación o dosifica nitratos (NO₃) seguros.",
  },

  po4: {
    high: "Reduce la comida, utiliza resinas GFO o reactores específicos y revisa si tu agua RODI está en 0 TDS.",
    low: "Niveles muy bajos de PO₄ afectan el color y crecimiento del coral. Mantén al menos 0.01–0.05 ppm.",
  },

  ph: {
    high: "Un pH demasiado alto suele venir de exceso de aireación o CO₂ ambiente muy bajo. Reduce la dosificación de Kalkwasser si la usas.",
    low: "Mejora la ventilación del hogar, usa línea de aire exterior para el skimmer o considera un scrubber de CO₂.",
  },

  salinity: {
    high: "Reduce la salinidad retirando agua salada y agregando agua RODI. Hazlo gradualmente (máx. 1 ppt por día).",
    low: "Agrega agua de sal preparada y revisa si tu auto top-off está funcionando correctamente.",
  },

  temp: {
    high: "Temperaturas altas reducen oxígeno y estresan peces. Usa enfriadores, ventiladores y evita luz directa.",
    low: "Incrementa la temperatura lentamente. Revisa que el calentador funcione correctamente.",
  },

  ammonia: {
    high: "Amonio es tóxico incluso en pequeñas cantidades. Haz cambio de agua, aumenta oxigenación y revisa filtros. NO alimentes hasta estabilizar.",
    low: "Siempre debe estar en 0. Si está bajo, es buena señal de madurez del sistema.",
  },

  nitrite: {
    high: "Muy tóxico para peces. Cambios de agua grandes, añade bacterias y revisa sobrealimentación. Evita nuevos peces durante un pico.",
    low: "Nitrito debe ser 0 en sistemas maduros. Si está bajo, todo está en orden.",
  },

  k: {
    high: "Reduce cualquier suplemento de potasio. Niveles altos pueden quemar tejidos en corales SPS.",
    low: "Añade potasio. Importante para coloración azul/púrpura en SPS.",
  },

  strontium: {
    high: "Detén dosificación y realiza cambios parciales de agua. Sr alto afecta crecimiento coralino.",
    low: "Añade estroncio. Ayuda a crecimiento de corales duros y estabilidad ósea.",
  },

  iodine: {
    high: "Suspende dosificación. Niveles altos pueden causar estrés en invertebrados.",
    low: "Añade yodo en dosis muy controladas. Es esencial para mudas de camarones y salud de corales blandos.",
  },

  oxygen: {
    low: "Mejora la aireación, revisa la superficie, aumenta flujo y revisa temperatura.",
    high: "Generalmente no es un problema, salvo por exceso de microburbujas.",
  },

  /* ============================
     🟢 ACUARIO DE AGUA DULCE
     ============================ */

  gh: {
    high: "GH alto puede afectar peces sensibles. Considera mezclar agua con osmosis inversa para bajar la dureza.",
    low: "Añade sales minerales específicas para agua dulce. Imprescindible para estabilidad osmótica.",
  },

  freshwater_kh: {
    high: "KH muy alto sube el pH. Reduce el uso de piedras calcáreas y mezcla con agua de osmosis inversa.",
    low: "Añade buffer de KH para evitar caídas bruscas de pH.",
  },

  freshwater_ph: {
    high: "Evita piedras calcáreas, reduce aireación y usa troncos o hojas de almendro indio para acidificar.",
    low: "Incrementa ligeramente el KH, aumenta aireación y evita materias orgánicas ácidas.",
  },

  nitrite_fw: {
    high: "MUY tóxico. Cambios de agua inmediatos, añade bacterias y reduce comida. Revisa sobrepoblación.",
    low: "Debe ser 0. Si está bajo, el ciclo está estable.",
  },

  nitrate_fw: {
    high: "Realiza cambios de agua, reduce comida y añade más plantas naturales.",
    low: "Niveles muy bajos pueden indicar falta de nutrientes para plantas.",
  },

  phosphate_fw: {
    high: "Causa algas. Reduce comida, sifonea el sustrato y usa resinas anti-fosfatos.",
    low: "Un PO₄ demasiado bajo limita el crecimiento de plantas.",
  },

  co2: {
    high: "CO₂ alto es tóxico. Aumenta aireación inmediatamente.",
    low: "CO₂ bajo limita el crecimiento de plantas. Ajusta el sistema CO₂ o aumenta difusión.",
  },

  iron: {
    high: "Exceso causa algas. Reduce fertilización.",
    low: "Añade suplemento de hierro para mejorar coloración y crecimiento.",
  },

  potassium_fw: {
    high: "Reduce fertilización, niveles altos causan agujeros en hojas.",
    low: "Añade potasio. Es uno de los macronutrientes primarios para plantas.",
  },

  ammonia_fw: {
    high: "Cambio de agua inmediato. Amonio es letal para peces. Limpia filtros y reduce comida. Puede agregar quimicos especializados para encapsular el amonia",
    low: "Debe ser 0 siempre en un sistema sano.",
  },

  tds: {
    high: "TDS alto indica muchas sales disueltas. Usa agua de osmosis y evita sobrealimentación.",
    low: "TDS bajo afecta estabilidad osmótica. Añade minerales esenciales.",
  },

  dissolved_oxygen: {
    high: "Muy buena oxigenación. No es un problema.",
    low: "Aumenta movimiento de superficie, evita altas temperaturas, usa aireadores si es necesario.",
  },

  temp_fw: {
    high: "Baja la temperatura con cambios de agua fríos o ventilación. Evita golpes térmicos.",
    low: "Usa calentador y súbelo gradualmente.",
  },
};

export const getRecommendationText = (paramKey, alertType, mainType) => {
  // Mapa de overrides para freshwater
  const freshwaterMap = {
    kh: "kh_fw",
    ph: "ph_fw",
    // si luego quieres separar otros:
    // no3: "no3_fw",
    // po4: "po4_fw",
  };

  // Elegimos qué clave usar
  const recommendationKey =
    mainType === "freshwater" && freshwaterMap[paramKey]
      ? freshwaterMap[paramKey]
      : paramKey;

  const fallback = RECOMMENDATIONS?.[recommendationKey]?.[alertType] || "";

  return i18n.t(`recommendations.${recommendationKey}.${alertType}`, fallback);
};
