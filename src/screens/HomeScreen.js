// Pantalla principal de ReadWatch — simula la caratula de un smartwatch
// Muestra estadísticas globales y accesos a las demás secciones
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import COLORS from '../constants/colors';
import { loadData } from '../utils/storage';
import { calculateProgress } from '../utils/helpers';

const { width } = Dimensions.get('window');
// Diámetro de la caratula circular del reloj
const WATCH_SIZE = width * 0.82;

/**
 * HomeScreen — Pantalla principal tipo caratula de smartwatch.
 * Carga los libros al enfocarse y muestra resumen de progreso general.
 *
 * @param {object} navigation - Objeto de navegación de React Navigation
 */
export default function HomeScreen({ navigation }) {
  const [books, setBooks] = useState([]);
  const [totalPercent, setTotalPercent] = useState(0);

  // Recarga los datos cada vez que la pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      const fetchBooks = async () => {
        const loaded = await loadData();
        setBooks(loaded);
        // Calcular progreso global: promedio de progreso de todos los libros
        if (loaded.length > 0) {
          const sum = loaded.reduce(
            (acc, b) => acc + calculateProgress(b.pagesRead, b.totalPages),
            0
          );
          setTotalPercent(parseFloat((sum / loaded.length).toFixed(1)));
        } else {
          setTotalPercent(0);
        }
      };
      fetchBooks();
    }, [])
  );

  // Obtener el libro con mayor progreso para mostrarlo en la caratula
  const topBook =
    books.length > 0
      ? books.reduce((prev, curr) =>
          calculateProgress(curr.pagesRead, curr.totalPages) >
          calculateProgress(prev.pagesRead, prev.totalPages)
            ? curr
            : prev
        )
      : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Caratula circular principal del reloj */}
      <View style={styles.watchFace}>

        {/* Nombre de la app en la parte superior */}
        <Text style={styles.appName}>ReadWatch</Text>

        {/* Porcentaje de progreso global grande en el centro */}
        <Text style={styles.bigPercent}>{totalPercent}%</Text>
        <Text style={styles.label}>Progreso general</Text>

        {/* Libro más avanzado debajo del porcentaje */}
        {topBook ? (
          <Text style={styles.topBook} numberOfLines={1}>
            📖 {topBook.title}
          </Text>
        ) : (
          <Text style={styles.topBook}>Sin libros aún</Text>
        )}

        {/* Total de libros registrados */}
        <Text style={styles.countLabel}>{books.length} libro(s)</Text>
      </View>

      {/* Botones de navegación debajo de la caratula */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation.navigate('BookList')}
        >
          <Text style={styles.navBtnText}>Lista</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnPrimary]}
          onPress={() => navigation.navigate('AddBook')}
        >
          <Text style={[styles.navBtnText, styles.navBtnTextPrimary]}>+ Libro</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navBtn}
          onPress={() => navigation.navigate('ProgressChart')}
        >
          <Text style={styles.navBtnText}>Gráfica</Text>
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
  // Caratula circular que simula la pantalla del smartwatch
  watchFace: {
    width: WATCH_SIZE,
    height: WATCH_SIZE,
    borderRadius: WATCH_SIZE / 2,
    backgroundColor: COLORS.watchFace,
    borderWidth: 3,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    // Sombra suave para dar sensación de profundidad
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 3,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  // Número grande de porcentaje global en el centro de la caratula
  bigPercent: {
    color: COLORS.text,
    fontSize: 56,
    fontWeight: '900',
    lineHeight: 60,
  },
  label: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
    marginBottom: 10,
    letterSpacing: 1,
  },
  topBook: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
    maxWidth: WATCH_SIZE * 0.7,
    textAlign: 'center',
  },
  countLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 6,
  },
  // Fila de botones de navegación debajo de la caratula
  buttonRow: {
    flexDirection: 'row',
    marginTop: 28,
    gap: 10,
  },
  navBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.watchFace,
  },
  navBtnPrimary: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  navBtnText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  navBtnTextPrimary: {
    color: COLORS.background,
  },
});
