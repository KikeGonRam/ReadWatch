// Pantalla para registrar un nuevo libro en ReadWatch
// Formulario estilo smartwatch con campos mínimos y validación completa
import React, { useState } from 'react';
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
 * AddBookScreen — Formulario para registrar un nuevo libro.
 * Valida campos vacíos y páginas inválidas antes de guardar.
 * Regresa a la pantalla anterior tras registrar exitosamente.
 *
 * @param {object} navigation - Objeto de navegación de React Navigation
 */
export default function AddBookScreen({ navigation }) {
  // Estado de los campos del formulario
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [totalPages, setTotalPages] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Maneja el guardado del libro.
   * Llama a registerBook que incluye todas las validaciones.
   * Navega atrás solo si el registro fue exitoso.
   */
  const handleSave = async () => {
    if (loading) return;
    setLoading(true);

    // registerBook valida y muestra Alerts de error si corresponde
    const newBook = await registerBook(title, author, totalPages);

    setLoading(false);

    // Solo navegar si el libro fue creado exitosamente
    if (newBook) {
      // Limpiar campos y volver a la lista
      setTitle('');
      setAuthor('');
      setTotalPages('');
      navigation.goBack();
    }
  };

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
        {/* Ícono decorativo tipo reloj */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconText}>📖</Text>
        </View>

        <Text style={styles.screenTitle}>Nuevo Libro</Text>
        <Text style={styles.screenSubtitle}>Completa los datos del libro</Text>

        {/* Campo: Título */}
        <Text style={styles.fieldLabel}>Título</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. El Principito"
          placeholderTextColor={COLORS.textSecondary}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
          returnKeyType="next"
        />

        {/* Campo: Autor */}
        <Text style={styles.fieldLabel}>Autor</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. Antoine de Saint-Exupéry"
          placeholderTextColor={COLORS.textSecondary}
          value={author}
          onChangeText={setAuthor}
          maxLength={80}
          returnKeyType="next"
        />

        {/* Campo: Total de páginas — solo numérico */}
        <Text style={styles.fieldLabel}>Total de páginas</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 96"
          placeholderTextColor={COLORS.textSecondary}
          value={totalPages}
          onChangeText={setTotalPages}
          // Forzar teclado numérico para evitar texto no numérico
          keyboardType="numeric"
          maxLength={6}
          returnKeyType="done"
          onSubmitEditing={handleSave}
        />

        {/* Botón guardar */}
        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>
            {loading ? 'Guardando...' : 'Guardar libro'}
          </Text>
        </TouchableOpacity>

        {/* Botón cancelar */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.cancelBtnText}>Cancelar</Text>
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
    paddingHorizontal: 28,
    paddingTop: 24,
    paddingBottom: 40,
    alignItems: 'center',
  },
  // Círculo decorativo con ícono en la parte superior
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: COLORS.watchFace,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  iconText: {
    fontSize: 30,
  },
  screenTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  screenSubtitle: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 28,
  },
  fieldLabel: {
    alignSelf: 'flex-start',
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 4,
  },
  // Campo de texto con estilo oscuro coherente con la paleta
  input: {
    width: '100%',
    backgroundColor: COLORS.watchFace,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: COLORS.text,
    fontSize: 15,
    marginBottom: 16,
  },
  // Botón principal de guardado con color primario verde
  saveBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  saveBtnDisabled: {
    opacity: 0.5,
  },
  saveBtnText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cancelBtn: {
    paddingVertical: 10,
  },
  cancelBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
