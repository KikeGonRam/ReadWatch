// Hook centralizado para gestión del estado de libros
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { loadData, saveData } from '../utils/storage';

export const useBooks = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    const data = await loadData();
    setBooks(data);
    setLoading(false);
  }, []);

  // Envolver en callback síncrono para evitar que useFocusEffect reciba una Promise
  useFocusEffect(
    useCallback(() => {
      reload();
      // Sin return: useFocusEffect no necesita cleanup aquí
    }, [reload])
  );

  const removeBook = useCallback(async (bookId) => {
    const updated = books.filter((b) => b.id !== bookId);
    setBooks(updated);
    await saveData(updated);
  }, [books]);

  return { books, loading, reload, removeBook };
};
