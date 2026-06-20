// Módulo de persistencia local — libros y meta diaria
import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKS_KEY = 'readwatch_books';
const GOAL_KEY  = 'readwatch_daily_goal';

/**
 * Guarda el array de libros en AsyncStorage.
 * @param {Array} books
 */
export const saveData = async (books) => {
  try {
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  } catch (e) {
    console.error('saveData error:', e);
  }
};

/**
 * Carga el array de libros desde AsyncStorage.
 * @returns {Promise<Array>} [] si falla o no existe
 */
export const loadData = async () => {
  try {
    const json = await AsyncStorage.getItem(BOOKS_KEY);
    return json ? JSON.parse(json) : [];
  } catch (e) {
    console.error('loadData error:', e);
    return [];
  }
};

/**
 * Guarda la meta diaria de páginas.
 * @param {number} goal
 */
export const saveDailyGoal = async (goal) => {
  try {
    await AsyncStorage.setItem(GOAL_KEY, String(goal));
  } catch (e) {
    console.error('saveDailyGoal error:', e);
  }
};

/**
 * Carga la meta diaria de páginas.
 * @returns {Promise<number>} 0 si no está configurada
 */
export const loadDailyGoal = async () => {
  try {
    const val = await AsyncStorage.getItem(GOAL_KEY);
    return val ? parseInt(val, 10) : 0;
  } catch (e) {
    console.error('loadDailyGoal error:', e);
    return 0;
  }
};
