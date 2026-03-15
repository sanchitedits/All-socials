import { Feather } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";

import Colors from "@/constants/colors";

type Props = {
  url: string;
  name: string;
  // When true the screen fills the full display — safe-area padding is needed.
  // When false the MainNavigator header above already consumes insets.top.
  isFullscreen?: boolean;
};

export default function WebViewScreen({ url, name, isFullscreen = false }: Props) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);
  const [loading, setLoading] = useState(true);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // In fullscreen the MainNavigator header is hidden so this screen fills the
  // display from y=0 — we must add the safe-area top ourselves.
  // Otherwise the parent header already consumed insets.top, so just use a
  // small fixed gap for visual breathing room.
  const topPadding = isFullscreen
    ? (Platform.OS === "web" ? 67 : insets.top)
    : 0;

  useFocusEffect(
    useCallback(() => {
      if (Platform.OS !== "android") return;

      const handler = BackHandler.addEventListener("hardwareBackPress", () => {
        if (canGoBack) {
          webViewRef.current?.goBack();
          return true;
        }
        return false;
      });

      return () => handler.remove();
    }, [canGoBack])
  );

  if (Platform.OS === "web") {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View
          style={[
            styles.header,
            {
              backgroundColor: theme.surface,
              borderBottomColor: theme.border,
              paddingTop: topPadding + 12,
            },
          ]}
        >
          <Text
            style={[
              styles.headerTitle,
              { color: theme.text, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            {name}
          </Text>
        </View>
        <View
          style={[styles.webFallback, { backgroundColor: theme.background }]}
        >
          <Feather name="monitor" size={48} color={theme.textSecondary} />
          <Text
            style={[
              styles.webFallbackTitle,
              { color: theme.text, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            Open on mobile
          </Text>
          <Text
            style={[
              styles.webFallbackText,
              { color: theme.textSecondary, fontFamily: "Inter_400Regular" },
            ]}
          >
            WebView is available on iOS and Android only. Scan the QR code to
            open this app on your phone.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
            paddingTop: insets.top + 12,
          },
        ]}
      >
        <View style={styles.headerNav}>
          <Pressable
            onPress={() => webViewRef.current?.goBack()}
            disabled={!canGoBack}
            style={({ pressed }) => [
              styles.navBtn,
              { opacity: pressed ? 0.5 : canGoBack ? 1 : 0.3 },
            ]}
          >
            <Feather name="chevron-left" size={24} color={theme.tint} />
          </Pressable>
          <Pressable
            onPress={() => webViewRef.current?.goForward()}
            disabled={!canGoForward}
            style={({ pressed }) => [
              styles.navBtn,
              { opacity: pressed ? 0.5 : canGoForward ? 1 : 0.3 },
            ]}
          >
            <Feather name="chevron-right" size={24} color={theme.tint} />
          </Pressable>
        </View>

        <Text
          style={[
            styles.headerTitle,
            { color: theme.text, fontFamily: "Inter_600SemiBold" },
          ]}
          numberOfLines={1}
        >
          {name}
        </Text>

        <Pressable
          onPress={() => webViewRef.current?.reload()}
          style={({ pressed }) => [
            styles.navBtn,
            { opacity: pressed ? 0.5 : 1 },
          ]}
        >
          <Feather name="refresh-cw" size={20} color={theme.tint} />
        </Pressable>
      </View>

      {loading && !error && (
        <View
          style={[
            styles.loadingOverlay,
            { backgroundColor: theme.background },
          ]}
        >
          <ActivityIndicator size="large" color={theme.tint} />
          <Text
            style={[
              styles.loadingText,
              { color: theme.textSecondary, fontFamily: "Inter_400Regular" },
            ]}
          >
            Loading {name}...
          </Text>
        </View>
      )}

      {error ? (
        <View
          style={[
            styles.errorContainer,
            { backgroundColor: theme.background },
          ]}
        >
          <Feather name="wifi-off" size={48} color={theme.textSecondary} />
          <Text
            style={[
              styles.errorTitle,
              { color: theme.text, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            Unable to load
          </Text>
          <Text
            style={[
              styles.errorText,
              { color: theme.textSecondary, fontFamily: "Inter_400Regular" },
            ]}
          >
            {error}
          </Text>
          <Pressable
            onPress={() => {
              setError(null);
              webViewRef.current?.reload();
            }}
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: theme.tint, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Text style={[styles.retryText, { fontFamily: "Inter_600SemiBold" }]}>
              Try Again
            </Text>
          </Pressable>
        </View>
      ) : (
        <WebView
          ref={webViewRef}
          source={{ uri: url }}
          style={styles.webview}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
          onError={(e) => {
            setLoading(false);
            setError(e.nativeEvent.description || "Failed to load page");
          }}
          onNavigationStateChange={(navState) => {
            setCanGoBack(navState.canGoBack);
            setCanGoForward(navState.canGoForward);
          }}
          sharedCookiesEnabled
          thirdPartyCookiesEnabled
          domStorageEnabled
          javaScriptEnabled
          allowsInlineMediaPlayback
          mediaPlaybackRequiresUserAction={false}
          userAgent="Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerNav: {
    flexDirection: "row",
    gap: 4,
  },
  headerTitle: {
    fontSize: 17,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 8,
  },
  navBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  webview: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    top: 80,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    zIndex: 10,
  },
  loadingText: {
    fontSize: 15,
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  errorTitle: {
    fontSize: 20,
    marginTop: 8,
  },
  errorText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  retryButton: {
    marginTop: 8,
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  retryText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  webFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
    gap: 12,
  },
  webFallbackTitle: {
    fontSize: 20,
    marginTop: 8,
  },
  webFallbackText: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
  },
});
