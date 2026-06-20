// AddBookScreen v2 — Formulario premium para registrar un nuevo libro
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import COLORS from '../constants/colors';
import { registerBook } from '../utils/helpers';

/**
 * AddBookScreen v2 — Formulario con diseño premium y navegación con teclado.
 * Los campos con refs permiten avanzar al siguiente con el botón "siguiente" del teclado.
 */
export default function AddBookScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [loading, setLoading] = useState(false);
  // Refs para enfocar el siguiente campo al presionar "siguiente" en el teclado
  const authorRef = useRef(null);
  const pagesRef = useRef(null);

  const handleSave = async () => {
    if (loading) return;
    setLoading(true);
    const newBook = await registerBook(title, author, totalPages);
    setLoading(false);
    if (newBook) {
      setTitle('');
      setAuthor('');
      setTotalPages('');
      navigation.goBack();
    }
  };

  // Calcular si el formulario está completo para habilitar el botón
  const isFormValid = title.trim() && author.trim() && totalPages.trim();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado decorativo */}
        <View style={styles.topRow}>
          <View style={styles.iconCircle}>
            <Text style={styles.iconText}>📖</Text>
          </View>
          <View>
            <Text style={styles.screenTitle}>Nuevo Libro</Text>
            <Text style={styles.screenSub}>Completa la información</Text>
          </View>
        </View>

        {/* Separador */}
        <View style={styles.divider} />

        {/* Campo: Título */}
        <Text style={styles.label}>TÍTULO</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. El Principito"
          placeholderTextColor={COLORS.textMuted}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
          returnKeyType="next"
          onSubmitEditing={() => authorRef.current?.focus()}
          blurOnSubmit={false}
        />

        {/* Campo: Autor */}
        <Text style={styles.label}>AUTOR</Text>
        <TextInput
          ref={authorRef}
          style={styles.input}
          placeholder="Ej. Antoine de Saint-Exupéry"
          placeholderTextColor={COLORS.textMuted}
          value={author}
          onChangeText={setAuthor}
          maxLength={80}
          returnKeyType="next"
          onSubmitEditing={() => pagesRef.current?.focus()}
          blurOnSubmit={false}
        />

        {/* Campo: Páginas totales */}
        <Text style={styles.label}>TOTAL DE PÁGINAS</Text>
        <TextInput
          ref={pagesRef}
          style={[styles.input, styles.inputLarge]}
          placeholder="0"
          placeholderTextColor={COLORS.textMuted}
          value={totalPages}
          onChangeText={setTotalPages}
          keyboardType="numeric"
          maxLength={6}
          returnKeyType="done"
          onSubmitEditing={handleSave}
          textAlign="center"
        />

        {/* Botón guardar — deshabilitado si el formulario no está completo */}
        <TouchableOpacity
          style={[
            styles.saveBtn,
            (!isFormValid || loading) && styles.saveBtnDisabled,
          ]}
          onPress={handleSave}
          disabled={!isFormValid || loading}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {loading ? 'Guardando...' : 'Registrar libro'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Cancelar</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 48,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.primary + '66',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: { fontSize: 24 },
  screenTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
  },
  screenSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginBottom: 24,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 20,
  },
  // Campo de páginas con texto más grande para énfasis
  inputLarge: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    paddingVertical: 16,
    letterSpacing: 2,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  saveBtnDisabled: {
    backgroundColor: COLORS.surfaceHigh,
  },
  saveBtnText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  cancelBtn: { alignSelf: 'center', paddingVertical: 8 },
  cancelText: { color: COLORS.textSecondary, fontSize: 14 },
});
