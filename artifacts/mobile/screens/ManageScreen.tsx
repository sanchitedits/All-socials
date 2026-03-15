import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Animated, { FadeIn, FadeOut, Layout } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { usePlatforms } from "@/context/PlatformsContext";

export default function ManageScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const theme = isDark ? Colors.dark : Colors.light;
  const insets = useSafeAreaInsets();

  const { platforms, addPlatform, removePlatform } = usePlatforms();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [nameError, setNameError] = useState("");
  const [urlError, setUrlError] = useState("");

  // This screen lives BELOW the MainNavigator header which has already
  // consumed insets.top — so we only need bottom inset here.
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const normalizeUrl = (raw: string): string => {
    const trimmed = raw.trim();
    if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
      return "https://" + trimmed;
    }
    return trimmed;
  };

  const validate = (): boolean => {
    let valid = true;
    if (!name.trim()) {
      setNameError("Platform name is required");
      valid = false;
    } else {
      setNameError("");
    }
    if (!url.trim()) {
      setUrlError("URL is required");
      valid = false;
    } else {
      const normalized = normalizeUrl(url);
      try {
        new URL(normalized);
        setUrlError("");
      } catch {
        setUrlError("Please enter a valid URL");
        valid = false;
      }
    }
    return valid;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      await addPlatform(name.trim(), normalizeUrl(url));
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setName("");
      setUrl("");
    } catch {
      Alert.alert("Error", "Failed to save platform. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id: string, platformName: string) => {
    Alert.alert(
      "Remove Platform",
      `Remove "${platformName}" from your tabs?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            await removePlatform(id);
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      {/* Section header — no top safe-area needed; parent header handles it */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: theme.surface,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <Text
          style={[
            styles.headerTitle,
            { color: theme.text, fontFamily: "Inter_700Bold" },
          ]}
        >
          Manage
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            { color: theme.textSecondary, fontFamily: "Inter_400Regular" },
          ]}
        >
          Add or remove messaging platforms
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottomPadding + 100 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Add Platform ── */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              { color: theme.textSecondary, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            ADD PLATFORM
          </Text>
          <View
            style={[
              styles.card,
              { backgroundColor: theme.surface, borderColor: theme.border },
            ]}
          >
            <View style={styles.inputGroup}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.textSecondary, fontFamily: "Inter_500Medium" },
                ]}
              >
                Platform Name
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: nameError ? theme.danger : theme.border,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
                placeholder="e.g. WhatsApp, Telegram"
                placeholderTextColor={theme.textSecondary}
                value={name}
                onChangeText={(t) => {
                  setName(t);
                  if (nameError) setNameError("");
                }}
                autoCorrect={false}
                returnKeyType="next"
              />
              {!!nameError && (
                <Text
                  style={[
                    styles.errorText,
                    { color: theme.danger, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  {nameError}
                </Text>
              )}
            </View>

            <View style={[styles.inputGroup, { marginTop: 16 }]}>
              <Text
                style={[
                  styles.inputLabel,
                  { color: theme.textSecondary, fontFamily: "Inter_500Medium" },
                ]}
              >
                URL
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    color: theme.text,
                    backgroundColor: theme.surfaceSecondary,
                    borderColor: urlError ? theme.danger : theme.border,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
                placeholder="https://..."
                placeholderTextColor={theme.textSecondary}
                value={url}
                onChangeText={(t) => {
                  setUrl(t);
                  if (urlError) setUrlError("");
                }}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                returnKeyType="done"
                onSubmitEditing={handleSave}
              />
              {!!urlError && (
                <Text
                  style={[
                    styles.errorText,
                    { color: theme.danger, fontFamily: "Inter_400Regular" },
                  ]}
                >
                  {urlError}
                </Text>
              )}
            </View>

            <Pressable
              onPress={handleSave}
              disabled={saving}
              style={({ pressed }) => [
                styles.saveButton,
                {
                  backgroundColor: theme.accent,
                  opacity: pressed || saving ? 0.7 : 1,
                  marginTop: 20,
                },
              ]}
            >
              {saving ? (
                <Text
                  style={[
                    styles.saveButtonText,
                    { fontFamily: "Inter_600SemiBold" },
                  ]}
                >
                  Saving...
                </Text>
              ) : (
                <>
                  <Feather name="plus" size={18} color="#FFF" />
                  <Text
                    style={[
                      styles.saveButtonText,
                      { fontFamily: "Inter_600SemiBold" },
                    ]}
                  >
                    Save Platform
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        </View>

        {/* ── Platform List ── */}
        <View style={styles.section}>
          <Text
            style={[
              styles.sectionLabel,
              { color: theme.textSecondary, fontFamily: "Inter_600SemiBold" },
            ]}
          >
            YOUR PLATFORMS ({platforms.length})
          </Text>

          {platforms.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <Feather name="inbox" size={32} color={theme.textSecondary} />
              <Text
                style={[
                  styles.emptyText,
                  {
                    color: theme.textSecondary,
                    fontFamily: "Inter_400Regular",
                  },
                ]}
              >
                No platforms yet. Add one above.
              </Text>
            </View>
          ) : (
            <View
              style={[
                styles.listCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              {platforms.map((platform, index) => (
                <Animated.View
                  key={platform.id}
                  entering={FadeIn.duration(200)}
                  exiting={FadeOut.duration(150)}
                  layout={Layout.springify()}
                >
                  <View
                    style={[
                      styles.platformRow,
                      index < platforms.length - 1 && {
                        borderBottomWidth: StyleSheet.hairlineWidth,
                        borderBottomColor: theme.separator,
                      },
                    ]}
                  >
                    <View
                      style={[
                        styles.platformIcon,
                        { backgroundColor: theme.accent + "20" },
                      ]}
                    >
                      <Text
                        style={[
                          styles.platformInitial,
                          { color: theme.accent, fontFamily: "Inter_700Bold" },
                        ]}
                      >
                        {platform.name.charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.platformInfo}>
                      <Text
                        style={[
                          styles.platformName,
                          {
                            color: theme.text,
                            fontFamily: "Inter_600SemiBold",
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {platform.name}
                      </Text>
                      <Text
                        style={[
                          styles.platformUrl,
                          {
                            color: theme.textSecondary,
                            fontFamily: "Inter_400Regular",
                          },
                        ]}
                        numberOfLines={1}
                      >
                        {platform.url}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDelete(platform.id, platform.name)}
                      style={styles.deleteBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Feather name="trash-2" size={18} color={theme.danger} />
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: 28,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 15,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: 0.8,
    marginBottom: 10,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
  },
  inputGroup: {},
  inputLabel: {
    fontSize: 13,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
    marginLeft: 2,
  },
  saveButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  emptyCard: {
    borderRadius: 16,
    padding: 32,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    textAlign: "center",
  },
  listCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  platformRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  platformIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  platformInitial: {
    fontSize: 18,
  },
  platformInfo: {
    flex: 1,
    gap: 2,
  },
  platformName: {
    fontSize: 15,
  },
  platformUrl: {
    fontSize: 12,
  },
  deleteBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
});
