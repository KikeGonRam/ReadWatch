// Funciones auxiliares de lógica de negocio para ReadWatch
// Incluye registro de libros, actualización de progreso y cálculo de porcentaje
import { Alert } from 'react-native';
import { saveData, loadData } from './storage';

/**
 * Calcula el porcentaje de páginas leídas respecto al total.
 *
 * @param {number} pagesRead - Páginas ya leídas
 * @param {number} totalPages - Total de páginas del libro
 * @returns {number} Porcentaje entre 0 y 100 con 2 decimales
 * Manejo de errores: retorna 0 si totalPages es 0 para evitar división por cero
 */
export const calculateProgress = (pagesRead, totalPages) => {
  // Evitar división por cero cuando el total es 0 o indefinido
  if (!totalPages || totalPages === 0) return 0;
  const percent = (pagesRead / totalPages) * 100;
  return parseFloat(percent.toFixed(2));
};

/**
 * Registra un nuevo libro en el almacenamiento local.
 * Valida que los campos no estén vacíos y que totalPages sea positivo.
 *
 * @param {string} title - Título del libro
 * @param {string} author - Autor del libro
 * @param {string|number} totalPages - Total de páginas (se convierte a número)
 * @returns {Promise<Object|null>} Objeto libro creado o null si la validación falla
 * Manejo de errores: Alert para campos vacíos o páginas inválidas
 */
export const registerBook = async (title, author, totalPages) => {
  // Validación: ningún campo puede estar vacío
  if (!title.trim() || !author.trim() || !totalPages.toString().trim()) {
    Alert.alert('Campos incompletos', 'Por favor completa todos los campos');
    return null;
  }

  const pages = parseInt(totalPages, 10);

  // Validación: totalPages debe ser un número válido
  if (isNaN(pages)) {
    Alert.alert('Error', 'Por favor completa todos los campos');
    return null;
  }

  // Validación: totalPages debe ser un número positivo mayor a cero
  if (pages <= 0) {
    Alert.alert('Error', 'Por favor completa todos los campos');
    return null;
  }

  // Crear objeto libro con id único basado en timestamp
  const newBook = {
    id: Date.now(),
    title: title.trim(),
    author: author.trim(),
    totalPages: pages,
    pagesRead: 0,
    createdAt: new Date().toISOString(),
  };

  // Cargar libros existentes, agregar el nuevo y guardar
  const existingBooks = await loadData();
  const updatedBooks = [...existingBooks, newBook];
  await saveData(updatedBooks);

  return newBook;
};

/**
 * Actualiza el progreso de páginas leídas de un libro existente.
 * Valida que el valor no supere el total de páginas.
 *
 * @param {number} bookId - ID único del libro a actualizar
 * @param {string|number} pagesRead - Nueva cantidad de páginas leídas
 * @param {Array} books - Array actual de libros
 * @returns {Promise<Array|null>} Array actualizado de libros o null si falla validación
 * Manejo de errores: Alert si páginas > total o valor inválido
 */
export const updateProgress = async (bookId, pagesRead, books) => {
  const pages = parseInt(pagesRead, 10);

  // Validación: debe ser un número válido y positivo
  if (isNaN(pages) || pages < 0) {
    Alert.alert('Error', 'Por favor ingresa un número válido de páginas');
    return null;
  }

  // Encontrar el libro correspondiente en el array
  const book = books.find((b) => b.id === bookId);
  if (!book) {
    Alert.alert('Error', 'Libro no encontrado');
    return null;
  }

  // Validación: las páginas leídas no pueden superar el total del libro
  if (pages > book.totalPages) {
    Alert.alert('Error', 'El número de páginas no puede superar el total');
    return null;
  }

  // Actualizar el libro en el array manteniendo el resto intacto
  const updatedBooks = books.map((b) =>
    b.id === bookId ? { ...b, pagesRead: pages } : b
  );

  await saveData(updatedBooks);

  // Confirmar al usuario que el progreso fue guardado correctamente
  Alert.alert('¡Listo!', 'Progreso actualizado correctamente');

  return updatedBooks;
};
