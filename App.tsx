import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

// Linking your screens
import GalleryScreen from './GalleryScreen';
import MainScreen from './MainScreen';
import MapScreen from './MapScreen';

const Tab = createMaterialTopTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        initialRouteName="Main" // Forces the Chatbot to open first
        screenOptions={{
          tabBarShowLabel: false,    // Keeps the look clean
          tabBarStyle: { height: 0 }, // Full-screen swipe experience
          swipeEnabled: true,        // Ensures swiping is active
        }}
      >
        <Tab.Screen name="Gallery" component={GalleryScreen} />
        <Tab.Screen name="Main" component={MainScreen} />
        <Tab.Screen name="Map" component={MapScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}