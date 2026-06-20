// Componente reutilizable de anillo de progreso circular con SVG
// Simula el indicador de actividad de un smartwatch real
import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import COLORS from '../constants/colors';

/**
 * ProgressRing — Anillo SVG circular que muestra un porcentaje de progreso.
 * El trazo verde avanza en sentido horario conforme aumenta el porcentaje.
 *
 * @param {number} percent - Porcentaje de 0 a 100
 * @param {number} size - Diámetro total del componente en px (default 160)
 * @param {number} strokeWidth - Grosor del anillo (default 10)
 * @param {string} color - Color del trazo de progreso (default COLORS.primary)
 * @param {ReactNode} children - Contenido central del anillo
 */
const ProgressRing = ({
  percent = 0,
  size = 160,
  strokeWidth = 10,
  color = COLORS.primary,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  // El dashoffset controla cuánto del anillo está "lleno"
  const filled = ((100 - Math.min(percent, 100)) / 100) * circumference;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg
        width={size}
        height={size}
        style={{ position: 'absolute' }}
      >
        {/* Anillo de fondo gris */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.barEmpty}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Anillo de progreso — rotado -90° con transform para iniciar arriba */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={filled}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      {/* Contenido central: texto, iconos, etc. */}
      {children}
    </View>
  );
};

export default ProgressRing;
