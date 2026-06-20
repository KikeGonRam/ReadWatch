// Punto de entrada de ReadWatch v2
// Stack Navigator con estilo premium oscuro y sin autenticación
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import HomeScreen from './src/screens/HomeScreen';
import BookListScreen from './src/screens/BookListScreen';
import AddBookScreen from './src/screens/AddBookScreen';
import UpdateProgressScreen from './src/screens/UpdateProgressScreen';
import ProgressChartScreen from './src/screens/ProgressChartScreen';
import COLORS from './src/constants/colors';

const Stack = createStackNavigator();

// Opciones de header compartidas — estética minimalista oscura
const headerStyle = {
  headerStyle: {
    backgroundColor: COLORS.background,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTintColor: COLORS.primary,
  headerTitleStyle: {
    color: COLORS.text,
    fontWeight: '700',
    fontSize: 16,
    letterSpacing: 0.3,
  },
  headerBackTitleVisible: false,
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <StatusBar style="light" backgroundColor={COLORS.background} />
        <Stack.Navigator initialRouteName="Home" screenOptions={headerStyle}>
          <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name="BookList" component={BookListScreen} options={{ title: 'Biblioteca' }} />
          <Stack.Screen name="AddBook" component={AddBookScreen} options={{ title: 'Agregar libro' }} />
          <Stack.Screen name="UpdateProgress" component={UpdateProgressScreen} options={{ title: 'Actualizar progreso' }} />
          <Stack.Screen name="ProgressChart" component={ProgressChartScreen} options={{ title: 'Estadísticas' }} />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}
