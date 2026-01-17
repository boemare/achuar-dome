import React from 'react';
import { StyleSheet, View } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import MapScreen from '../screens/map/MapScreen';
import ChatScreen from '../screens/chat/ChatScreen';
import GalleryScreen from '../screens/gallery/GalleryScreen';
import { MainTabParamList } from './types';
import { colors } from '../constants/colors';

const Tab = createMaterialTopTabNavigator<MainTabParamList>();

// Custom SVG Icons
const MapIcon = ({ color, size = 26 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C8.13 2 5 5.13 5 9C5 14.25 12 22 12 22C12 22 19 14.25 19 9C19 5.13 15.87 2 12 2Z"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="12" cy="9" r="2.5" fill={color} />
  </Svg>
);

const ChatIcon = ({ color, size = 26 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M21 11.5C21 16.75 16.75 21 11.5 21C9.94 21 8.47 20.62 7.18 19.95L3 21L4.05 16.82C3.38 15.53 3 14.06 3 12.5C3 7.25 7.25 3 12.5 3C17.75 3 22 7.25 22 12.5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx="8.5" cy="12" r="1" fill={color} />
    <Circle cx="12" cy="12" r="1" fill={color} />
    <Circle cx="15.5" cy="12" r="1" fill={color} />
  </Svg>
);

const GalleryIcon = ({ color, size = 26 }: { color: string; size?: number }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="3"
      stroke={color}
      strokeWidth={2}
    />
    <Circle cx="8.5" cy="8.5" r="2" fill={color} />
    <Path
      d="M21 15L16 10L11 15"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M14 18L10 14L3 21"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

interface TabIconProps {
  focused: boolean;
  icon: 'map' | 'chat' | 'gallery';
}

const TabIcon = ({ focused, icon }: TabIconProps) => {
  const color = focused ? colors.tabBarActive : colors.tabBarInactive;
  const iconSize = 26;

  const icons = {
    map: <MapIcon color={color} size={iconSize} />,
    chat: <ChatIcon color={color} size={iconSize} />,
    gallery: <GalleryIcon color={color} size={iconSize} />,
  };

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      {icons[icon]}
      {focused && <View style={styles.activeIndicator} />}
    </View>
  );
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      initialRouteName="Chat"
      tabBarPosition="bottom"
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: styles.tabBar,
        tabBarIndicatorStyle: styles.tabIndicator,
        tabBarPressColor: 'transparent',
        tabBarPressOpacity: 0.7,
        swipeEnabled: true,
        animationEnabled: true,
      }}
    >
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="map" />,
        }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="chat" />,
        }}
      />
      <Tab.Screen
        name="Gallery"
        component={GalleryScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="gallery" />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.tabBarBackground,
    elevation: 0,
    shadowColor: colors.shadowDark,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    borderTopWidth: 0,
    height: 70,
    paddingBottom: 8,
  },
  tabIndicator: {
    backgroundColor: 'transparent',
    height: 0,
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  iconContainerActive: {
    transform: [{ scale: 1.05 }],
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.tabBarActive,
  },
});
