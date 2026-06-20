// Pantalla de lista de libros registrados en ReadWatch
// Muestra cada libro con barra de progreso visual y porcentaje
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import COLORS from '../constants/colors';
import { loadData } from '../utils/storage';
import { calculateProgress } from '../utils/helpers';

const { width } = Dimensions.get('window');

/**
 * BookListScreen — Lista todos los libros registrados.
 * Usa FlatList para rendimiento eficiente con muchos libros.
 * Muestra barra de progreso visual por cada libro.
 *
 * @param {object} navigation - Objeto de navegación de React Navigation
 */
export default function BookListScreen({ navigation }) {
  const [books, setBooks] = useState([]);

  // Recargar libros cada vez que la pantalla recibe el foco
  useFocusEffect(
    useCallback(() => {
      const fetch = async () => {
        const loaded = await loadData();
        setBooks(loaded);
      };
      fetch();
    }, [])
  );

  /**
   * renderBookList — Renderiza un ítem individual de la lista de libros.
   * Muestra título, autor, barra de progreso y porcentaje.
   * Permite navegar a UpdateProgress al presionar el ítem.
   *
   * @param {object} item - Objeto libro con id, title, author, pagesRead, totalPages
   */
  const renderItem = ({ item }) => {
    const percent = calculateProgress(item.pagesRead, item.totalPages);
    // Calcular el ancho de la barra de progreso como porcentaje del contenedor
    const barWidth = (percent / 100) * (width - 64);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('UpdateProgress', { book: item })}
        activeOpacity={0.8}
      >
        {/* Título del libro */}
        <Text style={styles.title} numberOfLines={1}>
          {item.title}
        </Text>
        {/* Autor del libro */}
        <Text style={styles.author} numberOfLines={1}>
          {item.author}
        </Text>

        {/* Barra de progreso visual */}
        <View style={styles.barBackground}>
          <View style={[styles.barFill, { width: barWidth }]} />
        </View>

        {/* Páginas leídas y porcentaje en la misma línea */}
        <View style={styles.statsRow}>
          <Text style={styles.pages}>
            {item.pagesRead} / {item.totalPages} págs.
          </Text>
          <Text style={styles.percent}>{percent}%</Text>
        </View>
      </TouchableOpacity>
    );
  };

  /**
   * Componente mostrado cuando no hay libros registrados.
   * Evita que la pantalla quede en blanco o crashee.
   */
  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📚</Text>
      <Text style={styles.emptyText}>Sin libros registrados</Text>
      <Text style={styles.emptyHint}>Toca "+ Libro" para comenzar</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Encabezado de la pantalla */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mis Libros</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddBook')}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de libros con FlatList para manejo eficiente */}
      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={books.length === 0 ? styles.flatListEmpty : styles.flatList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontWeight: '700',
  },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: COLORS.background,
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 26,
  },
  flatList: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  // Estilo para centrar el componente vacío cuando no hay libros
  flatListEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Tarjeta individual de cada libro
  card: {
    backgroundColor: COLORS.watchFace,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  author: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 10,
  },
  // Contenedor gris de la barra de progreso vacía
  barBackground: {
    height: 6,
    backgroundColor: COLORS.barEmpty,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  // Porción verde que indica el progreso actual
  barFill: {
    height: 6,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pages: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  percent: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  // Estado vacío cuando no hay libros
  emptyContainer: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  emptyHint: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
});
