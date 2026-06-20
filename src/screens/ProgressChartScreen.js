// ProgressChartScreen v2 — Gráfica premium con métricas detalladas
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import COLORS from '../constants/colors';
import { useBooks } from '../hooks/useBooks';
import { calculateProgress } from '../utils/helpers';

const { width } = Dimensions.get('window');
const CHART_H = 160;
const CHART_W = width - 40;
const PAD_H = 24;

/**
 * ProgressChartScreen v2 — Gráfica de barras SVG con línea de referencia al 50%
 * y panel de métricas detalladas por libro.
 */
export default function ProgressChartScreen() {
  const { books } = useBooks();

  // Métricas globales calculadas
  const totalPages = books.reduce((acc, b) => acc + b.totalPages, 0);
  const totalRead = books.reduce((acc, b) => acc + b.pagesRead, 0);
  const completed = books.filter((b) => calculateProgress(b.pagesRead, b.totalPages) >= 100).length;
  const avgProgress =
    books.length > 0
      ? parseFloat(
          (books.reduce((acc, b) => acc + calculateProgress(b.pagesRead, b.totalPages), 0) / books.length).toFixed(1)
        )
      : 0;

  /**
   * renderProgressChart — Gráfica SVG de barras de progreso.
   * Incluye línea de referencia horizontal al 50% y etiquetas de porcentaje.
   */
  const renderProgressChart = () => {
    if (books.length === 0) return null;
    const available = CHART_W - PAD_H * 2;
    const groupW = available / books.length;
    const barW = Math.max(Math.min(groupW * 0.65, 36), 10);
    const maxH = CHART_H - 28;

    return (
      <Svg width={CHART_W} height={CHART_H + 28}>
        {/* Línea de referencia al 50% */}
        <Line
          x1={PAD_H}
          y1={CHART_H - maxH * 0.5}
          x2={CHART_W - PAD_H}
          y2={CHART_H - maxH * 0.5}
          stroke={COLORS.borderLight}
          strokeWidth={1}
          strokeDasharray="4 4"
        />
        <SvgText
          x={PAD_H - 2}
          y={CHART_H - maxH * 0.5 - 3}
          fill={COLORS.textMuted}
          fontSize={8}
          textAnchor="end"
        >
          50%
        </SvgText>

        {books.map((book, i) => {
          const pct = calculateProgress(book.pagesRead, book.totalPages);
          const filled = (pct / 100) * maxH;
          const cx = PAD_H + i * groupW + groupW / 2;
          const bx = cx - barW / 2;
          const isComplete = pct >= 100;
          const barColor = isComplete ? COLORS.gold : pct >= 50 ? COLORS.primary : COLORS.accent;

          // Truncar label a caracteres que quepan en el ancho del grupo
          const maxChars = Math.max(Math.floor(groupW / 6), 3);
          const label = book.title.length > maxChars
            ? book.title.slice(0, maxChars) + '…'
            : book.title;

          return (
            <React.Fragment key={book.id}>
              {/* Barra vacía de fondo */}
              <Rect x={bx} y={CHART_H - maxH} width={barW} height={maxH} fill={COLORS.barEmpty} rx={4} />
              {/* Barra de progreso coloreada */}
              {filled > 0 && (
                <Rect x={bx} y={CHART_H - filled} width={barW} height={filled} fill={barColor} rx={4} />
              )}
              {/* Porcentaje encima de la barra */}
              {pct > 0 && (
                <SvgText x={cx} y={CHART_H - filled - 5} fill={barColor} fontSize={9} fontWeight="bold" textAnchor="middle">
                  {pct}%
                </SvgText>
              )}
              {/* Título del libro bajo el eje */}
              <SvgText x={cx} y={CHART_H + 14} fill={COLORS.textSecondary} fontSize={8} textAnchor="middle">
                {label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        <Text style={styles.screenTitle}>Mi Progreso</Text>

        {/* Panel de métricas globales — 4 tarjetas */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, styles.metricCardWide]}>
            <Text style={styles.metricValue}>{avgProgress}%</Text>
            <Text style={styles.metricLabel}>Promedio general</Text>
            {/* Mini barra de progreso dentro de la tarjeta */}
            <View style={styles.miniBarBg}>
              <View style={[styles.miniBarFill, { width: `${avgProgress}%` }]} />
            </View>
          </View>

          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: COLORS.gold }]}>{completed}</Text>
            <Text style={styles.metricLabel}>Completados</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={[styles.metricValue, { color: COLORS.accent }]}>{books.length}</Text>
            <Text style={styles.metricLabel}>Registrados</Text>
          </View>

          <View style={[styles.metricCard, styles.metricCardWide]}>
            <Text style={styles.metricValue}>{totalRead.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Páginas leídas de {totalPages.toLocaleString()}</Text>
          </View>
        </View>

        {/* Gráfica SVG o estado vacío */}
        {books.length > 0 ? (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <Text style={styles.sectionTitle}>Progreso por libro</Text>
              <View style={styles.legend}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} />
                <Text style={styles.legendText}>{'<'}50%</Text>
                <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.legendText}>{'≥'}50%</Text>
                <View style={[styles.legendDot, { backgroundColor: COLORS.gold }]} />
                <Text style={styles.legendText}>100%</Text>
              </View>
            </View>
            {renderProgressChart()}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>Sin datos aún</Text>
            <Text style={styles.emptyHint}>Registra libros para ver tu progreso aquí</Text>
          </View>
        )}

        {/* Lista detallada por libro */}
        {books.length > 0 && (
          <View style={styles.detailCard}>
            <Text style={styles.sectionTitle}>Detalle de libros</Text>
            {books
              .slice()
              .sort((a, b) => calculateProgress(b.pagesRead, b.totalPages) - calculateProgress(a.pagesRead, a.totalPages))
              .map((book, i) => {
                const pct = calculateProgress(book.pagesRead, book.totalPages);
                const isComplete = pct >= 100;
                return (
                  <View key={book.id} style={[styles.detailRow, i === 0 && styles.detailRowFirst]}>
                    <View style={styles.detailRank}>
                      <Text style={styles.detailRankText}>{i + 1}</Text>
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailTitle} numberOfLines={1}>{book.title}</Text>
                      <View style={styles.detailBarBg}>
                        <View style={[styles.detailBarFill, { width: `${pct}%`, backgroundColor: isComplete ? COLORS.gold : COLORS.primary }]} />
                      </View>
                      <Text style={styles.detailPages}>{book.pagesRead} / {book.totalPages} págs.</Text>
                    </View>
                    <Text style={[styles.detailPct, isComplete && { color: COLORS.gold }]}>{pct}%</Text>
                  </View>
                );
              })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 },
  screenTitle: { color: COLORS.text, fontSize: 22, fontWeight: '800', marginBottom: 16 },

  // Grid de métricas 2x2
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  metricCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  metricCardWide: { minWidth: '100%' },
  metricValue: { color: COLORS.text, fontSize: 28, fontWeight: '900', marginBottom: 2 },
  metricLabel: { color: COLORS.textSecondary, fontSize: 12 },
  miniBarBg: { height: 4, backgroundColor: COLORS.barEmpty, borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  miniBarFill: { height: 4, backgroundColor: COLORS.primary, borderRadius: 2 },

  // Tarjeta de gráfica SVG
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 14,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 7, height: 7, borderRadius: 4 },
  legendText: { color: COLORS.textSecondary, fontSize: 9 },

  // Tarjeta de lista detallada
  detailCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: 10,
  },
  detailRowFirst: { borderTopWidth: 0, paddingTop: 10 },
  detailRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.barEmpty,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailRankText: { color: COLORS.textSecondary, fontSize: 11, fontWeight: '700' },
  detailInfo: { flex: 1 },
  detailTitle: { color: COLORS.text, fontSize: 13, fontWeight: '600', marginBottom: 4 },
  detailBarBg: { height: 4, backgroundColor: COLORS.barEmpty, borderRadius: 2, marginBottom: 3, overflow: 'hidden' },
  detailBarFill: { height: 4, borderRadius: 2 },
  detailPages: { color: COLORS.textSecondary, fontSize: 11 },
  detailPct: { color: COLORS.primary, fontSize: 15, fontWeight: '800' },

  // Estado vacío
  emptyContainer: { alignItems: 'center', paddingVertical: 48 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { color: COLORS.text, fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptyHint: { color: COLORS.textSecondary, fontSize: 14, textAlign: 'center' },
});
