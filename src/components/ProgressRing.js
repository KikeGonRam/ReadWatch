// ProgressRing v2 — Anillo SVG con animación suave del trazo
import React, { useEffect, useRef } from 'react';
import { View, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import COLORS from '../constants/colors';

// Circle animado para poder interpolar strokeDashoffset con Animated API
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/**
 * ProgressRing — Anillo SVG circular con animación de llenado.
 * Cada vez que cambia `percent`, el trazo se anima suavemente al nuevo valor.
 *
 * @param {number}    percent      - Porcentaje 0-100
 * @param {number}    size         - Diámetro total (px)
 * @param {number}    strokeWidth  - Grosor del anillo
 * @param {string}    color        - Color del trazo de progreso
 * @param {number}    duration     - Duración de la animación en ms (default 800)
 * @param {ReactNode} children     - Contenido central
 */
const ProgressRing = ({
  percent = 0,
  size = 160,
  strokeWidth = 10,
  color = COLORS.primary,
  duration = 800,
  children,
}) => {
  const radius       = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  // Valor animado que representa el dashoffset actual
  const animValue = useRef(new Animated.Value(circumference)).current;

  useEffect(() => {
    // Calcular el dashoffset objetivo para el porcentaje dado
    const target = ((100 - Math.min(percent, 100)) / 100) * circumference;
    Animated.timing(animValue, {
      toValue: target,
      duration,
      useNativeDriver: false, // SVG props no soportan native driver
    }).start();
  }, [percent, circumference, duration]);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Anillo de fondo */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={COLORS.barEmpty}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Anillo de progreso animado — rota -90° para iniciar arriba */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={animValue}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      {children}
    </View>
  );
};

export default ProgressRing;
