// Lógica de negocio — registro, progreso, cálculos
import { Alert } from 'react-native';
import { saveData, loadData } from './storage';

/**
 * Calcula porcentaje de progreso con 2 decimales.
 * Retorna 0 si totalPages es 0 para evitar división por cero.
 */
export const calculateProgress = (pagesRead, totalPages) => {
  if (!totalPages || totalPages === 0) return 0;
  return parseFloat(((pagesRead / totalPages) * 100).toFixed(2));
};

/**
 * Registra un nuevo libro. Valida campos y guarda en AsyncStorage.
 * Ahora acepta un campo opcional de notas.
 *
 * @param {string} title
 * @param {string} author
 * @param {string|number} totalPages
 * @param {string} notes - Notas opcionales del lector
 * @returns {Promise<Object|null>}
 */
export const registerBook = async (title, author, totalPages, notes = '') => {
  if (!title.trim() || !author.trim() || !totalPages.toString().trim()) {
    Alert.alert('Campos incompletos', 'Por favor completa todos los campos');
    return null;
  }

  const pages = parseInt(totalPages, 10);

  if (isNaN(pages) || pages <= 0) {
    Alert.alert('Error', 'El número de páginas debe ser un valor positivo');
    return null;
  }

  const newBook = {
    id: Date.now(),
    title: title.trim(),
    author: author.trim(),
    totalPages: pages,
    pagesRead: 0,
    notes: notes.trim(),
    createdAt: new Date().toISOString(),
  };

  const existing = await loadData();
  await saveData([...existing, newBook]);
  return newBook;
};

/**
 * Actualiza páginas leídas y notas de un libro.
 * Valida que pagesRead no supere totalPages.
 *
 * @param {number} bookId
 * @param {string|number} pagesRead
 * @param {Array} books - Array completo actual
 * @param {string} notes - Notas actualizadas (opcional)
 * @returns {Promise<Array|null>}
 */
export const updateProgress = async (bookId, pagesRead, books, notes) => {
  const pages = parseInt(pagesRead, 10);

  if (isNaN(pages) || pages < 0) {
    Alert.alert('Error', 'Por favor ingresa un número válido de páginas');
    return null;
  }

  const book = books.find((b) => b.id === bookId);
  if (!book) { Alert.alert('Error', 'Libro no encontrado'); return null; }

  if (pages > book.totalPages) {
    Alert.alert('Error', 'El número de páginas no puede superar el total');
    return null;
  }

  const updatedBooks = books.map((b) =>
    b.id === bookId
      ? { ...b, pagesRead: pages, notes: notes !== undefined ? notes.trim() : b.notes }
      : b
  );

  await saveData(updatedBooks);
  Alert.alert('¡Listo!', 'Progreso actualizado correctamente');
  return updatedBooks;
};
