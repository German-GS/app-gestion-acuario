// constants/theme.js

// Definimos la paleta de colores que diseñamos.
// Usar nombres descriptivos nos ayuda a recordar su propósito.
export const COLORS = {
  primary: '#0A2A4E',        // Azul Profundo
  secondary: '#00C2D1',      // Turquesa Vibrante

  background: '#F8F9FA',      // Blanco Nube
  text: '#495057',            // Gris Neutro
  white: '#FFFFFF',

  // Colores de Acento
  accentFreshwater: '#57A867',
  accentMarine: '#FF6B6B',

  // Tonos de gris
  lightGray: '#E0E0E0',
  darkGray: '#8A8A8A',
};

// Definimos una escala consistente para tamaños y espaciados.
// Usar múltiplos de un valor base (ej. 8) crea un ritmo visual agradable.
export const SIZES = {
  base: 8,
  font: 14,
  radius: 12,
  padding: 24,
  margin: 16,

  // Tamaños de fuente
  h1: 30,
  h2: 22,
  h3: 18,
  body1: 16,
  body2: 14,
  caption: 12,
};

// Definimos los estilos de nuestras fuentes.
// Aquí combinamos la familia de fuente, el tamaño y el color por defecto.
export const FONTS = {
  h1: { fontFamily: 'Montserrat_700Bold', fontSize: SIZES.h1, lineHeight: 36, color: COLORS.primary },
  h2: { fontFamily: 'Montserrat_600SemiBold', fontSize: SIZES.h2, lineHeight: 30, color: COLORS.primary },
  h3: { fontFamily: 'Montserrat_600SemiBold', fontSize: SIZES.h3, lineHeight: 22, color: COLORS.primary },
  body1: { fontFamily: 'Lato_400Regular', fontSize: SIZES.body1, lineHeight: 24, color: COLORS.text },
  body2: { fontFamily: 'Lato_400Regular', fontSize: SIZES.body2, lineHeight: 22, color: COLORS.text },
  caption: { fontFamily: 'Lato_400Regular', fontSize: SIZES.caption, lineHeight: 18, color: COLORS.darkGray },
};

// Exportamos todo en un solo objeto 'AppTheme' para fácil importación.
export const AppTheme = { COLORS, SIZES, FONTS };

export default AppTheme;