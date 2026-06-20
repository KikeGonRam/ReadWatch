// Utilidades de diseño responsivo para ReadWatch
// Escala proporcional basada en el ancho de pantalla del dispositivo
import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

// Base de diseño: iPhone 14 / Pixel 7 (390px ancho)
const BASE_WIDTH = 390;

/**
 * Escala un valor de tamaño proporcionalmente al ancho de pantalla.
 * @param {number} size - Tamaño en la base de 390px
 * @returns {number} Tamaño escalado al dispositivo actual
 */
export const scale = (size) => {
  const factor = Math.min(width / BASE_WIDTH, 1.3); // cap en 1.3x para tablets
  return Math.round(PixelRatio.roundToNearestPixel(size * factor));
};

/**
 * Escala fuentes con un factor más conservador para legibilidad.
 * @param {number} size - Tamaño de fuente base
 */
export const fontScale = (size) => {
  const factor = Math.min(width / BASE_WIDTH, 1.2);
  return Math.round(PixelRatio.roundToNearestPixel(size * factor));
};

// Porcentaje del ancho/alto de pantalla
export const wp = (percent) => (width * percent) / 100;
export const hp = (percent) => (height * percent) / 100;

export const SCREEN = { width, height };
