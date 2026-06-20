// BookListScreen v2.1 — Responsivo para todos los tamaños
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import COLORS from '../constants/colors';
import { useBooks } from '../hooks/useBooks';
import { calculateProgress } from '../utils/helpers';
import { scale, fontScale, wp } from '../utils/responsive';

export default function BookListScreen({ navigation }) {
  const { books, removeBook } = useBooks();
  const [expandedId, setExpandedId] = useState(null);

  const handleDelete = (book) => {
    Alert.alert(
      'Eliminar libro',
      `¿Eliminar "${book.title}"?`,
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

  const renderItem = ({ item }) => {
    const percent = calculateProgress(item.pagesRead, item.totalPages);
    const isComplete = percent >= 100;
    const isExpanded = expandedId === item.id;
    const barW = (percent / 100) * (wp(100) - scale(64));

    return (
      <TouchableOpacity
        style={[styles.card, isComplete && styles.cardComplete]}
        onPress={() => { setExpandedId(null); navigation.navigate('UpdateProgress', { book: item }); }}
        onLongPress={() => setExpandedId(isExpanded ? null : item.id)}
        activeOpacity={0.85}
      >
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

        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: barW }, isComplete && styles.barFillComplete]} />
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.pagesText}>{item.pagesRead} / {item.totalPages} págs.</Text>
          <Text style={styles.hintText}>{isExpanded ? 'Mantén para opciones' : 'Toca para actualizar'}</Text>
        </View>

        {isExpanded && (
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)} activeOpacity={0.8}>
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
      <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('AddBook')}>
        <Text style={styles.emptyBtnText}>+ Agregar libro</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mis Libros</Text>
          {books.length > 0 && <Text style={styles.headerSub}>{books.length} registrado(s)</Text>}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddBook')}>
          <Text style={styles.addBtnText}>+</Text>
        </TouchableOpacity>
      </View>
      {books.length > 0 && <Text style={styles.longPressHint}>Mantén presionado para eliminar</Text>}
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
  container: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: scale(20),
    paddingTop: scale(16),
    paddingBottom: scale(6),
  },
  headerTitle: { color: COLORS.text, fontSize: fontScale(20), fontWeight: '800' },
  headerSub: { color: COLORS.textSecondary, fontSize: fontScale(12), marginTop: 1 },
  addBtn: {
    width: scale(38),
    height: scale(38),
    borderRadius: scale(19),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: { color: COLORS.background, fontSize: fontScale(24), fontWeight: '700', lineHeight: scale(28) },
  longPressHint: { color: COLORS.textMuted, fontSize: fontScale(11), textAlign: 'center', paddingBottom: scale(6) },
  flatList: { paddingHorizontal: scale(16), paddingBottom: scale(30) },
  flatListEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(16) },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: scale(16),
    padding: scale(16),
    marginBottom: scale(12),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardComplete: { borderColor: COLORS.primary + '44' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: scale(12) },
  cardTitleBlock: { flex: 1, marginRight: scale(10) },
  cardTitle: { color: COLORS.text, fontSize: fontScale(15), fontWeight: '700', marginBottom: 2 },
  cardAuthor: { color: COLORS.textSecondary, fontSize: fontScale(12) },
  percentText: { color: COLORS.primary, fontSize: fontScale(17), fontWeight: '800' },
  completeBadge: {
    width: scale(28),
    height: scale(28),
    borderRadius: scale(14),
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  completeBadgeText: { color: COLORS.background, fontSize: fontScale(13), fontWeight: '900' },
  barBg: { height: scale(5), backgroundColor: COLORS.barEmpty, borderRadius: scale(3), marginBottom: scale(8), overflow: 'hidden' },
  barFill: { height: scale(5), backgroundColor: COLORS.primary, borderRadius: scale(3) },
  barFillComplete: { backgroundColor: COLORS.primary },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
  pagesText: { color: COLORS.textSecondary, fontSize: fontScale(12) },
  hintText: { color: COLORS.textMuted, fontSize: fontScale(11) },
  deleteBtn: {
    marginTop: scale(12),
    paddingVertical: scale(10),
    borderRadius: scale(10),
    backgroundColor: COLORS.danger + '22',
    borderWidth: 1,
    borderColor: COLORS.danger + '55',
    alignItems: 'center',
  },
  deleteBtnText: { color: COLORS.danger, fontSize: fontScale(13), fontWeight: '600' },
  emptyContainer: { alignItems: 'center' },
  emptyIcon: { fontSize: scale(48), marginBottom: scale(12) },
  emptyTitle: { color: COLORS.text, fontSize: fontScale(17), fontWeight: '700', marginBottom: scale(6) },
  emptyHint: { color: COLORS.textSecondary, fontSize: fontScale(13), marginBottom: scale(22), textAlign: 'center' },
  emptyBtn: { backgroundColor: COLORS.primary, borderRadius: scale(14), paddingVertical: scale(13), paddingHorizontal: scale(28) },
  emptyBtnText: { color: COLORS.background, fontSize: fontScale(14), fontWeight: '800' },
});
