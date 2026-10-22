
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

import { loginUser } from "./services/auth";
import { signInWithGoogle } from "./services/googleAuth";

import { typography, spacing } from "./theme";
import { useTheme } from "./theme/ThemeContext";
import type { ThemeColors } from "./theme/colors";

export default function Login({ navigation }: any) {
  const { colors } = useTheme();
  const styles = makeStyles(colors);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleLogin() {
    if (isLoading) return;

    setError("");

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setIsLoading(true);
      await loginUser(email.trim(), password);

      // App.tsx handles navigation through Firebase auth state.
    } catch (error: any) {
      console.log("Login screen error:", error);

      switch (error?.code) {
        case "auth/invalid-credential":
          setError("Incorrect email or password.");
          break;

        case "auth/network-request-failed":
          setError(
            "No internet connection. Please check your connection and try again."
          );
          break;

        case "auth/too-many-requests":
          setError("Too many attempts. Please wait and try again later.");
          break;

        default:
          setError("Something went wrong. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleLogin() {
    if (isLoading) return;

    setError("");

    try {
      setIsLoading(true);
      await signInWithGoogle();

      // Successful authentication is handled by App.tsx.
    } catch (error: any) {
      console.log("Google login screen error:", error);

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

            <Text style={styles.tagline}>
              Your thoughts, organized.
            </Text>
          </View>

          {/* Welcome */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome back</Text>

            <Text style={styles.description}>
              Sign in to continue to your notes.
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
                placeholder="Enter your password"
                placeholderTextColor={colors.mutedText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="current-password"
                editable={!isLoading}
                onFocus={() => setIsPasswordFocused(true)}
                onBlur={() => setIsPasswordFocused(false)}
                accessibilityLabel="Password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
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

          {/* Email sign in */}
          <Pressable
            style={[
              styles.primaryButton,
              isLoading && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>Sign In</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Google sign in */}
          <Pressable
            style={[
              styles.googleButton,
              isLoading && styles.disabledButton,
            ]}
            onPress={handleGoogleLogin}
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

          {/* Forgot password */}
          <Pressable
            style={styles.forgotButton}
            onPress={() => navigation.navigate("forgotPassword")}
            disabled={isLoading}
            accessibilityRole="button"
          >
            <Text style={styles.forgotText}>
              Forgot your password?
            </Text>
          </Pressable>

          {/* Register */}
          <View style={styles.registerContainer}>
            <Text style={styles.secondaryText}>
              Don't have an account?
            </Text>

            <Pressable
              onPress={() => navigation.navigate("register")}
              disabled={isLoading}
              accessibilityRole="button"
            >
              <Text style={styles.link}>Create one</Text>
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
      width: 64,
      height: 64,
      borderRadius: 20,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: spacing.md,
    },

    logoText: {
      color: colors.white,
      fontSize: 30,
      fontWeight: typography.bold,
    },

    brand: {
      fontSize: typography.display,
      fontWeight: typography.bold,
      color: colors.text,
    },

    tagline: {
      marginTop: spacing.xs,
      color: colors.secondaryText,
      fontSize: typography.bodySmall,
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
      fontSize: typography.body,
      color: colors.secondaryText,
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
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      paddingHorizontal: spacing.lg,
      height: 54,
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
      borderRadius: 12,
      padding: spacing.md,
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
      marginTop: spacing.sm,
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

    forgotButton: {
      alignItems: "center",
      paddingVertical: spacing.lg,
    },

    forgotText: {
      color: colors.primary,
      fontWeight: typography.semibold,
      fontSize: typography.bodySmall,
    },

    registerContainer: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: spacing.lg,
      gap: spacing.xs,
    },

    secondaryText: {
      color: colors.secondaryText,
      fontSize: typography.bodySmall,
    },

    link: {
      color: colors.primary,
      fontSize: typography.bodySmall,
      fontWeight: typography.bold,
    },
  });
}
