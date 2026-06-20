// HomeScreen v4.1 — Layout seguro para pantallas circulares
import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Modal, TextInput, KeyboardAvoidingView, Platform, Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, RadialGradient, Stop, Circle as SvgCircle } from 'react-native-svg';
import COLORS from '../constants/colors';
import { useBooks } from '../hooks/useBooks';
import { calculateProgress } from '../utils/helpers';
import ProgressRing from '../components/ProgressRing';
import PressableScale from '../components/PressableScale';
import { wp, hp, scale, fontScale, isWatchScreen, safeCircularPad } from '../utils/responsive';

// Tamaños de la caratula adaptados al tipo de pantalla
const WATCH_SIZE = isWatchScreen
  ? Math.min(wp(70), hp(70))          // Más pequeño en Wear OS para caber en el círculo
  : Math.min(wp(84), hp(50));
const RING_SIZE  = WATCH_SIZE * 0.70;
const STROKE     = scale(isWatchScreen ? 6 : 8);

export default function HomeScreen({ navigation }) {
  const { books, dailyGoal, updateDailyGoal } = useBooks();
  const [goalModal, setGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  const watchScale   = useRef(new Animated.Value(0.75)).current;
  const watchOpacity = useRef(new Animated.Value(0)).current;
  const navOpacity   = useRef(new Animated.Value(0)).current;
  const goalOpacity  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(watchScale,   { toValue: 1, useNativeDriver: true, speed: 8, bounciness: 6 }),
        Animated.timing(watchOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(navOpacity,  { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(goalOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const avgProgress =
    books.length > 0
      ? parseFloat((books.reduce((acc, b) => acc + calculateProgress(b.pagesRead, b.totalPages), 0) / books.length).toFixed(1))
      : 0;

  const completedCount = books.filter((b) => calculateProgress(b.pagesRead, b.totalPages) >= 100).length;
  const totalPagesRead = books.reduce((acc, b) => acc + b.pagesRead, 0);
  const activeBook = books
    .filter((b) => calculateProgress(b.pagesRead, b.totalPages) < 100)
    .sort((a, b) => calculateProgress(b.pagesRead, b.totalPages) - calculateProgress(a.pagesRead, a.totalPages))[0];

  const now     = new Date();
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });
  const goalPercent = dailyGoal > 0 ? Math.min((totalPagesRead / dailyGoal) * 100, 100) : 0;

  const handleSaveGoal = async () => {
    const val = parseInt(goalInput, 10);
    if (!isNaN(val) && val > 0) await updateDailyGoal(val);
    setGoalModal(false);
    setGoalInput('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} hidden={isWatchScreen} />

      {/* Caratula animada */}
      <Animated.View style={[styles.watchOuter, { opacity: watchOpacity, transform: [{ scale: watchScale }] }]}>
        {/* Halo/glow detrás del reloj */}
        <Svg
          width={WATCH_SIZE * 2.2}
          height={WATCH_SIZE * 2.2}
          style={styles.glowSvg}
        >
          <Defs>
            <RadialGradient id="watchGlow" cx="50%" cy="50%" r="50%">
              <Stop offset="0%"   stopColor={COLORS.primary} stopOpacity="0.28" />
              <Stop offset="45%"  stopColor={COLORS.primary} stopOpacity="0.10" />
              <Stop offset="100%" stopColor={COLORS.primary} stopOpacity="0"    />
            </RadialGradient>
          </Defs>
          <SvgCircle cx={WATCH_SIZE * 1.1} cy={WATCH_SIZE * 1.1} r={WATCH_SIZE * 1.1} fill="url(#watchGlow)" />
        </Svg>

        <View style={[styles.bezel, { width: WATCH_SIZE, height: WATCH_SIZE, borderRadius: WATCH_SIZE / 2 }]}>
          <View style={[styles.watchFace, { width: WATCH_SIZE - scale(14), height: WATCH_SIZE - scale(14), borderRadius: (WATCH_SIZE - scale(14)) / 2 }]}>
            <ProgressRing percent={avgProgress} size={RING_SIZE} strokeWidth={STROKE} duration={1000}>
              <View style={styles.ringContent}>
                {!isWatchScreen && <Text style={styles.timeText}>{timeStr}</Text>}
                <Text style={[styles.bigPercent, { fontSize: fontScale(isWatchScreen ? 28 : 44) }]}>{avgProgress}%</Text>
                <Text style={[styles.progressLabel, { fontSize: fontScale(isWatchScreen ? 8 : 11) }]}>progreso</Text>
                {!isWatchScreen && (
                  <Text style={styles.activeBookTitle} numberOfLines={1}>
                    {activeBook ? activeBook.title : books.length === 0 ? 'Sin libros' : '¡Completo!'}
                  </Text>
                )}
              </View>
            </ProgressRing>
          </View>
        </View>

        {/* Chips — solo en teléfonos */}
        {!isWatchScreen && (
          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Ionicons name="book-outline" size={scale(11)} color={COLORS.textSecondary} />
              <Text style={styles.statChipValue}>{books.length}</Text>
              <Text style={styles.statChipLabel}>libros</Text>
            </View>
            <View style={[styles.statChip, styles.statChipGold]}>
              <Ionicons name="trophy" size={scale(11)} color={COLORS.gold} />
              <Text style={[styles.statChipValue, { color: COLORS.gold }]}>{completedCount}</Text>
              <Text style={styles.statChipLabel}>completos</Text>
            </View>
            <View style={[styles.statChip, styles.statChipAccent]}>
              <Ionicons name="reader-outline" size={scale(11)} color={COLORS.accent} />
              <Text style={[styles.statChipValue, { color: COLORS.accent }]}>{totalPagesRead}</Text>
              <Text style={styles.statChipLabel}>págs.</Text>
            </View>
          </View>
        )}

        {/* Chips compactos dentro de la caratula para Wear OS */}
        {isWatchScreen && (
          <View style={styles.watchStatsRow}>
            <Text style={styles.watchStatText}>{books.length} libros · {completedCount} ✓</Text>
          </View>
        )}
      </Animated.View>

      {/* Meta diaria — solo en teléfonos */}
      {!isWatchScreen && (
        <Animated.View style={{ opacity: goalOpacity, width: wp(84), marginTop: scale(14) }}>
          <PressableScale
            style={styles.goalCard}
            onPress={() => { setGoalInput(dailyGoal > 0 ? String(dailyGoal) : ''); setGoalModal(true); }}
          >
            <View style={styles.goalLeft}>
              <Ionicons name="flag" size={scale(16)} color={dailyGoal > 0 ? COLORS.primary : COLORS.textMuted} />
              <View style={{ marginLeft: scale(8) }}>
                <Text style={styles.goalTitle}>{dailyGoal > 0 ? `Meta: ${dailyGoal} págs./día` : 'Configurar meta diaria'}</Text>
                {dailyGoal > 0 && <Text style={styles.goalSub}>{Math.round(goalPercent)}% completado hoy</Text>}
              </View>
            </View>
            {dailyGoal > 0 ? (
              <ProgressRing percent={goalPercent} size={scale(38)} strokeWidth={scale(4)} color={goalPercent >= 100 ? COLORS.gold : COLORS.primary} duration={900}>
                <Text style={[styles.goalRingText, goalPercent >= 100 && { color: COLORS.gold }]}>{Math.round(goalPercent)}%</Text>
              </ProgressRing>
            ) : (
              <Ionicons name="add-circle-outline" size={scale(20)} color={COLORS.textMuted} />
            )}
          </PressableScale>
        </Animated.View>
      )}

      {/* Botones de navegación */}
      <Animated.View style={[
        styles.navRow,
        isWatchScreen && styles.navRowWatch,
        { opacity: navOpacity },
      ]}>
        <PressableScale
          style={[styles.navBtn, isWatchScreen && styles.navBtnWatch]}
          onPress={() => navigation.navigate('BookList')}
        >
          <Ionicons name="library-outline" size={scale(isWatchScreen ? 16 : 20)} color={COLORS.text} />
          {!isWatchScreen && <Text style={styles.navLabel}>Libros</Text>}
        </PressableScale>

        <PressableScale
          style={[styles.navBtn, styles.navBtnPrimary, isWatchScreen && styles.navBtnWatch]}
          onPress={() => navigation.navigate('AddBook')}
        >
          <Ionicons name="add" size={scale(isWatchScreen ? 18 : 22)} color={COLORS.background} />
          {!isWatchScreen && <Text style={[styles.navLabel, { color: COLORS.background }]}>Agregar</Text>}
        </PressableScale>

        <PressableScale
          style={[styles.navBtn, isWatchScreen && styles.navBtnWatch]}
          onPress={() => navigation.navigate('ProgressChart')}
        >
          <Ionicons name="bar-chart-outline" size={scale(isWatchScreen ? 16 : 20)} color={COLORS.text} />
          {!isWatchScreen && <Text style={styles.navLabel}>Estadísticas</Text>}
        </PressableScale>
      </Animated.View>

      {/* Modal meta diaria */}
      <Modal visible={goalModal} transparent animationType="fade" onRequestClose={() => setGoalModal(false)}>
        <KeyboardAvoidingView style={styles.modalOverlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Ionicons name="flag" size={scale(20)} color={COLORS.primary} />
              <Text style={styles.modalTitle}>Meta diaria</Text>
            </View>
            <Text style={styles.modalSub}>¿Cuántas páginas quieres leer por día?</Text>
            <TextInput
              style={styles.modalInput}
              value={goalInput}
              onChangeText={setGoalInput}
              keyboardType="numeric"
              maxLength={5}
              placeholder="Ej. 30"
              placeholderTextColor={COLORS.textMuted}
              autoFocus
              textAlign="center"
              returnKeyType="done"
              onSubmitEditing={handleSaveGoal}
            />
            <View style={styles.modalBtns}>
              <TouchableOpacity style={styles.modalBtnCancel} onPress={() => setGoalModal(false)}>
                <Text style={styles.modalBtnCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <PressableScale style={styles.modalBtnSave} onPress={handleSaveGoal}>
                <Ionicons name="checkmark" size={scale(16)} color={COLORS.background} />
                <Text style={styles.modalBtnSaveText}> Guardar</Text>
              </PressableScale>
            </View>
            {dailyGoal > 0 && (
              <TouchableOpacity style={styles.modalBtnRemove} onPress={async () => { await updateDailyGoal(0); setGoalModal(false); }}>
                <Ionicons name="trash-outline" size={scale(13)} color={COLORS.danger} />
                <Text style={styles.modalBtnRemoveText}> Eliminar meta</Text>
              </TouchableOpacity>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center', paddingHorizontal: isWatchScreen ? safeCircularPad : 0 },
  watchOuter: { alignItems: 'center', justifyContent: 'center' },
  glowSvg: { position: 'absolute', zIndex: 0 },
  bezel: { backgroundColor: COLORS.surface, borderWidth: scale(2), borderColor: COLORS.borderLight, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: scale(20), elevation: 14 },
  watchFace: { backgroundColor: COLORS.watchFace, alignItems: 'center', justifyContent: 'center' },
  ringContent: { alignItems: 'center', justifyContent: 'center' },
  timeText: { color: COLORS.textSecondary, fontSize: fontScale(12), letterSpacing: 2, marginBottom: 2 },
  bigPercent: { color: COLORS.text, fontWeight: '900' },
  progressLabel: { color: COLORS.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: scale(4) },
  activeBookTitle: { color: COLORS.textSecondary, fontSize: fontScale(11), maxWidth: RING_SIZE * 0.55, textAlign: 'center' },
  // Chips telefono
  statsRow: { position: 'absolute', bottom: WATCH_SIZE * 0.08, flexDirection: 'row', gap: scale(5) },
  statChip: { alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: scale(10), paddingHorizontal: scale(7), paddingVertical: scale(4), borderWidth: 1, borderColor: COLORS.border, gap: scale(1) },
  statChipGold: { borderColor: COLORS.gold + '33' },
  statChipAccent: { borderColor: COLORS.accent + '33' },
  statChipValue: { color: COLORS.text, fontSize: fontScale(13), fontWeight: '800' },
  statChipLabel: { color: COLORS.textSecondary, fontSize: fontScale(9) },
  // Stats compactos Wear OS
  watchStatsRow: { position: 'absolute', bottom: WATCH_SIZE * 0.08 },
  watchStatText: { color: COLORS.textSecondary, fontSize: fontScale(9), textAlign: 'center' },
  // Meta diaria
  goalCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: scale(14), borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: scale(14), paddingVertical: scale(10) },
  goalLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  goalTitle: { color: COLORS.text, fontSize: fontScale(13), fontWeight: '600', marginLeft: scale(8) },
  goalSub: { color: COLORS.textSecondary, fontSize: fontScale(11), marginTop: 1, marginLeft: scale(8) },
  goalRingText: { color: COLORS.primary, fontSize: fontScale(9), fontWeight: '800' },
  // Navegación
  navRow: { flexDirection: 'row', marginTop: scale(16), gap: scale(10) },
  navRowWatch: { marginTop: scale(10), gap: scale(8) },
  navBtn: { alignItems: 'center', paddingVertical: scale(10), paddingHorizontal: scale(14), borderRadius: scale(18), backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight, minWidth: scale(65), gap: scale(4) },
  navBtnWatch: { paddingVertical: scale(8), paddingHorizontal: scale(10), minWidth: scale(42), borderRadius: scale(22) },
  navBtnPrimary: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  navLabel: { color: COLORS.text, fontSize: fontScale(11), fontWeight: '600' },
  // Modal
  modalOverlay: { flex: 1, backgroundColor: '#000000BB', alignItems: 'center', justifyContent: 'center' },
  modalCard: { backgroundColor: COLORS.surface, borderRadius: scale(20), borderWidth: 1, borderColor: COLORS.borderLight, padding: scale(24), width: wp(80), alignItems: 'center' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', gap: scale(8), marginBottom: scale(6) },
  modalTitle: { color: COLORS.text, fontSize: fontScale(18), fontWeight: '800' },
  modalSub: { color: COLORS.textSecondary, fontSize: fontScale(13), marginBottom: scale(18), textAlign: 'center' },
  modalInput: { width: '100%', backgroundColor: COLORS.watchFace, borderWidth: 1.5, borderColor: COLORS.primary + '88', borderRadius: scale(12), paddingVertical: scale(12), color: COLORS.primary, fontSize: fontScale(32), fontWeight: '900', letterSpacing: 2, marginBottom: scale(20) },
  modalBtns: { flexDirection: 'row', gap: scale(10), width: '100%' },
  modalBtnCancel: { flex: 1, paddingVertical: scale(12), borderRadius: scale(12), backgroundColor: COLORS.watchFace, alignItems: 'center', borderWidth: 1, borderColor: COLORS.borderLight },
  modalBtnCancelText: { color: COLORS.textSecondary, fontSize: fontScale(14), fontWeight: '600' },
  modalBtnSave: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: scale(12), borderRadius: scale(12), backgroundColor: COLORS.primary },
  modalBtnSaveText: { color: COLORS.background, fontSize: fontScale(14), fontWeight: '800' },
  modalBtnRemove: { flexDirection: 'row', alignItems: 'center', marginTop: scale(14) },
  modalBtnRemoveText: { color: COLORS.danger, fontSize: fontScale(13) },
});
