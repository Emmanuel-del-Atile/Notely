import {
  useEffect,
  useState,
} from "react";

import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

import {
  NavigationContainer,
} from "@react-navigation/native";

import {
  onAuthStateChanged,
  User,
} from "firebase/auth";

import { auth } from "./services/firebase";

import AuthNavigator from "./AuthNavigator";
import AppNavigator from "./AppNavigator";
import { initializeDatabase } from "./services/database";
import { startNetworkSync } from "./services/network";


import {
  colors,
  typography,
  spacing,
} from "./theme";

export default function App() {
  useEffect(() => {
    const unsubscribe =
      startNetworkSync();

    return unsubscribe;
  }, []);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const [user, setUser] =
    useState<User | null>(null);

  const [loading, setLoading] =
    useState(true);

 useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);
    setLoading(false);
  });

  return unsubscribe;
}, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>

        <View style={styles.logo}>
          <Text style={styles.logoText}>
            N
          </Text>
        </View>

        <Text style={styles.brand}>
          Notely
        </Text>

        <ActivityIndicator
          size="small"
          color={colors.primary}
          style={styles.loader}
        />

      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <AppNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },

  logo: {
    width: 70,
    height: 70,
    borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  logoText: {
    color: colors.white,
    fontSize: 38,
    fontWeight: typography.bold,
  },

  brand: {
    fontSize: typography.title,
    fontWeight: typography.bold,
    color: colors.text,
    marginTop: spacing.md,
  },

  loader: {
    marginTop: spacing.xl,
  },
});