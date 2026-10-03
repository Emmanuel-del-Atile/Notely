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
import { loginUser } from "./services/auth";

import {
  colors,
  typography,
  spacing,
} from "./theme";

export default function Login({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

async function handleLogin() {
  if (isLoading) {
    return;
  }

  setError("");

  if (!email.trim()) {
    setError("Please enter your email.");
    return;
  }

  if (!password) {
    setError("Please enter your password.");
    return;
  }

  try {
    setIsLoading(true);

    await loginUser(
      email.trim(),
      password
    );

  } catch (error: any) {
    console.log("Login screen error:", error);

    switch (error?.code) {
      case "auth/invalid-credential":
        setError(
          "Incorrect email or password."
        );
        break;

      case "auth/network-request-failed":
        setError(
          "No internet connection. Please check your connection and try again."
        );
        break;

      case "auth/too-many-requests":
        setError(
          "Too many attempts. Please wait and try again later."
        );
        break;

      default:
        setError(
          "Something went wrong. Please try again."
        );
    }

  } finally {
    setIsLoading(false);
  }
}

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>

          {/* Brand */}
          <View style={styles.brandContainer}>
            <View style={styles.logo}>
              <Text style={styles.logoText}>
                N
              </Text>
            </View>

            <Text style={styles.brand}>
              Notely
            </Text>

            <Text style={styles.tagline}>
              Your thoughts, organized.
            </Text>
          </View>

          {/* Welcome */}
          <View style={styles.header}>
            <Text style={styles.title}>
              Welcome back
            </Text>

            <Text style={styles.description}>
              Sign in to continue to your notes.
            </Text>
          </View>

          {/* Email */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Email
            </Text>

            <TextInput
              style={styles.input}
              placeholder="you@example.com"
              placeholderTextColor={colors.mutedText}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password */}
          <View style={styles.field}>
            <Text style={styles.label}>
              Password
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              placeholderTextColor={colors.mutedText}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {/* Error */}
          {error !== "" && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          )}

          <Pressable
            style={[
              styles.primaryButton,
              isLoading && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryButtonText}>
                Sign In
              </Text>
            )}
          </Pressable>

          {/* Forgot */}
          <Pressable
            style={styles.forgotButton}
            onPress={() =>
              navigation.navigate("forgotPassword")
            }
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
              onPress={() =>
                navigation.navigate("register")
              }
            >
              <Text style={styles.link}>
                Create one
              </Text>
            </Pressable>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
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