import { useEffect, useRef } from "react";
import { Animated } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuthSession } from "../data/authStore";
import { friendsZoneTheme } from "../theme";

export const unstable_settings = {
  initialRouteName: "buscar",
};

function TabIcon({
  focused,
  color,
  size,
  activeName,
  inactiveName,
}: {
  focused: boolean;
  color: string;
  size: number;
  activeName: keyof typeof Ionicons.glyphMap;
  inactiveName: keyof typeof Ionicons.glyphMap;
}) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.92)).current;
  const translateY = useRef(new Animated.Value(focused ? -1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: focused ? 1.06 : 0.92,
        friction: 7,
        tension: 150,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: focused ? -1 : 0,
        friction: 8,
        tension: 140,
        useNativeDriver: true,
      }),
    ]).start();
  }, [focused, scale, translateY]);

  return (
    <Animated.View style={{ transform: [{ scale }, { translateY }] }}>
      <Ionicons name={focused ? activeName : inactiveName} size={size} color={color} />
    </Animated.View>
  );
}

export default function Layout() {
  const session = useAuthSession();

  if (!session.isInitialized) {
    return null;
  }

  if (!session.user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      initialRouteName="buscar"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: friendsZoneTheme.colors.secondary,
        tabBarInactiveTintColor: friendsZoneTheme.colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600", marginTop: -1 },
        tabBarItemStyle: { borderRadius: 12 },
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 12,
          height: 66,
          borderTopWidth: 0,
          borderRadius: 22,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: friendsZoneTheme.colors.surface,
          elevation: 10,
          shadowColor: "#7C5338",
          shadowOpacity: 0.14,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: 4 },
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Lista",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused} color={color} size={size} activeName="reorder-four" inactiveName="reorder-four-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="locais"
        options={{
          title: "Meus encontros",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused} color={color} size={size} activeName="calendar" inactiveName="calendar-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="buscar"
        options={{
          title: "Mapa",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused} color={color} size={size} activeName="map" inactiveName="map-outline" />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon
              focused={focused}
              color={color}
              size={size}
              activeName="person-circle"
              inactiveName="person-circle-outline"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: "Menu",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon focused={focused} color={color} size={size} activeName="menu" inactiveName="menu-outline" />
          ),
        }}
      />
    </Tabs>
  );
}
