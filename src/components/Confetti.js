// Confetti — Explosión de partículas al completar un libro al 100%
import React, { useEffect, useRef } from 'react';
import { Animated, Dimensions, StyleSheet, View } from 'react-native';

const { width, height } = Dimensions.get('window');

const COLORS = ['#00FF88', '#00BFFF', '#FFB800', '#FF6B9D', '#A78BFA', '#FF7043', '#FFD700'];
const PARTICLE_COUNT = 28;

const randomBetween = (a, b) => a + Math.random() * (b - a);

const createParticle = () => ({
  x: randomBetween(width * 0.1, width * 0.9),
  color: COLORS[Math.floor(Math.random() * COLORS.length)],
  size: randomBetween(5, 11),
  duration: randomBetween(1000, 1800),
  delay: randomBetween(0, 400),
  xDrift: randomBetween(-60, 60),
  isRect: Math.random() > 0.5,
});

const ParticleView = ({ particle }) => {
  const translateY = useRef(new Animated.Value(-20)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity    = useRef(new Animated.Value(1)).current;
  const rotate     = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: height * 0.6,
        duration: particle.duration,
        delay: particle.delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateX, {
        toValue: particle.xDrift,
        duration: particle.duration,
        delay: particle.delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: particle.duration * 0.6,
        delay: particle.delay + particle.duration * 0.4,
        useNativeDriver: true,
      }),
      Animated.timing(rotate, {
        toValue: randomBetween(-3, 3),
        duration: particle.duration,
        delay: particle.delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const spin = rotate.interpolate({ inputRange: [-3, 3], outputRange: ['-540deg', '540deg'] });

  return (
    <Animated.View
      style={{
        position: 'absolute',
        left: particle.x,
        top: 0,
        width: particle.size,
        height: particle.isRect ? particle.size * 1.6 : particle.size,
        borderRadius: particle.isRect ? 2 : particle.size / 2,
        backgroundColor: particle.color,
        opacity,
        transform: [{ translateY }, { translateX }, { rotate: spin }],
      }}
    />
  );
};

const Confetti = ({ visible }) => {
  const particles = useRef(Array.from({ length: PARTICLE_COUNT }, createParticle)).current;

  if (!visible) return null;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p, i) => (
        <ParticleView key={i} particle={p} />
      ))}
    </View>
  );
};

export default Confetti;
