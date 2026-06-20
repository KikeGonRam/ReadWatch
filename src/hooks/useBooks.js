// Hook centralizado para gestión del estado de libros
// Evita duplicar lógica de carga/guardado en cada pantalla
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { loadData, saveData } from '../utils/storage';

/**
 * useBooks — Hook personalizado que expone la lista de libros y funciones CRUD.
 * Se recarga automáticamente cada vez que la pantalla recibe el foco.
 *
 * @returns {{ books, loading, reload, removeBook }} Estado y acciones sobre libros
 */
export const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar libros desde AsyncStorage al enfocar la pantalla
  const reload = useCallback(async () => {
    setLoading(true);
    const data = await loadData();
    setBooks(data);
    setLoading(false);
  }, []);

  useFocusEffect(reload);

  /**
   * Elimina un libro por su id y persiste el cambio.
   * @param {number} bookId - ID del libro a eliminar
   */
  const removeBook = useCallback(async (bookId) => {
    const updated = books.filter((b) => b.id !== bookId);
    setBooks(updated);
    await saveData(updated);
  }, [books]);

  return { books, loading, reload, removeBook };
};
