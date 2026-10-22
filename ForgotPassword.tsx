
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";

import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { resetPassword } from "./services/auth";

import { typography, spacing } from "./theme";
import { useTheme } from "./theme/ThemeContext";
import type { ThemeColors } from "./theme/colors";

export default function ForgotPassword({
  navigation,
  route,
}: any) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const from = route?.params?.from;

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleReset() {
    if (isLoading) return;

    setMessage("");
    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setIsLoading(true);

      const success = await resetPassword(trimmedEmail);

      if (success) {
        setMessage(
          "Password reset link sent. Check your email."
        );
      } else {
        setError(
          "We couldn't send the reset link. Please try again."
        );
      }
    } catch (resetError) {
      console.error("Password reset failed:", resetError);
      setError(
        "We couldn't send the reset link. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handleBack() {
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else if (from === "settings") {
      navigation.navigate("Settings");
    } else {
      navigation.navigate("login");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <View style={styles.icon}>
            <Ionicons
              name="key-outline"
              size={28}
              color={colors.primary}
              accessible={false}
            />
          </View>

          <Text
            style={styles.title}
            accessibilityRole="header"
          >
            Reset your password
          </Text>

          <Text style={styles.description}>
            Enter the email connected to your Notely
            account and we'll send you a reset link.
          </Text>

          <Text style={styles.label}>Email</Text>

          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.mutedText}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            editable={!isLoading}
            accessibilityLabel="Email address"
            returnKeyType="send"
            onSubmitEditing={handleReset}
          />

          {error !== "" && (
            <View
              style={styles.errorBox}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color={colors.danger}
              />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {message !== "" && (
            <View
              style={styles.successBox}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color={colors.success}
              />
              <Text style={styles.successText}>{message}</Text>
            </View>
          )}

          <Pressable
            style={[
              styles.primaryButton,
              isLoading && styles.disabledButton,
            ]}
            onPress={handleReset}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Send password reset link"
          >
            {isLoading ? (
              <View style={styles.loadingContent}>
                <ActivityIndicator color={colors.white} />
                <Text style={styles.primaryButtonText}>
                  Sending...
                </Text>
              </View>
            ) : (
              <Text style={styles.primaryButtonText}>
                Send Reset Link
              </Text>
            )}
          </Pressable>

          <Pressable
            style={styles.backButton}
            onPress={handleBack}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Ionicons
              name="arrow-back"
              size={18}
              color={colors.secondaryText}
            />
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    keyboard: {
      flex: 1,
      backgroundColor: colors.background,
    },

    scroll: {
      flexGrow: 1,
    },

    container: {
      flex: 1,
      justifyContent: "center",
      paddingHorizontal: spacing.xxl,
      paddingVertical: spacing.huge,
    },

    icon: {
      width: 58,
      height: 58,
      borderRadius: 18,
      backgroundColor: colors.primaryLight,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.xl,
    },

    title: {
      fontSize: typography.title,
      fontWeight: typography.bold,
      color: colors.text,
      marginBottom: spacing.sm,
    },

    description: {
      fontSize: typography.body,
      lineHeight: 23,
      color: colors.secondaryText,
      marginBottom: spacing.xxl,
    },

    label: {
      fontSize: typography.bodySmall,
      fontWeight: typography.semibold,
      color: colors.text,
      marginBottom: spacing.sm,
    },

    input: {
      minHeight: 54,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: spacing.lg,
      fontSize: typography.body,
      color: colors.text,
    },

    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.dangerLight,
      borderRadius: 12,
      padding: spacing.md,
      marginTop: spacing.md,
    },

    errorText: {
      flex: 1,
      color: colors.danger,
      fontSize: typography.bodySmall,
      lineHeight: 20,
    },

    successBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.sm,
      backgroundColor: colors.successLight,
      borderRadius: 12,
      padding: spacing.md,
      marginTop: spacing.md,
    },

    successText: {
      flex: 1,
      color: colors.success,
      fontSize: typography.bodySmall,
      lineHeight: 20,
    },

    primaryButton: {
      minHeight: 54,
      borderRadius: 14,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginTop: spacing.xl,
      paddingHorizontal: spacing.lg,
    },

    loadingContent: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
    },

    disabledButton: {
      opacity: 0.6,
    },

    primaryButtonText: {
      color: colors.white,
      fontSize: typography.body,
      fontWeight: typography.bold,
    },

    backButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: spacing.sm,
      padding: spacing.lg,
      marginTop: spacing.sm,
    },

    backText: {
      color: colors.secondaryText,
      fontSize: typography.bodySmall,
      fontWeight: typography.semibold,
    },
  });
}
