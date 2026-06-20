// HomeScreen v2 — Caratula principal de smartwatch con anillo SVG de progreso
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import COLORS from '../constants/colors';
import { useBooks } from '../hooks/useBooks';
import { calculateProgress } from '../utils/helpers';
import ProgressRing from '../components/ProgressRing';

const { width } = Dimensions.get('window');
const WATCH_SIZE = width * 0.84;
const RING_SIZE = WATCH_SIZE * 0.72;

/**
 * HomeScreen — Pantalla principal tipo caratula de smartwatch premium.
 * Muestra un anillo SVG de progreso global y accesos rápidos.
 */
export default function HomeScreen({ navigation }) {
  const { books } = useBooks();

  // Progreso global: promedio de todos los libros
  const avgProgress =
    books.length > 0
      ? parseFloat(
          (
            books.reduce((acc, b) => acc + calculateProgress(b.pagesRead, b.totalPages), 0) /
            books.length
          ).toFixed(1)
        )
      : 0;

  const completedCount = books.filter(
    (b) => calculateProgress(b.pagesRead, b.totalPages) >= 100
  ).length;

  // Libro leído más recientemente (mayor progreso sin completar)
  const activeBook = books
    .filter((b) => calculateProgress(b.pagesRead, b.totalPages) < 100)
    .sort((a, b) => calculateProgress(b.pagesRead, b.totalPages) - calculateProgress(a.pagesRead, a.totalPages))[0];

  // Hora actual para simular el reloj
  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Caratula circular principal */}
      <View style={styles.watchOuter}>
        {/* Detalle decorativo exterior del bisel */}
        <View style={styles.bezel}>
          <View style={styles.watchFace}>
            <ProgressRing percent={avgProgress} size={RING_SIZE} strokeWidth={8}>
              <View style={styles.ringContent}>
                {/* Hora simulada */}
                <Text style={styles.timeText}>{timeStr}</Text>

                {/* Porcentaje global grande */}
                <Text style={styles.bigPercent}>{avgProgress}%</Text>
                <Text style={styles.progressLabel}>progreso</Text>

                {/* Libro activo */}
                {activeBook ? (
                  <Text style={styles.activeBookTitle} numberOfLines={1}>
                    {activeBook.title}
                  </Text>
                ) : (
                  <Text style={styles.activeBookTitle}>
                    {books.length === 0 ? 'Sin libros' : '¡Todo completo!'}
                  </Text>
                )}
              </View>
            </ProgressRing>
          </View>
        </View>

        {/* Chips de estadísticas debajo del anillo dentro de la caratula */}
        <View style={styles.statsRow}>
          <View style={styles.statChip}>
            <Text style={styles.statChipValue}>{books.length}</Text>
            <Text style={styles.statChipLabel}>libros</Text>
          </View>
          <View style={[styles.statChip, styles.statChipCenter]}>
            <Text style={[styles.statChipValue, { color: COLORS.gold }]}>{completedCount}</Text>
            <Text style={styles.statChipLabel}>completos</Text>
          </View>
          <View style={styles.statChip}>
            <Text style={[styles.statChipValue, { color: COLORS.accent }]}>
              {books.reduce((acc, b) => acc + b.pagesRead, 0)}
            </Text>
            <Text style={styles.statChipLabel}>págs. leídas</Text>
          </View>
        </View>
      </View>

      {/* Botones de navegación rápida */}
      <View style={styles.navRow}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation.navigate('BookList')}
          activeOpacity={0.75}
        >
          <Text style={styles.navIcon}>📚</Text>
          <Text style={styles.navLabel}>Libros</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnPrimary]}
          onPress={() => navigation.navigate('AddBook')}
          activeOpacity={0.85}
        >
          <Text style={styles.navIcon}>＋</Text>
          <Text style={[styles.navLabel, { color: COLORS.background }]}>Agregar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation.navigate('ProgressChart')}
          activeOpacity={0.75}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navLabel}>Gráfica</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  watchOuter: {
    width: WATCH_SIZE,
    alignItems: 'center',
  },
  // Bisel exterior decorativo del reloj
  bezel: {
    width: WATCH_SIZE,
    height: WATCH_SIZE,
    borderRadius: WATCH_SIZE / 2,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 16,
  },
  watchFace: {
    width: WATCH_SIZE - 20,
    height: WATCH_SIZE - 20,
    borderRadius: (WATCH_SIZE - 20) / 2,
    backgroundColor: COLORS.watchFace,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Contenido interior del anillo de progreso
  ringContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    letterSpacing: 2,
    marginBottom: 2,
  },
  bigPercent: {
    color: COLORS.text,
    fontSize: 44,
    fontWeight: '900',
    lineHeight: 50,
  },
  progressLabel: {
    color: COLORS.primary,
    fontSize: 11,
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  activeBookTitle: {
    color: COLORS.textSecondary,
    fontSize: 11,
    maxWidth: RING_SIZE * 0.55,
    textAlign: 'center',
  },
  // Fila de chips de estadísticas dentro de la caratula
  statsRow: {
    position: 'absolute',
    bottom: WATCH_SIZE * 0.1,
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  statChipCenter: {
    borderColor: COLORS.gold + '44',
  },
  statChipValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  statChipLabel: {
    color: COLORS.textSecondary,
    fontSize: 9,
    letterSpacing: 0.5,
  },
  // Botones de navegación rápida
  navRow: {
    flexDirection: 'row',
    marginTop: 24,
    gap: 12,
  },
  navBtn: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    minWidth: 76,
  },
  navBtnPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  navIcon: {
    fontSize: 18,
    marginBottom: 2,
  },
  navLabel: {
    color: COLORS.text,
    fontSize: 11,
    fontWeight: '600',
  },
});
