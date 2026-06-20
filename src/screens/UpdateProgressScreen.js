// UpdateProgressScreen v3 — Actualizar progreso + editar notas del libro
import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';
import { updateProgress, calculateProgress } from '../utils/helpers';
import { loadData } from '../utils/storage';
import ProgressRing from '../components/ProgressRing';
import { scale, fontScale, wp, SCREEN } from '../utils/responsive';

const isSmall   = SCREEN.width < 300;
const RING_SIZE = Math.min(wp(40), 150);

export default function UpdateProgressScreen({ navigation, route }) {
  const { book }    = route.params;
  const [pagesInput, setPagesInput] = useState(book.pagesRead.toString());
  const [notes, setNotes]           = useState(book.notes || '');
  const [showNotes, setShowNotes]   = useState(false);
  const [loading, setLoading]       = useState(false);

  const parsedPages    = parseInt(pagesInput, 10) || 0;
  const currentPercent = calculateProgress(parsedPages, book.totalPages);
  const isComplete     = currentPercent >= 100;
  const ringColor      = isComplete ? COLORS.gold : COLORS.primary;

  const handleUpdate = async () => {
    if (loading) return;
    setLoading(true);
    const allBooks = await loadData();
    const updated  = await updateProgress(book.id, pagesInput, allBooks, notes);
    setLoading(false);
    if (updated) navigation.goBack();
  };

  const quickAdd = (amount) => setPagesInput(Math.min(parsedPages + amount, book.totalPages).toString());

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Anillo de progreso */}
        <View style={styles.ringWrap}>
          <ProgressRing percent={currentPercent} size={RING_SIZE} strokeWidth={scale(9)} color={ringColor}>
            <View style={styles.ringInner}>
              {isComplete ? (
                <>
                  <Ionicons name="checkmark-circle" size={scale(26)} color={COLORS.gold} />
                  <Text style={[styles.ringPercent, { color: COLORS.gold, fontSize: fontScale(isSmall ? 18 : 24) }]}>100%</Text>
                </>
              ) : (
                <>
                  <Text style={[styles.ringPercent, { fontSize: fontScale(isSmall ? 18 : 28) }]}>{currentPercent}%</Text>
                  <Text style={styles.ringLabel}>leído</Text>
                </>
              )}
            </View>
          </ProgressRing>
        </View>

        {/* Info del libro */}
        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
        <View style={styles.authorRow}>
          <Ionicons name="person-outline" size={scale(13)} color={COLORS.textSecondary} />
          <Text style={styles.bookAuthor}> {book.author}</Text>
        </View>

        <View style={styles.divider} />

        {/* Campo de páginas */}
        <Text style={styles.fieldLabel}>PÁGINAS LEÍDAS</Text>
        <TextInput
          style={[styles.input, isComplete && styles.inputComplete]}
          value={pagesInput}
          onChangeText={setPagesInput}
          keyboardType="numeric"
          maxLength={6}
          selectTextOnFocus
          returnKeyType="done"
          onSubmitEditing={handleUpdate}
        />
        <View style={styles.hintRow}>
          <Ionicons name="book-outline" size={scale(12)} color={COLORS.textSecondary} />
          <Text style={styles.totalHint}> de {book.totalPages} páginas en total</Text>
        </View>

        {/* Botones rápidos */}
        <View style={styles.quickRow}>
          {(isSmall ? [10, 50] : [10, 25, 50]).map((n) => (
            <TouchableOpacity key={n} style={styles.quickBtn} onPress={() => quickAdd(n)} disabled={parsedPages >= book.totalPages}>
              <Text style={styles.quickBtnText}>+{n}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.quickBtn, styles.quickBtnMax]} onPress={() => setPagesInput(book.totalPages.toString())}>
            <Ionicons name="flag" size={scale(12)} color={COLORS.primary} />
            <Text style={[styles.quickBtnText, { color: COLORS.primary }]}> Max</Text>
          </TouchableOpacity>
        </View>

        {/* Sección de notas — expandible */}
        <TouchableOpacity style={styles.notesToggle} onPress={() => setShowNotes((v) => !v)}>
          <Ionicons name="document-text-outline" size={scale(15)} color={COLORS.accent} />
          <Text style={styles.notesToggleText}> Notas de lectura</Text>
          <Ionicons name={showNotes ? 'chevron-up' : 'chevron-down'} size={scale(14)} color={COLORS.textSecondary} style={{ marginLeft: 'auto' }} />
        </TouchableOpacity>

        {showNotes && (
          <View style={styles.notesBox}>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Reflexiones, frases favoritas, cómo te va con el libro..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={4}
              maxLength={300}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{notes.length}/300</Text>
          </View>
        )}

        {/* Botón guardar */}
        <TouchableOpacity style={[styles.updateBtn, loading && styles.btnDisabled]} onPress={handleUpdate} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <Ionicons name="hourglass-outline" size={scale(18)} color={COLORS.background} />
            : <Ionicons name={isComplete ? 'trophy' : 'save-outline'} size={scale(18)} color={COLORS.background} />
          }
          <Text style={styles.updateBtnText}>
            {' '}{loading ? 'Guardando...' : isComplete ? '¡Marcar completado!' : 'Guardar progreso'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back-outline" size={scale(14)} color={COLORS.textSecondary} />
          <Text style={styles.cancelText}> Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { flexGrow: 1, alignItems: 'center', paddingHorizontal: scale(24), paddingTop: scale(24), paddingBottom: scale(40) },
  ringWrap: { marginBottom: scale(14) },
  ringInner: { alignItems: 'center', justifyContent: 'center' },
  ringPercent: { color: COLORS.text, fontWeight: '900' },
  ringLabel: { color: COLORS.textSecondary, fontSize: fontScale(11), letterSpacing: 1, marginTop: 2 },
  bookTitle: { color: COLORS.text, fontSize: fontScale(17), fontWeight: '800', textAlign: 'center', marginBottom: scale(4), maxWidth: wp(80) },
  authorRow: { flexDirection: 'row', alignItems: 'center', marginBottom: scale(16) },
  bookAuthor: { color: COLORS.textSecondary, fontSize: fontScale(12) },
  divider: { width: '100%', height: 1, backgroundColor: COLORS.border, marginBottom: scale(16) },
  fieldLabel: { color: COLORS.textSecondary, fontSize: fontScale(11), fontWeight: '700', letterSpacing: 1.4, marginBottom: scale(6), alignSelf: 'flex-start' },
  input: { width: '100%', backgroundColor: COLORS.surface, borderWidth: 1.5, borderColor: COLORS.primary + '88', borderRadius: scale(14), paddingVertical: scale(12), color: COLORS.primary, fontSize: fontScale(34), fontWeight: '900', textAlign: 'center', marginBottom: scale(5), letterSpacing: 2 },
  inputComplete: { borderColor: COLORS.gold + '88', color: COLORS.gold },
  hintRow: { flexDirection: 'row', alignItems: 'center', marginBottom: scale(14) },
  totalHint: { color: COLORS.textSecondary, fontSize: fontScale(12) },
  quickRow: { flexDirection: 'row', gap: scale(8), marginBottom: scale(16) },
  quickBtn: { backgroundColor: COLORS.surfaceHigh, borderRadius: scale(10), paddingHorizontal: scale(14), paddingVertical: scale(8), borderWidth: 1, borderColor: COLORS.borderLight },
  quickBtnMax: { flexDirection: 'row', alignItems: 'center', borderColor: COLORS.primary + '55' },
  quickBtnText: { color: COLORS.text, fontSize: fontScale(13), fontWeight: '700' },

  // Sección de notas expandible
  notesToggle: { flexDirection: 'row', alignItems: 'center', width: '100%', backgroundColor: COLORS.surface, borderRadius: scale(12), paddingHorizontal: scale(14), paddingVertical: scale(12), marginBottom: scale(8), borderWidth: 1, borderColor: COLORS.accent + '44' },
  notesToggleText: { color: COLORS.accent, fontSize: fontScale(14), fontWeight: '600' },
  notesBox: { width: '100%', marginBottom: scale(14) },
  notesInput: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.borderLight, borderRadius: scale(12), paddingHorizontal: scale(14), paddingVertical: scale(12), color: COLORS.text, fontSize: fontScale(14), minHeight: scale(100) },
  charCount: { color: COLORS.textMuted, fontSize: fontScale(11), textAlign: 'right', marginTop: scale(4) },

  updateBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: COLORS.primary, borderRadius: scale(14), paddingVertical: scale(15), marginBottom: scale(10) },
  btnDisabled: { opacity: 0.5 },
  updateBtnText: { color: COLORS.background, fontSize: fontScale(14), fontWeight: '800' },
  cancelBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: scale(8) },
  cancelText: { color: COLORS.textSecondary, fontSize: fontScale(13) },
});
