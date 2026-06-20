// UpdateProgressScreen v2 — Actualización de progreso con anillo SVG en tiempo real
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import COLORS from '../constants/colors';
import { updateProgress, calculateProgress } from '../utils/helpers';
import { loadData } from '../utils/storage';
import ProgressRing from '../components/ProgressRing';

const { width } = Dimensions.get('window');
const RING_SIZE = 160;

/**
 * UpdateProgressScreen v2 — Muestra un anillo SVG que se actualiza en tiempo real
 * mientras el usuario escribe el nuevo número de páginas.
 */
export default function UpdateProgressScreen({ navigation, route }) {
  const { book } = route.params;
  const [pagesInput, setPagesInput] = useState(book.pagesRead.toString());
  const [loading, setLoading] = useState(false);

  const parsedPages = parseInt(pagesInput, 10) || 0;
  const currentPercent = calculateProgress(parsedPages, book.totalPages);
  const isComplete = currentPercent >= 100;

  // Color del anillo según estado: dorado si completo, verde si en progreso
  const ringColor = isComplete ? COLORS.gold : COLORS.primary;

  const handleUpdate = async () => {
    if (loading) return;
    setLoading(true);
    const allBooks = await loadData();
    const updated = await updateProgress(book.id, pagesInput, allBooks);
    setLoading(false);
    if (updated) navigation.goBack();
  };

  // Accesos rápidos: +10, +25, +50 páginas
  const quickAdd = (amount) => {
    const newVal = Math.min(parsedPages + amount, book.totalPages);
    setPagesInput(newVal.toString());
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.content}>
        {/* Anillo de progreso con porcentaje actualizado en tiempo real */}
        <ProgressRing percent={currentPercent} size={RING_SIZE} strokeWidth={9} color={ringColor}>
          <View style={styles.ringInner}>
            {isComplete ? (
              <>
                <Text style={styles.completeIcon}>✓</Text>
                <Text style={[styles.ringPercent, { color: COLORS.gold }]}>100%</Text>
              </>
            ) : (
              <>
                <Text style={styles.ringPercent}>{currentPercent}%</Text>
                <Text style={styles.ringLabel}>leído</Text>
              </>
            )}
          </View>
        </ProgressRing>

        {/* Título y autor */}
        <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>

        {/* Separador */}
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
        <Text style={styles.totalHint}>de {book.totalPages} páginas en total</Text>

        {/* Botones de adición rápida */}
        <View style={styles.quickRow}>
          {[10, 25, 50].map((n) => (
            <TouchableOpacity
              key={n}
              style={styles.quickBtn}
              onPress={() => quickAdd(n)}
              disabled={parsedPages >= book.totalPages}
            >
              <Text style={styles.quickBtnText}>+{n}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => setPagesInput(book.totalPages.toString())}
          >
            <Text style={styles.quickBtnText}>Max</Text>
          </TouchableOpacity>
        </View>

        {/* Botón guardar */}
        <TouchableOpacity
          style={[styles.updateBtn, loading && styles.btnDisabled]}
          onPress={handleUpdate}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.updateBtnText}>
            {loading ? 'Guardando...' : isComplete ? '¡Marcar como completado!' : 'Guardar progreso'}
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
  },
  ringInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercent: {
    color: COLORS.text,
    fontSize: 32,
    fontWeight: '900',
  },
  ringLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    letterSpacing: 1,
    marginTop: 2,
  },
  completeIcon: {
    fontSize: 28,
    color: COLORS.gold,
  },
  bookTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 18,
    marginBottom: 3,
    maxWidth: width - 60,
  },
  bookAuthor: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 18,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 20,
  },
  fieldLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '88',
    borderRadius: 14,
    paddingVertical: 14,
    color: COLORS.primary,
    fontSize: 36,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 2,
  },
  inputComplete: {
    borderColor: COLORS.gold + '88',
    color: COLORS.gold,
  },
  totalHint: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 16,
  },
  // Botones rápidos de +10, +25, +50, Max
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  quickBtn: {
    backgroundColor: COLORS.surfaceHigh,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  quickBtnText: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  updateBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnDisabled: { opacity: 0.5 },
  updateBtnText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '800',
  },
  cancelBtn: { paddingVertical: 8 },
  cancelText: { color: COLORS.textSecondary, fontSize: 14 },
});
