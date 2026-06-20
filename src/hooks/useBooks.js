// Hook centralizado — libros y meta diaria
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { loadData, saveData, loadDailyGoal, saveDailyGoal } from '../utils/storage';

export const useBooks = () => {
  const [books, setBooks]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dailyGoal, setDailyGoal] = useState(0);

  const reload = useCallback(async () => {
    setLoading(true);
    const [data, goal] = await Promise.all([loadData(), loadDailyGoal()]);
    setBooks(data);
    setDailyGoal(goal);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => { reload(); }, [reload])
  );

  const removeBook = useCallback(async (bookId) => {
    const updated = books.filter((b) => b.id !== bookId);
    setBooks(updated);
    await saveData(updated);
  }, [books]);

  /**
   * Actualiza y persiste la meta diaria de páginas.
   * @param {number} goal
   */
  const updateDailyGoal = useCallback(async (goal) => {
    setDailyGoal(goal);
    await saveDailyGoal(goal);
  }, []);

  return { books, loading, dailyGoal, reload, removeBook, updateDailyGoal };
};
