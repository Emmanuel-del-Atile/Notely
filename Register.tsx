
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

import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";

import { registerUser } from "./services/auth";
import { signInWithGoogle } from "./services/googleAuth";

import { typography, spacing } from "./theme";
import { useTheme } from "./theme/ThemeContext";
import type { ThemeColors } from "./theme/colors";

export default function Register({ navigation }: any) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleRegister() {
    if (isLoading) return;

    setError("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please create a password.");
      return;
    }

    if (password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    try {
      setIsLoading(true);

      const user = await registerUser(trimmedEmail, password);

      if (!user) {
        setError("Unable to create your account. Please try again.");
      }

      // App.tsx handles navigation through Firebase auth state.
    } catch (error: any) {
      console.log("Registration screen error:", error);

      switch (error?.code) {
        case "auth/email-already-in-use":
          setError("An account with this email already exists.");
          break;

        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;

        case "auth/weak-password":
          setError("Please choose a stronger password.");
          break;

        case "auth/network-request-failed":
          setError("Check your internet connection and try again.");
          break;

        default:
          setError("Unable to create your account. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleRegister() {
    if (isLoading) return;

    setError("");

    try {
      setIsLoading(true);
      await signInWithGoogle();

      // Successful sign-in is handled by the Firebase auth listener.
      // Cancelling the Google picker does not sign the user in.
    } catch (error: any) {
      console.log("Google registration screen error:", error);

      if (error?.code === "auth/network-request-failed") {
        setError("Check your internet connection and try again.");
      } else {
        setError("Google sign-in failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
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
          {/* Brand */}
          <View style={styles.brandContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>N</Text>
            </View>

            <Text style={styles.brand}>Notely</Text>
          </View>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Create your account
            </Text>

            <Text style={styles.description}>
              Start capturing your ideas with Notely.
            </Text>
          </View>

          {/* Email */}
          <View style={styles.field}>
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
              returnKeyType="next"
            />
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>

            <View
              style={[
                styles.passwordContainer,
                isPasswordFocused && styles.passwordContainerFocused,
              ]}
            >
              <TextInput
                style={styles.passwordInput}
                placeholder="Create a password"
                placeholderTextColor={colors.mutedText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="new-password"
                editable={!isLoading}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                accessibilityLabel="Create a password"
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />

              {isPasswordFocused && (
                <Pressable
                  onPress={() =>
                    setShowPassword((previous) => !previous)
                  }
                  style={styles.passwordToggle}
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? "Hide password" : "Show password"
                  }
                  hitSlop={8}
                >
                  <Ionicons
                    name={
                      showPassword
                        ? "eye-off-outline"
                        : "eye-outline"
                    }
                    size={22}
                    color={colors.secondaryText}
                  />
                </Pressable>
              )}
            </View>
          </View>

          {/* Error */}
          {error !== "" && (
            <View
              style={styles.errorBox}
              accessibilityRole="alert"
              accessibilityLiveRegion="polite"
            >
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Email registration */}
          <Pressable
            style={[
              styles.primaryButton,
              isLoading && styles.disabledButton,
            ]}
            onPress={handleRegister}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Create account"
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>
                Create Account
              </Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google registration */}
          <Pressable
            style={[
              styles.googleButton,
              isLoading && styles.disabledButton,
            ]}
            onPress={handleGoogleRegister}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Continue with Google"
          >
            {isLoading ? (
              <ActivityIndicator color={colors.text} />
            ) : (
              <>
                <Ionicons
                  name="logo-google"
                  size={20}
                  color={colors.text}
                />

                <Text style={styles.googleButtonText}>
                  Continue with Google
                </Text>
              </>
            )}
          </Pressable>

          {/* Sign in */}
          <View style={styles.loginContainer}>
            <Text style={styles.secondaryText}>
              Already have an account?
            </Text>

            <Pressable
              onPress={() => navigation.navigate("login")}
              disabled={isLoading}
              accessibilityRole="button"
            >
              <Text style={styles.link}>Sign In</Text>
            </Pressable>
          </View>
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

    brandContainer: {
      alignItems: "center",
      marginBottom: spacing.xxxl,
    },

    logo: {
      width: 60,
      height: 60,
      borderRadius: 18,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.sm,
    },

    logoText: {
      color: colors.white,
      fontSize: 28,
      fontWeight: typography.bold,
    },

    brand: {
      fontSize: typography.heading,
      fontWeight: typography.bold,
      color: colors.text,
    },

    header: {
      marginBottom: spacing.xxl,
    },

    title: {
      fontSize: typography.title,
      fontWeight: typography.bold,
      color: colors.text,
      marginBottom: spacing.sm,
    },

    description: {
      color: colors.secondaryText,
      fontSize: typography.body,
    },

    field: {
      marginBottom: spacing.lg,
    },

    label: {
      fontSize: typography.bodySmall,
      fontWeight: typography.semibold,
      color: colors.text,
      marginBottom: spacing.sm,
    },

    input: {
      height: 54,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: spacing.lg,
      fontSize: typography.body,
      color: colors.text,
    },

    passwordContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      height: 54,
    },

    passwordInput: {
      flex: 1,
      height: "100%",
      paddingHorizontal: spacing.lg,
      fontSize: typography.body,
      color: colors.text,
    },

    passwordContainerFocused: {
      borderColor: colors.primary,
    },

    passwordToggle: {
      paddingHorizontal: spacing.lg,
      height: "100%",
      justifyContent: "center",
      alignItems: "center",
    },

    errorBox: {
      backgroundColor: colors.dangerLight,
      padding: spacing.md,
      borderRadius: 12,
      marginBottom: spacing.lg,
    },

    errorText: {
      color: colors.danger,
      fontSize: typography.bodySmall,
    },

    primaryButton: {
      height: 54,
      borderRadius: 14,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },

    disabledButton: {
      opacity: 0.6,
    },

    primaryButtonText: {
      color: colors.white,
      fontSize: typography.body,
      fontWeight: typography.bold,
    },

    dividerContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.md,
      marginVertical: spacing.lg,
    },

    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.border,
    },

    dividerText: {
      color: colors.secondaryText,
      fontSize: typography.bodySmall,
    },

    googleButton: {
      height: 54,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: spacing.md,
    },

    googleButtonText: {
      color: colors.text,
      fontSize: typography.body,
      fontWeight: typography.semibold,
    },

    loginContainer: {
      flexDirection: "row",
      justifyContent: "center",
      gap: spacing.xs,
      marginTop: spacing.xxl,
    },

    secondaryText: {
      color: colors.secondaryText,
      fontSize: typography.bodySmall,
    },

    link: {
      color: colors.primary,
      fontWeight: typography.bold,
      fontSize: typography.bodySmall,
    },
  });
}
