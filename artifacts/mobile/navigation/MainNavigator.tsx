import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import React from "react";
import { Platform, StyleSheet, useColorScheme } from "react-native";

import Colors from "@/constants/colors";
import { usePlatforms } from "@/context/PlatformsContext";
import ManageScreen from "@/screens/ManageScreen";
import WebViewScreen from "@/screens/WebViewScreen";

const Tab = createBottomTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function getPlatformIcon(name: string): { default: IoniconsName; active: IoniconsName } {
  const key = name.toLowerCase();

  if (key.includes("instagram")) {
    return { default: "logo-instagram", active: "logo-instagram" };
  }
  if (key.includes("linkedin")) {
    return { default: "logo-linkedin", active: "logo-linkedin" };
  }
  if (key.includes("twitter") || key.includes(" x ") || key.trim() === "x") {
    return { default: "logo-twitter", active: "logo-twitter" };
  }
  if (key.includes("facebook")) {
    return { default: "logo-facebook", active: "logo-facebook" };
  }
  if (key.includes("whatsapp")) {
    return { default: "logo-whatsapp", active: "logo-whatsapp" };
  }
  if (key.includes("youtube")) {
    return { default: "logo-youtube", active: "logo-youtube" };
  }
  if (key.includes("tiktok")) {
    return { default: "logo-tiktok", active: "logo-tiktok" };
  }
  if (key.includes("snapchat")) {
    return { default: "logo-snapchat", active: "logo-snapchat" };
  }
  if (key.includes("reddit")) {
    return { default: "logo-reddit", active: "logo-reddit" };
  }
  if (key.includes("discord")) {
    return { default: "logo-discord", active: "logo-discord" };
  }
  if (key.includes("slack")) {
    return { default: "logo-slack", active: "logo-slack" };
  }
  if (key.includes("github")) {
    return { default: "logo-github", active: "logo-github" };
  }
  if (key.includes("telegram")) {
    return { default: "paper-plane-outline", active: "paper-plane" };
  }
  if (key.includes("message") || key.includes("chat")) {
    return { default: "chatbubble-outline", active: "chatbubble" };
  }

  return { default: "globe-outline", active: "globe" };
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
        const icons = getPlatformIcon(platform.name);
        const shortTitle =
          platform.name.length > 9
            ? platform.name.substring(0, 8) + "\u2026"
            : platform.name;

        return (
          <Tab.Screen
            key={platform.id}
            name={platform.id}
            options={{
              title: shortTitle,
              tabBarIcon: ({ color, size, focused }) => (
                <Ionicons
                  name={focused ? icons.active : icons.default}
                  size={size}
                  color={color}
                />
              ),
            }}
          >
            {() => <WebViewScreen url={platform.url} name={platform.name} />}
          </Tab.Screen>
        );
      })}

      <Tab.Screen
        name="__manage__"
        options={{
          title: "Manage",
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? "settings" : "settings-outline"}
              size={size}
              color={color}
            />
          ),
        }}
      >
        {() => <ManageScreen />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
