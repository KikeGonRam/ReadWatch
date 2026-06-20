// BookListScreen v2 — Lista de libros con diseño premium y opción de eliminar
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
  Dimensions,
} from 'react-native';
import COLORS from '../constants/colors';
import { useBooks } from '../hooks/useBooks';
import { calculateProgress } from '../utils/helpers';

const { width } = Dimensions.get('window');

/**
 * BookListScreen v2 — Lista todos los libros con tarjetas premium.
 * Incluye badge de completado, barra de progreso y botón de eliminar.
 */
export default function BookListScreen({ navigation }) {
  const { books, loading, removeBook } = useBooks();
  // Controla qué tarjeta muestra el botón de eliminar al mantener presionada
  const [expandedId, setExpandedId] = useState(null);

  /**
   * Solicita confirmación antes de eliminar un libro.
   * @param {object} book - Libro a eliminar
   */
  const handleDelete = (book) => {
    Alert.alert(
      'Eliminar libro',
      `¿Eliminar "${book.title}"? Esta acción no se puede deshacer.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            await removeBook(book.id);
            setExpandedId(null);
          },
        },
      ]
    );
  };

  /**
   * renderItem — Tarjeta individual de cada libro.
   * Mantener presionado muestra el botón de eliminar.
   */
  const renderItem = ({ item }) => {
    const percent = calculateProgress(item.pagesRead, item.totalPages);
    const isComplete = percent >= 100;
    const isExpanded = expandedId === item.id;
    const barWidth = (percent / 100) * (width - 64);

    return (
      <TouchableOpacity
        style={[styles.card, isComplete && styles.cardComplete]}
        onPress={() => {
          setExpandedId(null);
          navigation.navigate('UpdateProgress', { book: item });
        }}
        onLongPress={() => setExpandedId(isExpanded ? null : item.id)}
        activeOpacity={0.85}
      >
        {/* Encabezado: título + badge de completado */}
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleBlock}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.cardAuthor} numberOfLines={1}>{item.author}</Text>
          </View>
          {isComplete ? (
            <View style={styles.completeBadge}>
              <Text style={styles.completeBadgeText}>✓</Text>
            </View>
          ) : (
            <Text style={styles.percentText}>{percent}%</Text>
          )}
        </View>

        {/* Barra de progreso visual */}
        <View style={styles.barBg}>
          <View
            style={[
              styles.barFill,
              { width: barWidth },
              isComplete && styles.barFillComplete,
            ]}
          />
        </View>

        {/* Pie de tarjeta: páginas y hint de interacción */}
        <View style={styles.cardFooter}>
          <Text style={styles.pagesText}>
            {item.pagesRead} / {item.totalPages} págs.
          </Text>
          <Text style={styles.hintText}>
            {isExpanded ? 'Mantén para opciones' : 'Toca para actualizar'}
          </Text>
        </View>

        {/* Botón de eliminar — visible al mantener presionado */}
        {isExpanded && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDelete(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.deleteBtnText}>🗑 Eliminar libro</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📖</Text>
      <Text style={styles.emptyTitle}>Sin libros registrados</Text>
      <Text style={styles.emptyHint}>Agrega tu primer libro para comenzar</Text>
      <TouchableOpacity
        style={styles.emptyBtn}
        onPress={() => navigation.navigate('AddBook')}
      >
        <Text style={styles.emptyBtnText}>+ Agregar libro</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Encabezado con contador */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mis Libros</Text>
          {books.length > 0 && (
            <Text style={styles.headerSub}>{books.length} registrado(s)</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('AddBook')}
        >
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Hint de mantener presionado */}
      {books.length > 0 && (
        <Text style={styles.longPressHint}>Mantén presionado para eliminar</Text>
      )}

      <FlatList
        data={books}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={books.length === 0 ? styles.flatListEmpty : styles.flatList}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => setExpandedId(null)}
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
    paddingTop: 18,
    paddingBottom: 6,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
  },
  headerSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 1,
  },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: COLORS.background,
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 28,
  },
  longPressHint: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    paddingBottom: 8,
  },
  flatList: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  flatListEmpty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  // Tarjeta base de libro
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  // Tarjeta con borde verde cuando está completado
  cardComplete: {
    borderColor: COLORS.primary + '44',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  cardTitleBlock: {
    flex: 1,
    marginRight: 10,
  },
  cardTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 2,
  },
  cardAuthor: {
    color: COLORS.textSecondary,
    fontSize: 13,
  },
  percentText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: '800',
  },
  // Badge circular verde para libros completados
  completeBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBadgeText: {
    color: COLORS.background,
    fontSize: 14,
    fontWeight: '900',
  },
  barBg: {
    height: 5,
    backgroundColor: COLORS.barEmpty,
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  barFill: {
    height: 5,
    backgroundColor: COLORS.primary,
    borderRadius: 3,
  },
  barFillComplete: {
    backgroundColor: COLORS.primary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pagesText: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  hintText: {
    color: COLORS.textMuted,
    fontSize: 11,
  },
  // Botón de eliminar que aparece al mantener presionado
  deleteBtn: {
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.danger + '22',
    borderWidth: 1,
    borderColor: COLORS.danger + '55',
    alignItems: 'center',
  },
  deleteBtnText: {
    color: COLORS.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  // Estado vacío
  emptyContainer: {
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 14,
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  emptyHint: {
    color: COLORS.textSecondary,
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
  },
  emptyBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 28,
  },
  emptyBtnText: {
    color: COLORS.background,
    fontSize: 15,
    fontWeight: '800',
  },
});
