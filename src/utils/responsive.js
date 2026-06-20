// Utilidades de diseño responsivo para ReadWatch
// Maneja pantallas rectangulares, pequeñas y circulares (Wear OS)
import { Dimensions, PixelRatio } from 'react-native';

const { width, height } = Dimensions.get('window');

const BASE_WIDTH = 390;

/** Escala un valor proporcional al ancho de pantalla */
export const scale = (size) => {
  const factor = Math.min(width / BASE_WIDTH, 1.3);
  return Math.round(PixelRatio.roundToNearestPixel(size * factor));
};

/** Escala fuentes con factor conservador */
export const fontScale = (size) => {
  const factor = Math.min(width / BASE_WIDTH, 1.2);
  return Math.round(PixelRatio.roundToNearestPixel(size * factor));
};

export const wp = (percent) => (width * percent) / 100;
export const hp = (percent) => (height * percent) / 100;

export const SCREEN = { width, height };

/**
 * Detecta si la pantalla es de tipo "reloj" (pequeña y cuadrada/circular).
 * Wear OS XL Round: ~450x450px  |  Wear OS normal: ~300x300px
 */
export const isWatchScreen = width <= 460 && Math.abs(width - height) < 80;

/**
 * Para pantallas circulares, el contenido seguro está inscrito en el círculo.
 * El radio del círculo inscrito = width/2, y el ancho seguro = width / √2.
 * Agregamos un margen extra del 8% para seguridad visual.
 */
export const safeCircularPad = isWatchScreen
  ? Math.ceil(width * (1 - 1 / Math.sqrt(2)) / 2) + Math.ceil(width * 0.06)
  : scale(16);

/** Ancho de contenido seguro dentro del círculo */
export const safeContentWidth = width - safeCircularPad * 2;
