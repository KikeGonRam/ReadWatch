// Pantalla de gráfica de progreso general de todos los libros
// Usa react-native-svg para renderizar barras de progreso visuales
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Svg, { Rect, Text as SvgText } from 'react-native-svg';
import COLORS from '../constants/colors';
import { loadData } from '../utils/storage';
import { calculateProgress } from '../utils/helpers';

const { width } = Dimensions.get('window');

// Dimensiones de la gráfica de barras
const CHART_HEIGHT = 180;
const CHART_PADDING_H = 32;
const CHART_WIDTH = width - 40;

/**
 * ProgressChartScreen — Gráfica de barras con el progreso de cada libro.
 * Usa react-native-svg (incluida en Expo 54) para renderizar las barras.
 * Colores: barra llena verde (#00FF88), vacía gris (#333333).
 *
 * @param {object} navigation - Objeto de navegación de React Navigation
 */
export default function ProgressChartScreen({ navigation }) {
  const [books, setBooks] = useState([]);

  // Cargar libros al enfocar la pantalla
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
   * renderProgressChart — Construye la gráfica SVG de barras de progreso.
   * Cada barra representa un libro: barra gris = total, barra verde = leído.
   * Las etiquetas muestran el título truncado debajo de cada barra.
   *
   * @returns {JSX.Element} Elemento SVG con todas las barras de progreso
   */
  const renderProgressChart = () => {
    if (books.length === 0) return null;

    // Calcular el ancho de cada barra según cuántos libros hay
    const totalBars = books.length;
    const availableWidth = CHART_WIDTH - CHART_PADDING_H * 2;
    const barGroupWidth = availableWidth / totalBars;
    // La barra ocupa 70% del grupo, el resto es espacio entre barras
    const barWidth = Math.max(barGroupWidth * 0.7, 12);

    return (
      <Svg width={CHART_WIDTH} height={CHART_HEIGHT + 40}>
        {books.map((book, index) => {
          const percent = calculateProgress(book.pagesRead, book.totalPages);
          // Altura máxima disponible para las barras
          const maxBarHeight = CHART_HEIGHT - 20;
          // Altura de la barra llena proporcional al porcentaje
          const filledHeight = (percent / 100) * maxBarHeight;

          // Posición X del centro de este grupo de barras
          const centerX = CHART_PADDING_H + index * barGroupWidth + barGroupWidth / 2;
          const barX = centerX - barWidth / 2;
          // Las barras crecen hacia arriba desde la base
          const baseY = CHART_HEIGHT;
          const filledY = baseY - filledHeight;

          // Truncar título para que quepa en el espacio disponible
          const labelMaxChars = Math.floor(barGroupWidth / 6.5);
          const label =
            book.title.length > labelMaxChars
              ? book.title.substring(0, labelMaxChars) + '…'
              : book.title;

          return (
            <React.Fragment key={book.id}>
              {/* Barra gris de fondo (total de páginas) */}
              <Rect
                x={barX}
                y={baseY - maxBarHeight}
                width={barWidth}
                height={maxBarHeight}
                fill={COLORS.barEmpty}
                rx={4}
              />
              {/* Barra verde del progreso actual (páginas leídas) */}
              {filledHeight > 0 && (
                <Rect
                  x={barX}
                  y={filledY}
                  width={barWidth}
                  height={filledHeight}
                  fill={COLORS.primary}
                  rx={4}
                />
              )}
              {/* Porcentaje encima de la barra */}
              <SvgText
                x={centerX}
                y={filledY - 4}
                fill={COLORS.primary}
                fontSize={10}
                fontWeight="bold"
                textAnchor="middle"
              >
                {percent > 0 ? `${percent}%` : ''}
              </SvgText>
              {/* Título del libro debajo del eje X */}
              <SvgText
                x={centerX}
                y={CHART_HEIGHT + 16}
                fill={COLORS.textSecondary}
                fontSize={9}
                textAnchor="middle"
              >
                {label}
              </SvgText>
            </React.Fragment>
          );
        })}
      </Svg>
    );
  };

  // Calcular estadísticas globales para mostrar en las tarjetas superiores
  const completedBooks = books.filter(
    (b) => calculateProgress(b.pagesRead, b.totalPages) >= 100
  ).length;

  const avgProgress =
    books.length > 0
      ? parseFloat(
          (
            books.reduce(
              (acc, b) => acc + calculateProgress(b.pagesRead, b.totalPages),
              0
            ) / books.length
          ).toFixed(1)
        )
      : 0;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.screenTitle}>Progreso General</Text>

        {/* Tarjetas de estadísticas globales */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{books.length}</Text>
            <Text style={styles.statLabel}>Libros</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{completedBooks}</Text>
            <Text style={styles.statLabel}>Completos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={[styles.statValue, { color: COLORS.primary }]}>
              {avgProgress}%
            </Text>
            <Text style={styles.statLabel}>Promedio</Text>
          </View>
        </View>

        {/* Gráfica de barras SVG o mensaje vacío */}
        {books.length > 0 ? (
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Progreso por libro</Text>
            {renderProgressChart()}
          </View>
        ) : (
          // Mensaje cuando no hay libros, evita pantalla en blanco
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyText}>Sin datos para mostrar</Text>
            <Text style={styles.emptyHint}>Registra libros para ver tu progreso</Text>
          </View>
        )}

        {/* Lista detallada de cada libro con su porcentaje */}
        {books.length > 0 && (
          <View style={styles.detailList}>
            <Text style={styles.chartTitle}>Detalle por libro</Text>
            {books.map((book) => {
              const pct = calculateProgress(book.pagesRead, book.totalPages);
              return (
                <View key={book.id} style={styles.detailRow}>
                  <View style={styles.detailInfo}>
                    <Text style={styles.detailTitle} numberOfLines={1}>
                      {book.title}
                    </Text>
                    <Text style={styles.detailPages}>
                      {book.pagesRead} / {book.totalPages} págs.
                    </Text>
                  </View>
                  <Text style={styles.detailPercent}>{pct}%</Text>
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
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  screenTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 18,
  },
  // Fila de tarjetas de estadísticas globales
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.watchFace,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingVertical: 14,
    alignItems: 'center',
  },
  statValue: {
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '800',
  },
  statLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  // Contenedor de la gráfica SVG
  chartContainer: {
    backgroundColor: COLORS.watchFace,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  chartTitle: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  // Estado vacío cuando no hay libros
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
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
  detailList: {
    backgroundColor: COLORS.watchFace,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  detailInfo: {
    flex: 1,
    marginRight: 12,
  },
  detailTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  detailPages: {
    color: COLORS.textSecondary,
    fontSize: 12,
    marginTop: 2,
  },
  detailPercent: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
  },
});
