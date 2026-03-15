import { Feather } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, useColorScheme } from "react-native";

import Colors from "@/constants/colors";
import { usePlatforms } from "@/context/PlatformsContext";
import ManageScreen from "@/screens/ManageScreen";
import WebViewScreen from "@/screens/WebViewScreen";

const Tab = createBottomTabNavigator();

const PLATFORM_ICONS: Record<string, string> = {
  instagram: "instagram",
  linkedin: "linkedin",
  x: "twitter",
  twitter: "twitter",
  facebook: "facebook",
  whatsapp: "message-circle",
  telegram: "send",
  discord: "message-square",
  slack: "slack",
  snapchat: "camera",
  tiktok: "music",
  youtube: "youtube",
};

function getPlatformIcon(name: string): string {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(PLATFORM_ICONS)) {
    if (key.includes(k)) return v;
  }
  return "message-circle";
}

export default function MainNavigator() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const { platforms, loading } = usePlatforms();

  if (loading) return null;

  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tab.Navigator
      lazy={false}
      screenOptions={{
        headerShown: false,
        unmountOnBlur: false,
        tabBarActiveTintColor: theme.tint,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS
            ? "transparent"
            : isDark
            ? "#1C1C1E"
            : "#FFFFFF",
          borderTopWidth: isWeb ? 1 : StyleSheet.hairlineWidth,
          borderTopColor: theme.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        tabBarLabelStyle: {
          fontFamily: "Inter_500Medium",
          fontSize: 10,
          marginTop: -2,
        },
      }}
    >
      {platforms.map((platform) => {
        const iconName = getPlatformIcon(platform.name);
        return (
          <Tab.Screen
            key={platform.id}
            name={platform.id}
            options={{
              title:
                platform.name.length > 9
                  ? platform.name.substring(0, 8) + "\u2026"
                  : platform.name,
              tabBarIcon: ({ color, size }) => (
                <Feather name={iconName as any} size={size} color={color} />
              ),
            }}
          >
            {() => (
              <WebViewScreen url={platform.url} name={platform.name} />
            )}
          </Tab.Screen>
        );
      })}

      <Tab.Screen
        name="__manage__"
        options={{
          title: "Manage",
          tabBarIcon: ({ color, size }) => (
            <Feather name="sliders" size={size} color={color} />
          ),
        }}
      >
        {() => <ManageScreen />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
