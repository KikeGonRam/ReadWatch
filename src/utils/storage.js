// Módulo de persistencia local con AsyncStorage
// Gestiona guardar y cargar la lista de libros en el dispositivo
import AsyncStorage from '@react-native-async-storage/async-storage';

// Clave usada para identificar los datos en AsyncStorage
const STORAGE_KEY = 'readwatch_books';

/**
 * Guarda el array de libros en AsyncStorage.
 * Serializa el array a JSON antes de almacenarlo.
 *
 * @param {Array} books - Array de objetos libro a persistir
 * @returns {Promise<void>}
 * Manejo de errores: try-catch con console.error si falla la escritura
 */
export const saveData = async (books) => {
  try {
    const json = JSON.stringify(books);
    await AsyncStorage.setItem(STORAGE_KEY, json);
  } catch (error) {
    // Si falla el guardado se registra el error pero no se interrumpe la app
    console.error('Error al guardar datos en AsyncStorage:', error);
  }
};

/**
 * Carga el array de libros desde AsyncStorage.
 * Deserializa el JSON almacenado y retorna el array.
 *
 * @returns {Promise<Array>} Array de libros; retorna [] si no existe o falla
 * Manejo de errores: try-catch con fallback a array vacío
 */
export const loadData = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    // Si no hay datos guardados, retorna array vacío como valor por defecto
    if (json === null) return [];
    return JSON.parse(json);
  } catch (error) {
    // Si falla la lectura o el parseo, retorna array vacío para no romper la app
    console.error('Error al cargar datos desde AsyncStorage:', error);
    return [];
  }
};
