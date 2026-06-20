// Pantalla para actualizar el progreso de páginas leídas de un libro
// Recibe el libro por parámetros de navegación y valida el nuevo valor
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

const { width } = Dimensions.get('window');

/**
 * UpdateProgressScreen — Actualiza las páginas leídas de un libro.
 * Recibe el libro vía route.params.book y valida que el valor ingresado
 * no supere el total de páginas del libro.
 *
 * @param {object} navigation - Objeto de navegación de React Navigation
 * @param {object} route - Contiene route.params.book con el libro a actualizar
 */
export default function UpdateProgressScreen({ navigation, route }) {
  // Obtener el libro que fue pasado como parámetro desde BookListScreen
  const { book } = route.params;
  const [pagesInput, setPagesInput] = useState(book.pagesRead.toString());
  const [loading, setLoading] = useState(false);

  // Calcular el porcentaje actual para mostrarlo en tiempo real
  const currentPercent = calculateProgress(
    parseInt(pagesInput, 10) || 0,
    book.totalPages
  );

  /**
   * Maneja la actualización del progreso.
   * Carga todos los libros, llama a updateProgress y regresa si fue exitoso.
   */
  const handleUpdate = async () => {
    if (loading) return;
    setLoading(true);

    // Necesitamos cargar todos los libros para pasar el array completo a updateProgress
    const allBooks = await loadData();
    const updated = await updateProgress(book.id, pagesInput, allBooks);

    setLoading(false);

    // Si la actualización fue exitosa (no retornó null), volver a la lista
    if (updated) {
      navigation.goBack();
    }
  };

  // Calcular el ancho de la barra de progreso visual
  const barPercent = Math.min(currentPercent / 100, 1);
  const barWidth = (width - 80) * barPercent;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.content}>
        {/* Caratula circular mini mostrando el progreso actual */}
        <View style={styles.watchCircle}>
          <Text style={styles.watchPercent}>{currentPercent}%</Text>
          <Text style={styles.watchLabel}>progreso</Text>
        </View>

        {/* Información del libro */}
        <Text style={styles.bookTitle} numberOfLines={2}>
          {book.title}
        </Text>
        <Text style={styles.bookAuthor}>{book.author}</Text>

        {/* Barra de progreso visual */}
        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: barWidth }]} />
        </View>
        <Text style={styles.pagesTotal}>de {book.totalPages} páginas</Text>

        {/* Campo para ingresar páginas leídas */}
        <Text style={styles.fieldLabel}>Páginas leídas</Text>
        <TextInput
          style={styles.input}
          value={pagesInput}
          onChangeText={setPagesInput}
          // Teclado numérico para evitar valores no numéricos
          keyboardType="numeric"
          maxLength={6}
          placeholder="0"
          placeholderTextColor={COLORS.textSecondary}
          selectTextOnFocus
          returnKeyType="done"
          onSubmitEditing={handleUpdate}
        />

        {/* Botón para guardar el progreso */}
        <TouchableOpacity
          style={[styles.updateBtn, loading && styles.btnDisabled]}
          onPress={handleUpdate}
          disabled={loading}
          activeOpacity={0.85}
        >
          <Text style={styles.updateBtnText}>
            {loading ? 'Guardando...' : 'Actualizar progreso'}
          </Text>
        </TouchableOpacity>

        {/* Botón para cancelar y volver */}
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => navigation.goBack()}
        >
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
    paddingHorizontal: 28,
    paddingTop: 32,
  },
  // Caratula pequeña que muestra el porcentaje de progreso actual
  watchCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: COLORS.watchFace,
    borderWidth: 3,
    borderColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  watchPercent: {
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '900',
  },
  watchLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  bookTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
    maxWidth: width - 60,
  },
  bookAuthor: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 18,
  },
  barBg: {
    width: width - 80,
    height: 8,
    backgroundColor: COLORS.barEmpty,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  barFill: {
    height: 8,
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  pagesTotal: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginBottom: 24,
  },
  fieldLabel: {
    alignSelf: 'flex-start',
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    backgroundColor: COLORS.watchFace,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: COLORS.primary,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 20,
  },
  updateBtn: {
    width: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  btnDisabled: {
    opacity: 0.5,
  },
  updateBtnText: {
    color: COLORS.background,
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    paddingVertical: 10,
  },
  cancelText: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
