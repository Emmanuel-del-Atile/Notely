import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";

import type { ThemeColors } from "./theme/colors";
import { logOutUser } from "./services/auth";
import { auth } from "./services/firebase";

import { typography, spacing } from "./theme";

import { useTheme, ThemePreference } from "./theme/ThemeContext";

const themeOptions: {
  value: ThemePreference;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "light",
    label: "Light",
    description: "Always use light appearance",
    icon: "☀",
  },
  {
    value: "dark",
    label: "Dark",
    description: "Always use dark appearance",
    icon: "☾",
  },
  {
    value: "system",
    label: "System",
    description: "Follow your phone settings",
    icon: "▣",
  },
];

export default function Settings({ navigation }: any) {
  const user = auth.currentUser;

  const { colors, preference, setPreference } = useTheme();

  const styles = makeStyles(colors);

  function handleSignOut() {
    Alert.alert("Sign out", "Are you sure you want to sign out of Notely?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: logOutUser,
      },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <Text style={styles.subtitle}>
        Manage your Notely account and preferences.
      </Text>

      {/* Appearance */}
      <Text style={styles.sectionTitle}>APPEARANCE</Text>

      <View style={styles.appearanceCard}>
        <Text style={styles.settingTitle}>App theme</Text>

        <Text style={styles.settingDescription}>
          Choose how Notely looks on your device.
        </Text>

        <View style={styles.themeOptions}>
          {themeOptions.map((option) => {
            const selected = preference === option.value;

            return (
              <Pressable
                key={option.value}
                style={[
                  styles.themeOption,
                  selected && styles.themeOptionSelected,
                ]}
                onPress={() => {
                  void setPreference(option.value);
                }}
                accessibilityRole="radio"
                accessibilityState={{ checked: selected }}
                accessibilityLabel={`${option.label} theme`}
                accessibilityHint={option.description}
              >
                <Text
                  style={[
                    styles.themeIcon,
                    selected && styles.themeTextSelected,
                  ]}
                >
                  {option.icon}
                </Text>

                <View style={styles.themeInfo}>
                  <Text
                    style={[
                      styles.themeLabel,
                      selected && styles.themeTextSelected,
                    ]}
                  >
                    {option.label}
                  </Text>

                  <Text
                    style={[
                      styles.themeDescription,
                      selected && styles.themeTextSelected,
                    ]}
                  >
                    {option.description}
                  </Text>
                </View>

                <View style={[styles.radio, selected && styles.radioSelected]}>
                  {selected && <View style={styles.radioDot} />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Account */}
      <Text style={styles.sectionTitle}>ACCOUNT</Text>

      <View style={styles.accountCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase() || "N"}
          </Text>
        </View>

        <View style={styles.accountInfo}>
          <Text style={styles.accountLabel}>Signed in as</Text>

          <Text style={styles.email} numberOfLines={1}>
            {user?.email || "Unknown user"}
          </Text>
        </View>
      </View>

      {/* Security */}
      <Text style={styles.sectionTitle}>SECURITY</Text>

      <Pressable
        style={styles.settingCard}
        onPress={() =>
          navigation.navigate("forgotPassword", {
            from: "settings",
          })
        }
        accessibilityRole="button"
      >
        <View style={styles.settingIcon}>
          <Text style={styles.settingIconText}>↻</Text>
        </View>

        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Reset Password</Text>

          <Text style={styles.settingDescription}>
            Change your account password
          </Text>
        </View>

        <Text style={styles.chevron}>›</Text>
      </Pressable>

      {/* About */}
      <Text style={styles.sectionTitle}>ABOUT</Text>

      <Pressable
        style={styles.settingCard}
        onPress={() => navigation.navigate("About")}
        accessibilityRole="button"
      >
        <View style={styles.settingIcon}>
          <Text style={styles.settingIconText}>i</Text>
        </View>

        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>About Notely</Text>

          <Text style={styles.settingDescription}>
            Learn more about the app
          </Text>
        </View>

        <Text style={styles.chevron}>›</Text>
      </Pressable>

      {/* Sign out */}
      <Pressable
        style={styles.signOutButton}
        onPress={handleSignOut}
        accessibilityRole="button"
      >
        <Text style={styles.signOutText}>Sign Out</Text>
      </Pressable>

      <Text style={styles.version}>Notely • Version 1.0.0</Text>
    </ScrollView>
  );
}

function makeStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },

    container: {
      padding: spacing.xxl,
      paddingBottom: spacing.huge,
    },

    title: {
      fontSize: typography.title,
      fontWeight: typography.bold,
      color: colors.text,
    },

    subtitle: {
      color: colors.secondaryText,
      fontSize: typography.bodySmall,
      marginTop: spacing.xs,
    },

    sectionTitle: {
      fontSize: typography.caption,
      fontWeight: typography.bold,
      color: colors.mutedText,
      letterSpacing: 1,
      marginTop: spacing.xxxl,
      marginBottom: spacing.md,
    },

    appearanceCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
    },

    themeOptions: {
      marginTop: spacing.lg,
      gap: spacing.sm,
    },

    themeOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 14,
      backgroundColor: colors.surface,
    },

    themeOptionSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },

    themeIcon: {
      width: 32,
      fontSize: 22,
      color: colors.primary,
    },

    themeInfo: {
      flex: 1,
      marginLeft: spacing.sm,
    },

    themeLabel: {
      fontSize: typography.body,
      fontWeight: typography.semibold,
      color: colors.text,
    },

    themeDescription: {
      fontSize: typography.caption,
      color: colors.secondaryText,
      marginTop: spacing.xs,
    },

    themeTextSelected: {
      color: colors.white,
    },

    radio: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 2,
      borderColor: colors.mutedText,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: spacing.sm,
    },

    radioSelected: {
      borderColor: colors.white,
    },

    radioDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.white,
    },

    accountCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
    },

    avatar: {
      width: 50,
      height: 50,
      borderRadius: 16,
      backgroundColor: colors.primary,
      justifyContent: "center",
      alignItems: "center",
    },

    avatarText: {
      color: colors.white,
      fontSize: typography.heading,
      fontWeight: typography.bold,
    },

    accountInfo: {
      flex: 1,
      marginLeft: spacing.md,
    },

    accountLabel: {
      fontSize: typography.caption,
      color: colors.secondaryText,
      marginBottom: spacing.xs,
    },

    email: {
      fontSize: typography.bodySmall,
      fontWeight: typography.semibold,
      color: colors.text,
    },

    settingCard: {
      backgroundColor: colors.surface,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.lg,
      flexDirection: "row",
      alignItems: "center",
      marginBottom: spacing.md,
    },

    settingIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: colors.primaryLight,
      justifyContent: "center",
      alignItems: "center",
    },

    settingIconText: {
      color: colors.primary,
      fontSize: 22,
      fontWeight: typography.bold,
    },

    settingInfo: {
      flex: 1,
      marginLeft: spacing.md,
    },

    settingTitle: {
      fontSize: typography.body,
      fontWeight: typography.semibold,
      color: colors.text,
    },

    settingDescription: {
      fontSize: typography.caption,
      color: colors.secondaryText,
      marginTop: spacing.xs,
    },

    chevron: {
      fontSize: 28,
      color: colors.mutedText,
    },

    signOutButton: {
      height: 54,
      borderRadius: 14,
      backgroundColor: colors.dangerLight,
      justifyContent: "center",
      alignItems: "center",
      marginTop: spacing.xxxl,
    },

    signOutText: {
      color: colors.danger,
      fontSize: typography.body,
      fontWeight: typography.bold,
    },

    version: {
      textAlign: "center",
      color: colors.mutedText,
      fontSize: typography.caption,
      marginTop: spacing.xxl,
    },
  });
}