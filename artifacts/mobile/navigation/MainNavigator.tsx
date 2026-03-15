import { Ionicons } from "@expo/vector-icons";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { BlurView } from "expo-blur";
import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { usePlatforms } from "@/context/PlatformsContext";
import ManageScreen from "@/screens/ManageScreen";
import WebViewScreen from "@/screens/WebViewScreen";

const Tab = createMaterialTopTabNavigator();

type IoniconsName = React.ComponentProps<typeof Ionicons>["name"];

function getPlatformIcon(name: string): {
  default: IoniconsName;
  active: IoniconsName;
} {
  const key = name.toLowerCase();
  if (key.includes("instagram"))
    return { default: "logo-instagram", active: "logo-instagram" };
  if (key.includes("linkedin"))
    return { default: "logo-linkedin", active: "logo-linkedin" };
  if (key.includes("twitter") || key.trim() === "x")
    return { default: "logo-twitter", active: "logo-twitter" };
  if (key.includes("facebook"))
    return { default: "logo-facebook", active: "logo-facebook" };
  if (key.includes("whatsapp"))
    return { default: "logo-whatsapp", active: "logo-whatsapp" };
  if (key.includes("youtube"))
    return { default: "logo-youtube", active: "logo-youtube" };
  if (key.includes("tiktok"))
    return { default: "logo-tiktok", active: "logo-tiktok" };
  if (key.includes("snapchat"))
    return { default: "logo-snapchat", active: "logo-snapchat" };
  if (key.includes("reddit"))
    return { default: "logo-reddit", active: "logo-reddit" };
  if (key.includes("discord"))
    return { default: "logo-discord", active: "logo-discord" };
  if (key.includes("slack"))
    return { default: "logo-slack", active: "logo-slack" };
  if (key.includes("github"))
    return { default: "logo-github", active: "logo-github" };
  if (key.includes("telegram"))
    return { default: "paper-plane-outline", active: "paper-plane" };
  if (key.includes("message") || key.includes("chat"))
    return { default: "chatbubble-outline", active: "chatbubble" };
  return { default: "globe-outline", active: "globe" };
}

export default function MainNavigator() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const { platforms, loading } = usePlatforms();
  const [isFullscreen, setIsFullscreen] = useState(false);

  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";
  const topInset = isWeb ? 67 : insets.top;
  const bottomInset = isWeb ? 34 : insets.bottom;

  // Stable key: forces Tab.Navigator to remount cleanly whenever the platform
  // list changes (add/remove). This prevents the pager-view index from
  // desynchronising with the route list and causing the Manage tab to glitch.
  const navigatorKey = useMemo(
    () => platforms.map((p) => p.id).join("-"),
    [platforms]
  );

  // Tab bar visibility: use height:0/overflow:hidden instead of display:'none'
  // to avoid pager layout recalculation glitches.
  const tabBarStyle = useMemo(
    () =>
      isFullscreen
        ? ({ height: 0, overflow: "hidden" as const })
        : {
            backgroundColor: isIOS
              ? "transparent"
              : isDark
              ? "#1C1C1E"
              : "#FFFFFF",
            borderTopWidth: StyleSheet.hairlineWidth,
            borderTopColor: theme.border,
            elevation: 0,
            shadowOpacity: 0,
            height: 56 + bottomInset,
            paddingBottom: bottomInset,
          },
    [isFullscreen, isIOS, isDark, theme.border, bottomInset]
  );

  if (loading) return null;

  return (
    <View style={[styles.root, { backgroundColor: theme.background }]}>
      <StatusBar hidden={isFullscreen} style={isDark ? "light" : "dark"} />

      {/* App header — hidden in fullscreen */}
      {!isFullscreen && (
        <View
          style={[
            styles.header,
            {
              paddingTop: topInset,
              backgroundColor: isIOS
                ? "transparent"
                : isDark
                ? "#1C1C1E"
                : "#FFFFFF",
              borderBottomColor: theme.border,
            },
          ]}
        >
          {isIOS && (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          )}
          <Text
            style={[
              styles.headerTitle,
              { color: theme.text, fontFamily: "Inter_700Bold" },
            ]}
          >
            Message Hub
          </Text>
          <TouchableOpacity
            onPress={() => setIsFullscreen(true)}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            style={styles.headerBtn}
          >
            <Ionicons name="expand-outline" size={22} color={theme.tint} />
          </TouchableOpacity>
        </View>
      )}

      {/*
       * key={navigatorKey} — remounts the navigator on route changes so the
       * pager-view index stays in sync with the route list.
       * swipeEnabled disabled in fullscreen to prevent invisible tab switching.
       */}
      <Tab.Navigator
        key={navigatorKey}
        tabBarPosition="bottom"
        initialLayout={{ width: 390 }}
        screenOptions={({ route }) => {
          const platform = platforms.find((p) => p.id === route.name);
          const icons = platform
            ? getPlatformIcon(platform.name)
            : ({
                default: "settings-outline" as IoniconsName,
                active: "settings" as IoniconsName,
              });

          return {
            lazy: false,
            swipeEnabled: !isFullscreen,
            tabBarStyle,
            tabBarActiveTintColor: theme.tint,
            tabBarInactiveTintColor: theme.tabIconDefault,
            tabBarIndicatorStyle: {
              backgroundColor: theme.tint,
              top: 0,
              height: 2,
            },
            tabBarItemStyle: {
              paddingBottom: 0,
              height: 56,
            },
            tabBarLabelStyle: {
              fontFamily: "Inter_500Medium",
              fontSize: 10,
              marginTop: -4,
              textTransform: "none",
            },
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? icons.active : icons.default}
                size={22}
                color={color}
              />
            ),
            tabBarShowIcon: true,
          };
        }}
      >
        {platforms.map((platform) => (
          <Tab.Screen
            key={platform.id}
            name={platform.id}
            options={{
              title:
                platform.name.length > 9
                  ? platform.name.substring(0, 8) + "\u2026"
                  : platform.name,
            }}
          >
            {() => (
              <WebViewScreen
                url={platform.url}
                name={platform.name}
                isFullscreen={isFullscreen}
              />
            )}
          </Tab.Screen>
        ))}

        <Tab.Screen
          name="__manage__"
          options={{
            title: "Manage",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "settings" : "settings-outline"}
                size={22}
                color={color}
              />
            ),
          }}
        >
          {() => <ManageScreen />}
        </Tab.Screen>
      </Tab.Navigator>

      {/* Floating exit button — only visible in fullscreen */}
      {isFullscreen && (
        <Pressable
          onPress={() => setIsFullscreen(false)}
          style={({ pressed }) => [
            styles.exitFullscreenBtn,
            {
              top: topInset + 12,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.18)"
                : "rgba(0,0,0,0.14)",
              opacity: pressed ? 0.6 : 1,
            },
          ]}
        >
          <Ionicons
            name="contract-outline"
            size={20}
            color={isDark ? "#fff" : "#000"}
          />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 20,
    flex: 1,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  exitFullscreenBtn: {
    position: "absolute",
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
});
