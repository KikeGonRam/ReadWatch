// PressableScale — Botón con animación de escala al presionar
// Reemplaza TouchableOpacity en botones principales para feedback táctil premium
import React, { useRef } from 'react';
import { Animated, TouchableWithoutFeedback } from 'react-native';

/**
 * PressableScale — Wrapper que escala ligeramente hacia abajo al presionar.
 * Da feedback visual inmediato sin depender de librerías externas.
 *
 * @param {ReactNode} children
 * @param {Function}  onPress
 * @param {number}    scaleDown - Escala al presionar (default 0.95)
 * @param {object}    style
 */
const PressableScale = ({ children, onPress, scaleDown = 0.95, style, disabled, activeOpacity = 1 }) => {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () => {
    Animated.spring(scale, {
      toValue: scaleDown,
      useNativeDriver: true,
      speed: 50,
      bounciness: 0,
    }).start();
  };

  const pressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  return (
    <TouchableWithoutFeedback
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      disabled={disabled}
    >
      <Animated.View style={[style, { transform: [{ scale }], opacity: disabled ? 0.5 : 1 }]}>
        {children}
      </Animated.View>
    </TouchableWithoutFeedback>
  );
};

export default PressableScale;
