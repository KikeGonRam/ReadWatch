// ProgressChartScreen v2.2 — Iconos vectoriales
import React from 'react';
import { View, Text, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Rect, Text as SvgText, Line } from 'react-native-svg';
import COLORS from '../constants/colors';
import { useBooks } from '../hooks/useBooks';
import { calculateProgress } from '../utils/helpers';
import { scale, fontScale, wp, isWatchScreen, safeCircularPad } from '../utils/responsive';
import { getBookColor } from '../constants/bookColors';

const CHART_H = scale(160);
const CHART_W = wp(100) - (isWatchScreen ? safeCircularPad * 2 : scale(40));
const PAD_H   = scale(24);

export default function ProgressChartScreen() {
  const { books } = useBooks();

  const totalPages    = books.reduce((acc, b) => acc + b.totalPages, 0);
  const totalRead     = books.reduce((acc, b) => acc + b.pagesRead, 0);
  const completed     = books.filter((b) => calculateProgress(b.pagesRead, b.totalPages) >= 100).length;
  const avgProgress   =
    books.length > 0
      ? parseFloat((books.reduce((acc, b) => acc + calculateProgress(b.pagesRead, b.totalPages), 0) / books.length).toFixed(1))
      : 0;

  const renderChart = () => {
    if (books.length === 0) return null;
    const available = CHART_W - PAD_H * 2;
    const groupW    = available / books.length;
    const barW      = Math.max(Math.min(groupW * 0.65, scale(36)), scale(8));
    const maxH      = CHART_H - scale(28);
    const svgFs     = Math.max(scale(8), 7);

    return (
      <Svg width={CHART_W} height={CHART_H + scale(28)}>
        <Line x1={PAD_H} y1={CHART_H - maxH * 0.5} x2={CHART_W - PAD_H} y2={CHART_H - maxH * 0.5}
          stroke={COLORS.borderLight} strokeWidth={1} strokeDasharray="4 4" />
        <SvgText x={PAD_H - 2} y={CHART_H - maxH * 0.5 - 3} fill={COLORS.textMuted} fontSize={svgFs} textAnchor="end">50%</SvgText>

        {books.map((book, i) => {
          const pct      = calculateProgress(book.pagesRead, book.totalPages);
          const filled   = (pct / 100) * maxH;
          const cx       = PAD_H + i * groupW + groupW / 2;
          const bx       = cx - barW / 2;
          const isComp   = pct >= 100;
          const barColor = isComp ? COLORS.gold : (book.color || getBookColor(book.id));
          const maxChars = Math.max(Math.floor(groupW / (svgFs * 0.6)), 2);
          const label    = book.title.length > maxChars ? book.title.slice(0, maxChars) + '…' : book.title;

          return (
            <React.Fragment key={book.id}>
              <Rect x={bx} y={CHART_H - maxH} width={barW} height={maxH} fill={COLORS.barEmpty} rx={scale(4)} />
              {filled > 0 && <Rect x={bx} y={CHART_H - filled} width={barW} height={filled} fill={barColor} rx={scale(4)} />}
              {pct > 0 && <SvgText x={cx} y={CHART_H - filled - 4} fill={barColor} fontSize={svgFs} fontWeight="bold" textAnchor="middle">{pct}%</SvgText>}
              <SvgText x={cx} y={CHART_H + scale(14)} fill={COLORS.textSecondary} fontSize={svgFs} textAnchor="middle">{label}</SvgText>
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
        <Text style={styles.screenTitle}>Estadísticas</Text>

        {/* Tarjetas de métricas */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, styles.metricCardWide]}>
            <View style={styles.metricRow}>
              <Ionicons name="trending-up" size={scale(20)} color={COLORS.primary} />
              <Text style={styles.metricValue}>{avgProgress}%</Text>
            </View>
            <Text style={styles.metricLabel}>Promedio general</Text>
            <View style={styles.miniBarBg}>
              <View style={[styles.miniBarFill, { width: `${avgProgress}%` }]} />
            </View>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="trophy" size={scale(18)} color={COLORS.gold} style={{ marginBottom: scale(4) }} />
            <Text style={[styles.metricValue, { color: COLORS.gold }]}>{completed}</Text>
            <Text style={styles.metricLabel}>Completados</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="library-outline" size={scale(18)} color={COLORS.accent} style={{ marginBottom: scale(4) }} />
            <Text style={[styles.metricValue, { color: COLORS.accent }]}>{books.length}</Text>
            <Text style={styles.metricLabel}>Registrados</Text>
          </View>

          <View style={[styles.metricCard, styles.metricCardWide]}>
            <View style={styles.metricRow}>
              <Ionicons name="reader-outline" size={scale(20)} color={COLORS.textSecondary} />
              <Text style={styles.metricValue}>{totalRead.toLocaleString()}</Text>
            </View>
            <Text style={styles.metricLabel}>Páginas leídas de {totalPages.toLocaleString()}</Text>
          </View>
        </View>

        {/* Gráfica */}
        {books.length > 0 ? (
          <View style={styles.chartCard}>
            <View style={styles.chartHeader}>
              <View style={styles.chartTitleRow}>
                <Ionicons name="bar-chart-outline" size={scale(14)} color={COLORS.textSecondary} />
                <Text style={styles.sectionTitle}> PROGRESO POR LIBRO</Text>
              </View>
              <View style={styles.legend}>
                <View style={[styles.legendDot, { backgroundColor: COLORS.accent }]} />
                <Text style={styles.legendText}>{'<'}50%</Text>
                <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                <Text style={styles.legendText}>{'≥'}50%</Text>
                <View style={[styles.legendDot, { backgroundColor: COLORS.gold }]} />
                <Text style={styles.legendText}>100%</Text>
              </View>
            </View>
            {renderChart()}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="bar-chart-outline" size={scale(52)} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>Sin datos aún</Text>
            <Text style={styles.emptyHint}>Registra libros para ver tu progreso aquí</Text>
          </View>
        )}

        {/* Ranking */}
        {books.length > 0 && (
          <View style={styles.detailCard}>
            <View style={styles.chartTitleRow}>
              <Ionicons name="podium-outline" size={scale(14)} color={COLORS.textSecondary} />
              <Text style={styles.sectionTitle}> RANKING DE LIBROS</Text>
            </View>
            {books
              .slice()
              .sort((a, b) => calculateProgress(b.pagesRead, b.totalPages) - calculateProgress(a.pagesRead, a.totalPages))
              .map((book, i) => {
                const pct       = calculateProgress(book.pagesRead, book.totalPages);
                const isComp    = pct >= 100;
                const bookColor = book.color || getBookColor(book.id);
                const rankColor = i === 0 ? COLORS.gold : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : COLORS.textMuted;
                return (
                  <View key={book.id} style={[styles.detailRow, i === 0 && styles.detailRowFirst]}>
                    <View style={[styles.detailRank, { borderColor: rankColor + '44' }]}>
                      {i < 3
                        ? <Ionicons name="medal" size={scale(13)} color={rankColor} />
                        : <Text style={styles.detailRankText}>{i + 1}</Text>
                      }
                    </View>
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailTitle} numberOfLines={1}>{book.title}</Text>
                      <View style={styles.detailBarBg}>
                        <View style={[styles.detailBarFill, { width: `${pct}%`, backgroundColor: isComp ? COLORS.gold : bookColor }]} />
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
  scroll: { paddingHorizontal: isWatchScreen ? safeCircularPad : scale(20), paddingTop: scale(18), paddingBottom: scale(40) },
  screenTitle: { color: COLORS.text, fontSize: fontScale(20), fontWeight: '800', marginBottom: scale(14) },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: scale(10), marginBottom: scale(14) },
  metricCard: { flex: 1, minWidth: '45%', backgroundColor: COLORS.surface, borderRadius: scale(14), borderWidth: 1, borderColor: COLORS.border, padding: scale(14) },
  metricCardWide: { minWidth: '100%' },
  metricRow: { flexDirection: 'row', alignItems: 'center', gap: scale(8), marginBottom: 2 },
  metricValue: { color: COLORS.text, fontSize: fontScale(26), fontWeight: '900' },
  metricLabel: { color: COLORS.textSecondary, fontSize: fontScale(12) },
  miniBarBg: { height: scale(4), backgroundColor: COLORS.barEmpty, borderRadius: scale(2), marginTop: scale(8), overflow: 'hidden' },
  miniBarFill: { height: scale(4), backgroundColor: COLORS.primary, borderRadius: scale(2) },
  chartCard: { backgroundColor: COLORS.surface, borderRadius: scale(16), borderWidth: 1, borderColor: COLORS.border, padding: scale(14), marginBottom: scale(12) },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: scale(10) },
  chartTitleRow: { flexDirection: 'row', alignItems: 'center' },
  sectionTitle: { color: COLORS.textSecondary, fontSize: fontScale(10), fontWeight: '700', letterSpacing: 1.2 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: scale(4) },
  legendDot: { width: scale(7), height: scale(7), borderRadius: scale(4) },
  legendText: { color: COLORS.textSecondary, fontSize: fontScale(9) },
  detailCard: { backgroundColor: COLORS.surface, borderRadius: scale(16), borderWidth: 1, borderColor: COLORS.border, padding: scale(14) },
  detailRow: { flexDirection: 'row', alignItems: 'center', paddingTop: scale(10), borderTopWidth: 1, borderTopColor: COLORS.border, gap: scale(10) },
  detailRowFirst: { borderTopWidth: 0, paddingTop: scale(6) },
  detailRank: { width: scale(28), height: scale(28), borderRadius: scale(14), backgroundColor: COLORS.barEmpty, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.borderLight },
  detailRankText: { color: COLORS.textSecondary, fontSize: fontScale(10), fontWeight: '700' },
  detailInfo: { flex: 1 },
  detailTitle: { color: COLORS.text, fontSize: fontScale(13), fontWeight: '600', marginBottom: scale(4) },
  detailBarBg: { height: scale(4), backgroundColor: COLORS.barEmpty, borderRadius: scale(2), marginBottom: scale(3), overflow: 'hidden' },
  detailBarFill: { height: scale(4), borderRadius: scale(2) },
  detailPages: { color: COLORS.textSecondary, fontSize: fontScale(11) },
  detailPct: { color: COLORS.primary, fontSize: fontScale(14), fontWeight: '800' },
  emptyContainer: { alignItems: 'center', paddingVertical: scale(40), gap: scale(8) },
  emptyTitle: { color: COLORS.text, fontSize: fontScale(17), fontWeight: '700' },
  emptyHint: { color: COLORS.textSecondary, fontSize: fontScale(13), textAlign: 'center' },
});
