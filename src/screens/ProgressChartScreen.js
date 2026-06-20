// ProgressChartScreen v2.1 — Responsivo
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import COLORS from '../constants/colors';
import { useBooks } from '../hooks/useBooks';
import { calculateProgress } from '../utils/helpers';
import { scale, fontScale, wp } from '../utils/responsive';

const CHART_H  = scale(160);
const CHART_W  = wp(100) - scale(40);
const PAD_H    = scale(24);

export default function ProgressChartScreen() {
  const { books } = useBooks();

  const totalPages = books.reduce((acc, b) => acc + b.totalPages, 0);
  const totalRead  = books.reduce((acc, b) => acc + b.pagesRead, 0);
  const completed  = books.filter((b) => calculateProgress(b.pagesRead, b.totalPages) >= 100).length;
  const avgProgress =
    books.length > 0
      ? parseFloat((books.reduce((acc, b) => acc + calculateProgress(b.pagesRead, b.totalPages), 0) / books.length).toFixed(1))
      : 0;

  const renderProgressChart = () => {
    if (books.length === 0) return null;
    const available = CHART_W - PAD_H * 2;
    const groupW    = available / books.length;
    const barW      = Math.max(Math.min(groupW * 0.65, scale(36)), scale(8));
    const maxH      = CHART_H - scale(28);
    const svgFontSz = Math.max(scale(8), 7);

    return (
      <Svg width={CHART_W} height={CHART_H + scale(28)}>
        {/* Línea de referencia 50% */}
        <Line x1={PAD_H} y1={CHART_H - maxH * 0.5} x2={CHART_W - PAD_H} y2={CHART_H - maxH * 0.5}
          stroke={COLORS.borderLight} strokeWidth={1} strokeDasharray="4 4" />
        <SvgText x={PAD_H - 2} y={CHART_H - maxH * 0.5 - 3} fill={COLORS.textMuted} fontSize={svgFontSz} textAnchor="end">50%</SvgText>

        {books.map((book, i) => {
          const pct       = calculateProgress(book.pagesRead, book.totalPages);
          const filled    = (pct / 100) * maxH;
          const cx        = PAD_H + i * groupW + groupW / 2;
          const bx        = cx - barW / 2;
          const isComp    = pct >= 100;
          const barColor  = isComp ? COLORS.gold : pct >= 50 ? COLORS.primary : COLORS.accent;
          const maxChars  = Math.max(Math.floor(groupW / (svgFontSz * 0.6)), 2);
          const label     = book.title.length > maxChars ? book.title.slice(0, maxChars) + '…' : book.title;

          return (
            <React.Fragment key={book.id}>
              <Rect x={bx} y={CHART_H - maxH} width={barW} height={maxH} fill={COLORS.barEmpty} rx={scale(4)} />
              {filled > 0 && <Rect x={bx} y={CHART_H - filled} width={barW} height={filled} fill={barColor} rx={scale(4)} />}
              {pct > 0 && (
                <SvgText x={cx} y={CHART_H - filled - 4} fill={barColor} fontSize={svgFontSz} fontWeight="bold" textAnchor="middle">
                  {pct}%
                </SvgText>
              )}
              <SvgText x={cx} y={CHART_H + scale(14)} fill={COLORS.textSecondary} fontSize={svgFontSz} textAnchor="middle">
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

        {/* Grid de métricas */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, styles.metricCardWide]}>
            <Text style={styles.metricValue}>{avgProgress}%</Text>
            <Text style={styles.metricLabel}>Promedio general</Text>
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

        {/* Gráfica o estado vacío */}
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

        {/* Ranking detallado */}
        {books.length > 0 && (
          <View style={styles.detailCard}>
            <Text style={styles.sectionTitle}>Detalle de libros</Text>
            {books
              .slice()
              .sort((a, b) => calculateProgress(b.pagesRead, b.totalPages) - calculateProgress(a.pagesRead, a.totalPages))
              .map((book, i) => {
                const pct = calculateProgress(book.pagesRead, book.totalPages);
                const isComp = pct >= 100;
                return (
                  <View key={book.id} style={[styles.detailRow, i === 0 && styles.detailRowFirst]}>
                    <View style={styles.detailRank}><Text style={styles.detailRankText}>{i + 1}</Text></View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailTitle} numberOfLines={1}>{book.title}</Text>
                      <View style={styles.detailBarBg}>
                        <View style={[styles.detailBarFill, { width: `${pct}%`, backgroundColor: isComp ? COLORS.gold : COLORS.primary }]} />
                      </View>
                      <Text style={styles.detailPages}>{book.pagesRead} / {book.totalPages} págs.</Text>
                    </View>
                    <Text style={[styles.detailPct, isComp && { color: COLORS.gold }]}>{pct}%</Text>
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
  scroll: { paddingHorizontal: scale(20), paddingTop: scale(18), paddingBottom: scale(40) },
  screenTitle: { color: COLORS.text, fontSize: fontScale(20), fontWeight: '800', marginBottom: scale(14) },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(10), marginBottom: scale(14) },
  metricCard: { flex: 1, minWidth: '45%', backgroundColor: COLORS.surface, borderRadius: scale(14), borderWidth: 1, borderColor: COLORS.border, padding: scale(14) },
  metricCardWide: { minWidth: '100%' },
  metricValue: { color: COLORS.text, fontSize: fontScale(26), fontWeight: '900', marginBottom: 2 },
  metricLabel: { color: COLORS.textSecondary, fontSize: fontScale(12) },
  miniBarBg: { height: scale(4), backgroundColor: COLORS.barEmpty, borderRadius: scale(2), marginTop: scale(8), overflow: 'hidden' },
  miniBarFill: { height: scale(4), backgroundColor: COLORS.primary, borderRadius: scale(2) },
  chartCard: { backgroundColor: COLORS.surface, borderRadius: scale(16), borderWidth: 1, borderColor: COLORS.border, padding: scale(14), marginBottom: scale(12) },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(10) },
  sectionTitle: { color: COLORS.textSecondary, fontSize: fontScale(10), fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  legend: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
  legendDot: { width: scale(7), height: scale(7), borderRadius: scale(4) },
  legendText: { color: COLORS.textSecondary, fontSize: fontScale(9) },
  detailCard: { backgroundColor: COLORS.surface, borderRadius: scale(16), borderWidth: 1, borderColor: COLORS.border, padding: scale(14) },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingTop: scale(10), borderTopWidth: 1, borderTopColor: COLORS.border, gap: scale(10) },
  detailRowFirst: { borderTopWidth: 0, paddingTop: scale(6) },
  detailRank: { width: scale(22), height: scale(22), borderRadius: scale(11), backgroundColor: COLORS.barEmpty, alignItems: 'center', justifyContent: 'center' },
  detailRankText: { color: COLORS.textSecondary, fontSize: fontScale(10), fontWeight: '700' },
  detailInfo: { flex: 1 },
  detailTitle: { color: COLORS.text, fontSize: fontScale(13), fontWeight: '600', marginBottom: scale(4) },
  detailBarBg: { height: scale(4), backgroundColor: COLORS.barEmpty, borderRadius: scale(2), marginBottom: scale(3), overflow: 'hidden' },
  detailBarFill: { height: scale(4), borderRadius: scale(2) },
  detailPages: { color: COLORS.textSecondary, fontSize: fontScale(11) },
  detailPct: { color: COLORS.primary, fontSize: fontScale(14), fontWeight: '800' },
  emptyContainer: { alignItems: 'center', paddingVertical: scale(40) },
  emptyIcon: { fontSize: scale(44), marginBottom: scale(10) },
  emptyTitle: { color: COLORS.text, fontSize: fontScale(17), fontWeight: '700', marginBottom: scale(6) },
  emptyHint: { color: COLORS.textSecondary, fontSize: fontScale(13), textAlign: 'center' },
});
