// BookListScreen v3 — Búsqueda en tiempo real + ordenar por criterio
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';
import { useBooks } from '../hooks/useBooks';
import { calculateProgress } from '../utils/helpers';
import { scale, fontScale, wp } from '../utils/responsive';

// Opciones de ordenado disponibles
const SORT_OPTIONS = [
  { key: 'progress', label: 'Progreso', icon: 'trending-up' },
  { key: 'title',    label: 'Título',   icon: 'text'         },
  { key: 'date',     label: 'Reciente', icon: 'time-outline' },
];

export default function BookListScreen({ navigation }) {
  const { books, removeBook } = useBooks();
  const [expandedId, setExpandedId] = useState(null);
  const [query, setQuery]           = useState('');
  const [sortKey, setSortKey]       = useState('progress');
  const [showSort, setShowSort]     = useState(false);

  /**
   * Lista filtrada y ordenada en tiempo real.
   * useMemo evita recalcular en cada render si no cambian las dependencias.
   */
  const filteredBooks = useMemo(() => {
    let result = books;

    // Filtrar por búsqueda de texto (título o autor)
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q)
      );
    }

    // Ordenar según el criterio seleccionado
    return [...result].sort((a, b) => {
      if (sortKey === 'progress')
        return calculateProgress(b.pagesRead, b.totalPages) - calculateProgress(a.pagesRead, a.totalPages);
      if (sortKey === 'title')
        return a.title.localeCompare(b.title);
      if (sortKey === 'date')
        return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });
  }, [books, query, sortKey]);

  const handleDelete = (book) => {
    Alert.alert(
      'Eliminar libro',
      `¿Eliminar "${book.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: async () => { await removeBook(book.id); setExpandedId(null); } },
      ]
    );
  };

  const renderItem = ({ item }) => {
    const percent    = calculateProgress(item.pagesRead, item.totalPages);
    const isComplete = percent >= 100;
    const isExpanded = expandedId === item.id;
    const barW       = (percent / 100) * (wp(100) - scale(64));

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
          {isComplete
            ? <View style={styles.completeBadge}><Ionicons name="checkmark" size={scale(16)} color={COLORS.background} /></View>
            : <Text style={styles.percentText}>{percent}%</Text>
          }
        </View>

        <View style={styles.barBg}>
          <View style={[styles.barFill, { width: barW }]} />
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.infoRow}>
            <Ionicons name="reader-outline" size={scale(12)} color={COLORS.textSecondary} />
            <Text style={styles.pagesText}> {item.pagesRead} / {item.totalPages} págs.</Text>
          </View>
          {/* Indicador de que tiene notas */}
          {item.notes ? (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={scale(12)} color={COLORS.accent} />
              <Text style={styles.noteIndicator}> Nota</Text>
            </View>
          ) : (
            <View style={styles.infoRow}>
              <Ionicons name="chevron-forward" size={scale(12)} color={COLORS.textMuted} />
              <Text style={styles.hintText}> actualizar</Text>
            </View>
          )}
        </View>

        {isExpanded && (
          <TouchableOpacity style={styles.deleteBtn} onPress={() => handleDelete(item)} activeOpacity={0.8}>
            <Ionicons name="trash-outline" size={scale(15)} color={COLORS.danger} />
            <Text style={styles.deleteBtnText}> Eliminar libro</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {query.trim()
        ? <>
            <Ionicons name="search" size={scale(48)} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Sin resultados</Text>
            <Text style={styles.emptyHint}>No hay libros que coincidan con "{query}"</Text>
          </>
        : <>
            <Ionicons name="library-outline" size={scale(52)} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Sin libros registrados</Text>
            <Text style={styles.emptyHint}>Agrega tu primer libro para comenzar</Text>
            <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('AddBook')}>
              <Ionicons name="add" size={scale(17)} color={COLORS.background} />
              <Text style={styles.emptyBtnText}> Agregar libro</Text>
            </TouchableOpacity>
          </>
      }
    </View>
  );

  const currentSort = SORT_OPTIONS.find((o) => o.key === sortKey);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      {/* Encabezado */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mis Libros</Text>
          {books.length > 0 && <Text style={styles.headerSub}>{filteredBooks.length} de {books.length} libro(s)</Text>}
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('AddBook')}>
          <Ionicons name="add" size={scale(24)} color={COLORS.background} />
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda + botón de ordenar */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={scale(15)} color={COLORS.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por título o autor..."
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={scale(16)} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity style={styles.sortBtn} onPress={() => setShowSort((v) => !v)}>
          <Ionicons name={currentSort.icon} size={scale(15)} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Panel de opciones de ordenado */}
      {showSort && (
        <View style={styles.sortPanel}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              style={[styles.sortOption, sortKey === opt.key && styles.sortOptionActive]}
              onPress={() => { setSortKey(opt.key); setShowSort(false); }}
            >
              <Ionicons name={opt.icon} size={scale(14)} color={sortKey === opt.key ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[styles.sortOptionText, sortKey === opt.key && styles.sortOptionTextActive]}>
                {' '}{opt.label}
              </Text>
              {sortKey === opt.key && <Ionicons name="checkmark" size={scale(13)} color={COLORS.primary} style={{ marginLeft: 'auto' }} />}
            </TouchableOpacity>
          ))}
        </View>
      )}

      {books.length > 0 && !showSort && (
        <View style={styles.hintBanner}>
          <Ionicons name="hand-left-outline" size={scale(11)} color={COLORS.textMuted} />
          <Text style={styles.longPressHint}> Mantén presionado para eliminar</Text>
        </View>
      )}

      <FlatList
        data={filteredBooks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        ListEmptyComponent={EmptyComponent}
        contentContainerStyle={filteredBooks.length === 0 ? styles.flatListEmpty : styles.flatList}
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={() => { setExpandedId(null); setShowSort(false); }}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: scale(20), paddingTop: scale(16), paddingBottom: scale(10) },
  headerTitle: { color: COLORS.text, fontSize: fontScale(20), fontWeight: '800' },
  headerSub: { color: COLORS.textSecondary, fontSize: fontScale(12), marginTop: 1 },
  addBtn: { width: scale(38), height: scale(38), borderRadius: scale(19), backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },

  // Barra de búsqueda
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(16), gap: scale(8), marginBottom: scale(6) },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: scale(12), borderWidth: 1, borderColor: COLORS.borderLight, paddingHorizontal: scale(12), paddingVertical: scale(9), gap: scale(8) },
  searchInput: { flex: 1, color: COLORS.text, fontSize: fontScale(14), padding: 0 },
  sortBtn: { width: scale(40), height: scale(40), borderRadius: scale(12), backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.primary + '55', alignItems: 'center', justifyContent: 'center' },

  // Panel de ordenado
  sortPanel: { marginHorizontal: scale(16), backgroundColor: COLORS.surface, borderRadius: scale(12), borderWidth: 1, borderColor: COLORS.borderLight, marginBottom: scale(8), overflow: 'hidden' },
  sortOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(14), paddingVertical: scale(12), borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sortOptionActive: { backgroundColor: COLORS.primary + '11' },
  sortOptionText: { color: COLORS.textSecondary, fontSize: fontScale(14) },
  sortOptionTextActive: { color: COLORS.primary, fontWeight: '700' },

  hintBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: scale(6) },
  longPressHint: { color: COLORS.textMuted, fontSize: fontScale(11) },
  flatList: { paddingHorizontal: scale(16), paddingBottom: scale(30) },
  flatListEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(16) },

  card: { backgroundColor: COLORS.surface, borderRadius: scale(16), padding: scale(16), marginBottom: scale(12), borderWidth: 1, borderColor: COLORS.border },
  cardComplete: { borderColor: COLORS.primary + '44' },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: scale(12) },
  cardTitleBlock: { flex: 1, marginRight: scale(10) },
  cardTitle: { color: COLORS.text, fontSize: fontScale(15), fontWeight: '700', marginBottom: 2 },
  cardAuthor: { color: COLORS.textSecondary, fontSize: fontScale(12) },
  percentText: { color: COLORS.primary, fontSize: fontScale(17), fontWeight: '800' },
  completeBadge: { width: scale(28), height: scale(28), borderRadius: scale(14), backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  barBg: { height: scale(5), backgroundColor: COLORS.barEmpty, borderRadius: scale(3), marginBottom: scale(8), overflow: 'hidden' },
  barFill: { height: scale(5), backgroundColor: COLORS.primary, borderRadius: scale(3) },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoRow: { flexDirection: 'row', alignItems: 'center' },
  pagesText: { color: COLORS.textSecondary, fontSize: fontScale(12) },
  noteIndicator: { color: COLORS.accent, fontSize: fontScale(11), fontWeight: '600' },
  hintText: { color: COLORS.textMuted, fontSize: fontScale(11) },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: scale(12), paddingVertical: scale(10), borderRadius: scale(10), backgroundColor: COLORS.danger + '22', borderWidth: 1, borderColor: COLORS.danger + '55' },
  deleteBtnText: { color: COLORS.danger, fontSize: fontScale(13), fontWeight: '600' },
  emptyContainer: { alignItems: 'center', gap: scale(8) },
  emptyTitle: { color: COLORS.text, fontSize: fontScale(17), fontWeight: '700', marginTop: scale(8) },
  emptyHint: { color: COLORS.textSecondary, fontSize: fontScale(13), textAlign: 'center' },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: scale(14), paddingVertical: scale(13), paddingHorizontal: scale(28), marginTop: scale(10) },
  emptyBtnText: { color: COLORS.background, fontSize: fontScale(14), fontWeight: '800' },
});
