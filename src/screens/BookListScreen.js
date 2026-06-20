// BookListScreen v4.1 — Adaptado a pantallas circulares (Wear OS) y rectangulares
import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  StatusBar, Alert, TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';
import { useBooks } from '../hooks/useBooks';
import { calculateProgress } from '../utils/helpers';
import { getBookColor } from '../constants/bookColors';
import { scale, fontScale, wp, isWatchScreen, safeCircularPad, safeContentWidth } from '../utils/responsive';
import AnimatedCard from '../components/AnimatedCard';
import PressableScale from '../components/PressableScale';

const SORT_OPTIONS = [
  { key: 'progress', label: 'Progreso',  icon: 'trending-up'  },
  { key: 'title',    label: 'Título',    icon: 'text'          },
  { key: 'date',     label: 'Reciente',  icon: 'time-outline'  },
];

export default function BookListScreen({ navigation }) {
  const { books, removeBook } = useBooks();
  const [expandedId, setExpandedId] = useState(null);
  const [query, setQuery]           = useState('');
  const [sortKey, setSortKey]       = useState('progress');
  const [showSort, setShowSort]     = useState(false);

  const filteredBooks = useMemo(() => {
    let result = books;
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q));
    }
    return [...result].sort((a, b) => {
      if (sortKey === 'progress') return calculateProgress(b.pagesRead, b.totalPages) - calculateProgress(a.pagesRead, a.totalPages);
      if (sortKey === 'title')    return a.title.localeCompare(b.title);
      if (sortKey === 'date')     return new Date(b.createdAt) - new Date(a.createdAt);
      return 0;
    });
  }, [books, query, sortKey]);

  const handleDelete = (book) => {
    Alert.alert('Eliminar', `¿Eliminar "${book.title}"?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Eliminar', style: 'destructive', onPress: async () => { await removeBook(book.id); setExpandedId(null); } },
    ]);
  };

  // Tarjeta compacta para Wear OS
  const renderWatchItem = ({ item, index }) => {
    const percent    = calculateProgress(item.pagesRead, item.totalPages);
    const isComplete = percent >= 100;
    const barW       = (percent / 100) * safeContentWidth;
    const bookColor  = item.color || getBookColor(item.id);

    return (
      <AnimatedCard index={index}>
        <TouchableOpacity
          style={[styles.watchCard, isComplete && { borderColor: bookColor + '55' }]}
          onPress={() => navigation.navigate('UpdateProgress', { book: item })}
          onLongPress={() => handleDelete(item)}
          activeOpacity={0.85}
        >
          <View style={styles.watchCardRow}>
            <Text style={styles.watchCardTitle} numberOfLines={1}>{item.title}</Text>
            {isComplete
              ? <Ionicons name="checkmark-circle" size={scale(14)} color={bookColor} />
              : <Text style={[styles.watchPercent, { color: bookColor }]}>{percent}%</Text>
            }
          </View>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: barW, backgroundColor: bookColor }]} />
          </View>
          <Text style={styles.watchPages}>{item.pagesRead}/{item.totalPages} págs.</Text>
        </TouchableOpacity>
      </AnimatedCard>
    );
  };

  // Tarjeta completa para teléfonos normales
  const renderPhoneItem = ({ item, index }) => {
    const percent    = calculateProgress(item.pagesRead, item.totalPages);
    const isComplete = percent >= 100;
    const isExpanded = expandedId === item.id;
    const barW       = (percent / 100) * safeContentWidth;
    const bookColor  = item.color || getBookColor(item.id);

    return (
      <AnimatedCard index={index}>
        <TouchableOpacity
          style={[styles.card, { borderLeftColor: bookColor, borderLeftWidth: scale(3) }]}
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
              ? <View style={[styles.completeBadge, { backgroundColor: bookColor }]}><Ionicons name="checkmark" size={scale(16)} color={COLORS.background} /></View>
              : <Text style={[styles.percentText, { color: bookColor }]}>{percent}%</Text>
            }
          </View>
          <View style={styles.barBg}>
            <View style={[styles.barFill, { width: barW, backgroundColor: bookColor }]} />
          </View>
          <View style={styles.cardFooter}>
            <View style={styles.infoRow}>
              <Ionicons name="reader-outline" size={scale(12)} color={COLORS.textSecondary} />
              <Text style={styles.pagesText}> {item.pagesRead} / {item.totalPages} págs.</Text>
            </View>
            {item.notes
              ? <View style={styles.infoRow}><Ionicons name="document-text-outline" size={scale(12)} color={bookColor} /><Text style={[styles.noteIndicator, { color: bookColor }]}> Nota</Text></View>
              : <View style={styles.infoRow}><Ionicons name="chevron-forward" size={scale(12)} color={COLORS.textMuted} /><Text style={styles.hintText}> actualizar</Text></View>
            }
          </View>
          {isExpanded && (
            <PressableScale style={styles.deleteBtn} onPress={() => handleDelete(item)} scaleDown={0.97}>
              <Ionicons name="trash-outline" size={scale(15)} color={COLORS.danger} />
              <Text style={styles.deleteBtnText}> Eliminar</Text>
            </PressableScale>
          )}
        </TouchableOpacity>
      </AnimatedCard>
    );
  };

  const EmptyComponent = () => (
    <View style={styles.emptyContainer}>
      {query.trim()
        ? <>
            <Ionicons name="search" size={scale(36)} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Sin resultados</Text>
          </>
        : <>
            <Ionicons name="library-outline" size={scale(38)} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Sin libros</Text>
            <PressableScale style={styles.emptyBtn} onPress={() => navigation.navigate('AddBook')}>
              <Ionicons name="add" size={scale(15)} color={COLORS.background} />
              <Text style={styles.emptyBtnText}> Agregar</Text>
            </PressableScale>
          </>
      }
    </View>
  );

  // ── Layout para Wear OS (circular) ───────────────────────────────────────────
  if (isWatchScreen) {
    return (
      <View style={styles.container}>
        <StatusBar hidden />
        {/* Encabezado compacto */}
        <View style={styles.watchHeader}>
          <Text style={styles.watchHeaderTitle}>Libros ({books.length})</Text>
          <TouchableOpacity style={styles.watchAddBtn} onPress={() => navigation.navigate('AddBook')}>
            <Ionicons name="add" size={scale(18)} color={COLORS.background} />
          </TouchableOpacity>
        </View>

        {/* Búsqueda compacta */}
        <View style={styles.watchSearch}>
          <Ionicons name="search" size={scale(12)} color={COLORS.textSecondary} />
          <TextInput
            style={styles.watchSearchInput}
            placeholder="Buscar..."
            placeholderTextColor={COLORS.textMuted}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={scale(13)} color={COLORS.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <FlatList
          data={filteredBooks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderWatchItem}
          ListEmptyComponent={EmptyComponent}
          contentContainerStyle={filteredBooks.length === 0 ? styles.flatListEmpty : styles.watchFlatList}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        />
      </View>
    );
  }

  // ── Layout normal para teléfonos ─────────────────────────────────────────────
  const currentSort = SORT_OPTIONS.find((o) => o.key === sortKey);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />

      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Mis Libros</Text>
          {books.length > 0 && <Text style={styles.headerSub}>{filteredBooks.length} de {books.length} libro(s)</Text>}
        </View>
        <PressableScale style={styles.addBtn} onPress={() => navigation.navigate('AddBook')}>
          <Ionicons name="add" size={scale(24)} color={COLORS.background} />
        </PressableScale>
      </View>

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

      {showSort && (
        <View style={styles.sortPanel}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity key={opt.key} style={[styles.sortOption, sortKey === opt.key && styles.sortOptionActive]} onPress={() => { setSortKey(opt.key); setShowSort(false); }}>
              <Ionicons name={opt.icon} size={scale(14)} color={sortKey === opt.key ? COLORS.primary : COLORS.textSecondary} />
              <Text style={[styles.sortOptionText, sortKey === opt.key && styles.sortOptionTextActive]}> {opt.label}</Text>
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
        renderItem={renderPhoneItem}
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

  // ── Wear OS ──────────────────────────────────────────────────────────────────
  watchHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: safeCircularPad,
    paddingTop: scale(10),
    paddingBottom: scale(4),
  },
  watchHeaderTitle: { color: COLORS.text, fontSize: fontScale(13), fontWeight: '800' },
  watchAddBtn: { width: scale(28), height: scale(28), borderRadius: scale(14), backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  watchSearch: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginHorizontal: safeCircularPad,
    paddingHorizontal: scale(8),
    paddingVertical: scale(5),
    marginBottom: scale(6),
    gap: scale(5),
  },
  watchSearchInput: { flex: 1, color: COLORS.text, fontSize: fontScale(11), padding: 0 },
  watchFlatList: { paddingHorizontal: safeCircularPad, paddingBottom: safeCircularPad },
  // Tarjeta compacta para reloj
  watchCard: {
    backgroundColor: COLORS.surface,
    borderRadius: scale(10),
    padding: scale(9),
    marginBottom: scale(7),
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  watchCardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: scale(5) },
  watchCardTitle: { color: COLORS.text, fontSize: fontScale(12), fontWeight: '700', flex: 1, marginRight: scale(4) },
  watchPercent: { color: COLORS.primary, fontSize: fontScale(12), fontWeight: '800' },
  watchPages: { color: COLORS.textSecondary, fontSize: fontScale(10), marginTop: scale(3) },

  // ── Teléfono ──────────────────────────────────────────────────────────────────
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: scale(20), paddingTop: scale(16), paddingBottom: scale(10) },
  headerTitle: { color: COLORS.text, fontSize: fontScale(20), fontWeight: '800' },
  headerSub: { color: COLORS.textSecondary, fontSize: fontScale(12), marginTop: 1 },
  addBtn: { width: scale(38), height: scale(38), borderRadius: scale(19), backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(16), gap: scale(8), marginBottom: scale(6) },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface, borderRadius: scale(12), borderWidth: 1, borderColor: COLORS.borderLight, paddingHorizontal: scale(12), paddingVertical: scale(9), gap: scale(8) },
  searchInput: { flex: 1, color: COLORS.text, fontSize: fontScale(14), padding: 0 },
  sortBtn: { width: scale(40), height: scale(40), borderRadius: scale(12), backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.primary + '55', alignItems: 'center', justifyContent: 'center' },
  sortPanel: { marginHorizontal: scale(16), backgroundColor: COLORS.surface, borderRadius: scale(12), borderWidth: 1, borderColor: COLORS.borderLight, marginBottom: scale(8), overflow: 'hidden' },
  sortOption: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: scale(14), paddingVertical: scale(12), borderBottomWidth: 1, borderBottomColor: COLORS.border },
  sortOptionActive: { backgroundColor: COLORS.primary + '11' },
  sortOptionText: { color: COLORS.textSecondary, fontSize: fontScale(14) },
  sortOptionTextActive: { color: COLORS.primary, fontWeight: '700' },
  hintBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingBottom: scale(6) },
  longPressHint: { color: COLORS.textMuted, fontSize: fontScale(11) },
  flatList: { paddingHorizontal: scale(16), paddingBottom: scale(30) },
  flatListEmpty: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: scale(20) },
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
  emptyTitle: { color: COLORS.text, fontSize: fontScale(15), fontWeight: '700', marginTop: scale(8) },
  emptyBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primary, borderRadius: scale(12), paddingVertical: scale(10), paddingHorizontal: scale(20), marginTop: scale(10) },
  emptyBtnText: { color: COLORS.background, fontSize: fontScale(13), fontWeight: '800' },
});
