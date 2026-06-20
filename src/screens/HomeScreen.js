// HomeScreen v3 — Meta diaria de páginas + modal para configurarla
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, StatusBar,
  Modal, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
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
  const { books, dailyGoal, updateDailyGoal } = useBooks();
  const [goalModal, setGoalModal] = useState(false);
  const [goalInput, setGoalInput] = useState('');

  // Progreso global
  const avgProgress =
    books.length > 0
      ? parseFloat(
          (books.reduce((acc, b) => acc + calculateProgress(b.pagesRead, b.totalPages), 0) / books.length).toFixed(1)
        )
      : 0;

  const completedCount = books.filter((b) => calculateProgress(b.pagesRead, b.totalPages) >= 100).length;
  const totalPagesRead = books.reduce((acc, b) => acc + b.pagesRead, 0);

  // Libro más activo (mayor progreso sin completar)
  const activeBook = books
    .filter((b) => calculateProgress(b.pagesRead, b.totalPages) < 100)
    .sort((a, b) => calculateProgress(b.pagesRead, b.totalPages) - calculateProgress(a.pagesRead, a.totalPages))[0];

  const now = new Date();
  const timeStr = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false });

  // Progreso de meta diaria (simulado como total de páginas leídas vs meta)
  const goalPercent = dailyGoal > 0 ? Math.min((totalPagesRead / dailyGoal) * 100, 100) : 0;

  const handleSaveGoal = async () => {
    const val = parseInt(goalInput, 10);
    if (!isNaN(val) && val > 0) {
      await updateDailyGoal(val);
    }
    setGoalModal(false);
    setGoalInput('');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Caratula principal */}
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
      </View>

      {/* Meta diaria — solo si hay meta configurada o pantalla grande */}
      {!isSmall && (
        <TouchableOpacity style={styles.goalCard} onPress={() => { setGoalInput(dailyGoal > 0 ? String(dailyGoal) : ''); setGoalModal(true); }} activeOpacity={0.8}>
          <View style={styles.goalLeft}>
            <Ionicons name="flag" size={scale(16)} color={dailyGoal > 0 ? COLORS.primary : COLORS.textMuted} />
            <View style={{ marginLeft: scale(8) }}>
              <Text style={styles.goalTitle}>
                {dailyGoal > 0 ? `Meta: ${dailyGoal} páginas/día` : 'Configurar meta diaria'}
              </Text>
              {dailyGoal > 0 && (
                <Text style={styles.goalSub}>{Math.round(goalPercent)}% completado hoy</Text>
              )}
            </View>
          </View>
          {dailyGoal > 0 ? (
            <View style={styles.goalRingWrap}>
              <ProgressRing percent={goalPercent} size={scale(38)} strokeWidth={scale(4)} color={goalPercent >= 100 ? COLORS.gold : COLORS.primary}>
                <Text style={[styles.goalRingText, goalPercent >= 100 && { color: COLORS.gold }]}>
                  {Math.round(goalPercent)}%
                </Text>
              </ProgressRing>
            </View>
          ) : (
            <Ionicons name="add-circle-outline" size={scale(20)} color={COLORS.textMuted} />
          )}
        </TouchableOpacity>
      )}

      {/* Botones de navegación */}
      <View style={[styles.navRow, isSmall && styles.navRowSmall]}>
        <TouchableOpacity style={[styles.navBtn, isSmall && styles.navBtnSmall]} onPress={() => navigation.navigate('BookList')} activeOpacity={0.75}>
          <Ionicons name="library-outline" size={scale(isSmall ? 18 : 20)} color={COLORS.text} />
          {!isSmall && <Text style={styles.navLabel}>Libros</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary, isSmall && styles.navBtnSmall]} onPress={() => navigation.navigate('AddBook')} activeOpacity={0.85}>
          <Ionicons name="add" size={scale(isSmall ? 20 : 22)} color={COLORS.background} />
          {!isSmall && <Text style={[styles.navLabel, { color: COLORS.background }]}>Agregar</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={[styles.navBtn, isSmall && styles.navBtnSmall]} onPress={() => navigation.navigate('ProgressChart')} activeOpacity={0.75}>
          <Ionicons name="bar-chart-outline" size={scale(isSmall ? 18 : 20)} color={COLORS.text} />
          {!isSmall && <Text style={styles.navLabel}>Estadísticas</Text>}
        </TouchableOpacity>
      </View>

      {/* Modal para configurar meta diaria */}
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
              <TouchableOpacity style={styles.modalBtnSave} onPress={handleSaveGoal}>
                <Ionicons name="checkmark" size={scale(16)} color={COLORS.background} />
                <Text style={styles.modalBtnSaveText}> Guardar</Text>
              </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center', justifyContent: 'center' },
  watchOuter: { alignItems: 'center' },
  bezel: { backgroundColor: COLORS.surface, borderWidth: scale(2), borderColor: COLORS.borderLight, alignItems: 'center', justifyContent: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.18, shadowRadius: scale(20), elevation: 14 },
  watchFace: { backgroundColor: COLORS.watchFace, alignItems: 'center', justifyContent: 'center' },
  ringContent: { alignItems: 'center', justifyContent: 'center' },
  timeText: { color: COLORS.textSecondary, fontSize: fontScale(12), letterSpacing: 2, marginBottom: 2 },
  bigPercent: { color: COLORS.text, fontWeight: '900' },
  progressLabel: { color: COLORS.primary, letterSpacing: 2, textTransform: 'uppercase', marginBottom: scale(4) },
  activeBookTitle: { color: COLORS.textSecondary, fontSize: fontScale(11), maxWidth: RING_SIZE * 0.55, textAlign: 'center' },
  statsRow: { position: 'absolute', bottom: WATCH_SIZE * 0.08, flexDirection: 'row', gap: scale(5) },
  statChip: { alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: scale(10), paddingHorizontal: scale(7), paddingVertical: scale(4), borderWidth: 1, borderColor: COLORS.border, gap: scale(1) },
  statChipGold: { borderColor: COLORS.gold + '33' },
  statChipAccent: { borderColor: COLORS.accent + '33' },
  statChipValue: { color: COLORS.text, fontSize: fontScale(13), fontWeight: '800' },
  statChipLabel: { color: COLORS.textSecondary, fontSize: fontScale(9) },

  // Tarjeta de meta diaria
  goalCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: COLORS.surface, borderRadius: scale(14), borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: scale(14), paddingVertical: scale(10), marginTop: scale(14), width: wp(84) },
  goalLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  goalTitle: { color: COLORS.text, fontSize: fontScale(13), fontWeight: '600' },
  goalSub: { color: COLORS.textSecondary, fontSize: fontScale(11), marginTop: 1 },
  goalRingWrap: { marginLeft: scale(8) },
  goalRingText: { color: COLORS.primary, fontSize: fontScale(9), fontWeight: '800' },

  navRow: { flexDirection: 'row', marginTop: scale(16), gap: scale(10) },
  navRowSmall: { marginTop: scale(10), gap: scale(6) },
  navBtn: { alignItems: 'center', paddingVertical: scale(10), paddingHorizontal: scale(14), borderRadius: scale(18), backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight, minWidth: scale(65), gap: scale(4) },
  navBtnSmall: { paddingVertical: scale(8), paddingHorizontal: scale(10), minWidth: scale(40), borderRadius: scale(20) },
  navBtnPrimary: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  navLabel: { color: COLORS.text, fontSize: fontScale(11), fontWeight: '600' },

  // Modal de meta diaria
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
