// HomeScreen v2.2 — Iconos vectoriales con @expo/vector-icons
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';
import { useBooks } from '../hooks/useBooks';
import { calculateProgress } from '../utils/helpers';
import ProgressRing from '../components/ProgressRing';
import { wp, hp, scale, fontScale, SCREEN } from '../utils/responsive';

const WATCH_SIZE = Math.min(wp(84), hp(50));
const RING_SIZE  = WATCH_SIZE * 0.70;
const STROKE     = scale(8);
const isSmall    = SCREEN.width < 300;

export default function HomeScreen({ navigation }) {
  const { books } = useBooks();

  const avgProgress =
    books.length > 0
      ? parseFloat(
          (books.reduce((acc, b) => acc + calculateProgress(b.pagesRead, b.totalPages), 0) / books.length).toFixed(1)
        )
      : 0;

  const completedCount = books.filter(
    (b) => calculateProgress(b.pagesRead, b.totalPages) >= 100
  ).length;

  const activeBook = books
    .filter((b) => calculateProgress(b.pagesRead, b.totalPages) < 100)
    .sort((a, b) => calculateProgress(b.pagesRead, b.totalPages) - calculateProgress(a.pagesRead, a.totalPages))[0];

  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.watchOuter}>
        <View style={[styles.bezel, { width: WATCH_SIZE, height: WATCH_SIZE, borderRadius: WATCH_SIZE / 2 }]}>
          <View style={[styles.watchFace, { width: WATCH_SIZE - scale(18), height: WATCH_SIZE - scale(18), borderRadius: (WATCH_SIZE - scale(18)) / 2 }]}>
            <ProgressRing percent={avgProgress} size={RING_SIZE} strokeWidth={STROKE}>
              <View style={styles.ringContent}>
                {!isSmall && <Text style={styles.timeText}>{timeStr}</Text>}
                <Text style={[styles.bigPercent, { fontSize: fontScale(isSmall ? 32 : 44) }]}>
                  {avgProgress}%
                </Text>
                <Text style={[styles.progressLabel, { fontSize: fontScale(isSmall ? 9 : 11) }]}>
                  progreso
                </Text>
                {!isSmall && (
                  <Text style={styles.activeBookTitle} numberOfLines={1}>
                    {activeBook ? activeBook.title : books.length === 0 ? 'Sin libros' : '¡Todo completo!'}
                  </Text>
                )}
              </View>
            </ProgressRing>
          </View>
        </View>

        {/* Chips de estadísticas */}
        {!isSmall && (
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Ionicons name="book-outline" size={scale(12)} color={COLORS.textSecondary} />
              <Text style={styles.statChipValue}>{books.length}</Text>
              <Text style={styles.statChipLabel}>libros</Text>
            </View>
            <View style={[styles.statChip, styles.statChipCenter]}>
              <Ionicons name="checkmark-circle" size={scale(12)} color={COLORS.gold} />
              <Text style={[styles.statChipValue, { color: COLORS.gold }]}>{completedCount}</Text>
              <Text style={styles.statChipLabel}>completos</Text>
            </View>
            <View style={styles.statChip}>
              <Ionicons name="reader-outline" size={scale(12)} color={COLORS.accent} />
              <Text style={[styles.statChipValue, { color: COLORS.accent }]}>
                {books.reduce((acc, b) => acc + b.pagesRead, 0)}
              </Text>
              <Text style={styles.statChipLabel}>págs. leídas</Text>
            </View>
          </View>
        )}
      </View>

      {/* Botones de navegación */}
      <View style={[styles.navRow, isSmall && styles.navRowSmall]}>
        <TouchableOpacity
          style={[styles.navBtn, isSmall && styles.navBtnSmall]}
          onPress={() => navigation.navigate('BookList')}
          activeOpacity={0.75}
        >
          <Ionicons name="library-outline" size={scale(isSmall ? 18 : 20)} color={COLORS.text} />
          {!isSmall && <Text style={styles.navLabel}>Libros</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnPrimary, isSmall && styles.navBtnSmall]}
          onPress={() => navigation.navigate('AddBook')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={scale(isSmall ? 20 : 22)} color={COLORS.background} />
          {!isSmall && <Text style={[styles.navLabel, { color: COLORS.background }]}>Agregar</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, isSmall && styles.navBtnSmall]}
          onPress={() => navigation.navigate('ProgressChart')}
          activeOpacity={0.75}
        >
          <Ionicons name="bar-chart-outline" size={scale(isSmall ? 18 : 20)} color={COLORS.text} />
          {!isSmall && <Text style={styles.navLabel}>Gráfica</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  watchOuter: { alignItems: 'center' },
  bezel: {
    backgroundColor: COLORS.surface,
    borderWidth: scale(2),
    borderColor: COLORS.borderLight,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.18,
    shadowRadius: scale(20),
    elevation: 14,
  },
  watchFace: { backgroundColor: COLORS.watchFace, alignItems: 'center', justifyContent: 'center' },
  ringContent: { alignItems: 'center', justifyContent: 'center' },
  timeText: { color: COLORS.textSecondary, fontSize: fontScale(12), letterSpacing: 2, marginBottom: 2 },
  bigPercent: { color: COLORS.text, fontWeight: '900' },
  progressLabel: { color: COLORS.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: scale(4) },
  activeBookTitle: { color: COLORS.textSecondary, fontSize: fontScale(11), maxWidth: RING_SIZE * 0.55, textAlign: 'center' },
  statsRow: { position: 'absolute', bottom: WATCH_SIZE * 0.1, flexDirection: 'row', gap: scale(6) },
  statChip: { alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: scale(10), paddingHorizontal: scale(8), paddingVertical: scale(4), borderWidth: 1, borderColor: COLORS.border, gap: scale(2) },
  statChipCenter: { borderColor: COLORS.gold + '44' },
  statChipValue: { color: COLORS.text, fontSize: fontScale(13), fontWeight: '800' },
  statChipLabel: { color: COLORS.textSecondary, fontSize: fontScale(9) },
  navRow: { flexDirection: 'row', marginTop: scale(20), gap: scale(10) },
  navRowSmall: { marginTop: scale(10), gap: scale(6) },
  navBtn: { alignItems: 'center', paddingVertical: scale(10), paddingHorizontal: scale(16), borderRadius: scale(18), backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight, minWidth: scale(68), gap: scale(4) },
  navBtnSmall: { paddingVertical: scale(8), paddingHorizontal: scale(10), minWidth: scale(40), borderRadius: scale(20) },
  navBtnPrimary: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  navLabel: { color: COLORS.text, fontSize: fontScale(11), fontWeight: '600' },
});
