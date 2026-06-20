// UpdateProgressScreen v2.1 — Responsivo
import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  StatusBar, KeyboardAvoidingView, Platform,
} from 'react-native';
import COLORS from '../constants/colors';
import { updateProgress, calculateProgress } from '../utils/helpers';
import { loadData } from '../utils/storage';
import ProgressRing from '../components/ProgressRing';
import { scale, fontScale, wp, SCREEN } from '../utils/responsive';

const isSmall = SCREEN.width < 300;
const RING_SIZE = Math.min(wp(42), 160);

export default function UpdateProgressScreen({ navigation, route }) {
  const { book } = route.params;
  const [pagesInput, setPagesInput] = useState(book.pagesRead.toString());
  const [loading, setLoading] = useState(false);

  const parsedPages = parseInt(pagesInput, 10) || 0;
  const currentPercent = calculateProgress(parsedPages, book.totalPages);
  const isComplete = currentPercent >= 100;
  const ringColor = isComplete ? COLORS.gold : COLORS.primary;

  const handleUpdate = async () => {
    if (loading) return;
    setLoading(true);
    const allBooks = await loadData();
    const updated = await updateProgress(book.id, pagesInput, allBooks);
    setLoading(false);
    if (updated) navigation.goBack();
  };

  const quickAdd = (amount) => {
    const newVal = Math.min(parsedPages + amount, book.totalPages);
    setPagesInput(newVal.toString());
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.content}>

        <ProgressRing percent={currentPercent} size={RING_SIZE} strokeWidth={scale(9)} color={ringColor}>
          <View style={styles.ringInner}>
            {isComplete ? (
              <>
                <Text style={{ fontSize: scale(24), color: COLORS.gold }}>✓</Text>
                <Text style={[styles.ringPercent, { color: COLORS.gold, fontSize: fontScale(isSmall ? 18 : 28) }]}>100%</Text>
              </>
            ) : (
              <>
                <Text style={[styles.ringPercent, { fontSize: fontScale(isSmall ? 18 : 28) }]}>{currentPercent}%</Text>
                <Text style={styles.ringLabel}>leído</Text>
              </>
            )}
          </View>
        </ProgressRing>

        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>

        <View style={styles.divider} />

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
        <Text style={styles.totalHint}>de {book.totalPages} páginas en total</Text>

        {/* Botones rápidos — se muestran compactos en pantallas pequeñas */}
        <View style={styles.quickRow}>
          {(isSmall ? [10, 50] : [10, 25, 50]).map((n) => (
            <TouchableOpacity key={n} style={styles.quickBtn} onPress={() => quickAdd(n)} disabled={parsedPages >= book.totalPages}>
              <Text style={styles.quickBtnText}>+{n}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.quickBtn} onPress={() => setPagesInput(book.totalPages.toString())}>
            <Text style={styles.quickBtnText}>Max</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.updateBtn, loading && styles.btnDisabled]} onPress={handleUpdate} disabled={loading} activeOpacity={0.85}>
          <Text style={styles.updateBtnText}>
            {loading ? 'Guardando...' : isComplete ? '¡Marcar completado!' : 'Guardar progreso'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: scale(24), paddingTop: scale(24) },
  ringInner: { alignItems: 'center', justifyContent: 'center' },
  ringPercent: { color: COLORS.text, fontWeight: '900' },
  ringLabel: { color: COLORS.textSecondary, fontSize: fontScale(11), letterSpacing: 1, marginTop: 2 },
  bookTitle: { color: COLORS.text, fontSize: fontScale(17), fontWeight: '800', textAlign: 'center', marginTop: scale(14), marginBottom: 3, maxWidth: wp(80) },
  bookAuthor: { color: COLORS.textSecondary, fontSize: fontScale(12), marginBottom: scale(14) },
  divider: { width: '100%', height: 1, backgroundColor: COLORS.border, marginBottom: scale(16) },
  fieldLabel: { color: COLORS.textSecondary, fontSize: fontScale(11), fontWeight: '700', letterSpacing: 1.4, marginBottom: scale(6) },
  input: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '88',
    borderRadius: scale(14),
    paddingVertical: scale(12),
    color: COLORS.primary,
    fontSize: fontScale(34),
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: scale(5),
    letterSpacing: 2,
  },
  inputComplete: { borderColor: COLORS.gold + '88', color: COLORS.gold },
  totalHint: { color: COLORS.textSecondary, fontSize: fontScale(12), marginBottom: scale(14) },
  quickRow: { flexDirection: 'row', gap: scale(8), marginBottom: scale(18) },
  quickBtn: {
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: scale(10),
    paddingHorizontal: scale(14),
    paddingVertical: scale(8),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  quickBtnText: { color: COLORS.text, fontSize: fontScale(13), fontWeight: '700' },
  updateBtn: { width: '100%', backgroundColor: COLORS.primary, borderRadius: scale(14), paddingVertical: scale(15), alignItems: 'center', marginBottom: scale(10) },
  btnDisabled: { opacity: 0.5 },
  updateBtnText: { color: COLORS.background, fontSize: fontScale(14), fontWeight: '800' },
  cancelBtn: { paddingVertical: scale(8) },
  cancelText: { color: COLORS.textSecondary, fontSize: fontScale(13) },
});
