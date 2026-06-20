// Punto de entrada principal de ReadWatch
// Configura React Navigation con un Stack Navigator para todas las pantallas
// No hay login ni registro de usuario — acceso directo a la app
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Importar todas las pantallas de la aplicación
import HomeScreen from './src/screens/HomeScreen';
import BookListScreen from './src/screens/BookListScreen';
import AddBookScreen from './src/screens/AddBookScreen';
import UpdateProgressScreen from './src/screens/UpdateProgressScreen';
import ProgressChartScreen from './src/screens/ProgressChartScreen';

// Importar paleta de colores para el header de navegación
import COLORS from './src/constants/colors';

// Crear el Stack Navigator de React Navigation
const Stack = createStackNavigator();

// Opciones de header compartidas para todas las pantallas
// Mantiene el estilo oscuro coherente con la estética de smartwatch
const sharedHeaderOptions = {
  headerStyle: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTintColor: COLORS.primary,
  headerTitleStyle: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 17,
  },
  headerBackTitleVisible: false,
};

/**
 * App — Componente raíz que configura la navegación de ReadWatch.
 * Usa NavigationContainer y Stack Navigator sin autenticación.
 * La pantalla inicial siempre es HomeScreen.
 */
export default function App() {
  return (
    // GestureHandlerRootView es requerido por @react-navigation/stack
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={COLORS.background} />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={sharedHeaderOptions}
        >
          {/* Pantalla principal: caratula del reloj */}
          <Stack.Screen
            name="Home"
            component={HomeScreen}
            options={{ headerShown: false }}
          />

          {/* Lista de todos los libros registrados */}
          <Stack.Screen
            name="BookList"
            component={BookListScreen}
            options={{ title: 'Mis Libros' }}
          />

          {/* Formulario para registrar un nuevo libro */}
          <Stack.Screen
            name="AddBook"
            component={AddBookScreen}
            options={{ title: 'Agregar Libro' }}
          />

          {/* Actualizar páginas leídas de un libro específico */}
          <Stack.Screen
            name="UpdateProgress"
            component={UpdateProgressScreen}
            options={{ title: 'Actualizar Progreso' }}
          />

          {/* Gráfica de progreso general de todos los libros */}
          <Stack.Screen
            name="ProgressChart"
            component={ProgressChartScreen}
            options={{ title: 'Mi Progreso' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
