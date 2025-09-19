// constants/recommendations.js

// Este archivo centraliza todos los consejos para los parámetros del acuario.
// Esto facilita la edición, traducción o expansión de las recomendaciones en el futuro.

export const RECOMMENDATIONS = {
  kh: {
    high: 'Considera reducir la dosificación de suplementos de KH (alcalinidad) o realizar un cambio de agua con una sal de menor KH.',
    low: 'Añade un suplemento de KH (buffer) siguiendo las instrucciones del fabricante para aumentar la alcalinidad gradualmente.'
  },
  ca: {
    high: 'Reduce la dosificación de Calcio. Si el desbalance es grande, un cambio de agua puede ayudar a estabilizar.',
    low: 'Añade un suplemento de Calcio. Asegúrate de que tus niveles de KH y Magnesio estén correctos, ya que interactúan entre sí.'
  },
  mg: {
      high: 'Suspende la adición de Magnesio y realiza cambios de agua parciales para diluir la concentración.',
      low: 'Añade un suplemento de Magnesio. Mantener el Mg en su rango es crucial para la estabilidad del KH y Calcio.'
  },
  no3: {
    high: 'Realiza un cambio de agua, reduce la alimentación de los peces, revisa y limpia tu skimmer o considera usar reactores o resinas anti-nitratos.',
    // --- 👇 CONSEJO MEJORADO AQUÍ 👇 ---
    low: 'Nutrientes muy bajos (cercanos a 0) pueden causar problemas como dinoflagelados. Es recomendable mantenerlos en el rango mínimo para tus corales (ej. 1-5 ppm).'
  },
  po4: {
      high: 'Reduce la alimentación, realiza cambios de agua y utiliza resinas GFO o reactores de fosfatos. Asegúrate de que tu agua de relleno sea 0 TDS.',
      // --- 👇 CONSEJO MEJORADO AQUÍ 👇 ---
      low: 'Cuidado con los fosfatos en cero absoluto, puede favorecer la aparición de dinoflagelados. Intenta mantener un nivel mínimo detectable (ej. 0.01-0.05 ppm).'
  },
  // Puedes añadir más parámetros y sus recomendaciones aquí en el futuro.
  // temp: {
  //   high: 'Revisa el calentador, la temperatura ambiente o la iluminación. Considera usar un enfriador (chiller) si es necesario.',
  //   low: 'Verifica el funcionamiento de tu calentador y asegúrate de que esté correctamente calibrado para el volumen de tu acuario.'
  // }
};