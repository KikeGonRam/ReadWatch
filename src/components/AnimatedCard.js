// AnimatedCard — Tarjeta con animación de entrada (fade + slide up)
// Usada en BookListScreen para animar cada ítem de la lista en cascada
import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * AnimatedCard — Envuelve un componente con animación de entrada.
 * Aparece con fade + desplazamiento vertical, con delay basado en el índice.
 *
 * @param {ReactNode} children
 * @param {number}    index   - Posición en la lista (determina el delay)
 * @param {object}    style
 */
const AnimatedCard = ({ children, index = 0, style }) => {
  const opacity   = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    // Delay escalonado: cada tarjeta aparece 60ms después de la anterior
    const delay = index * 60;
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 320,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        delay,
        useNativeDriver: true,
        speed: 14,
        bounciness: 3,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
};

export default AnimatedCard;
