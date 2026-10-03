import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";

import {
  colors,
  typography,
} from "./theme";

const Stack =
  createNativeStackNavigator();

export default function AuthNavigator() {
  return (
    <Stack.Navigator
     id ="AuthStack"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.background,
        },

        headerTintColor: colors.text,

        headerTitleStyle: {
          fontWeight: typography.semibold,
        },

        headerShadowVisible: false,
      }}
    >

      <Stack.Screen
        name="login"
        component={Login}
        options={{
          headerShown: false,
        }}
      />

      <Stack.Screen
        name="register"
        component={Register}
        options={{
          title: "Create Account",
        }}
      />

      <Stack.Screen
        name="forgotPassword"
        component={ForgotPassword}
        options={{
          title: "Reset Password",
        }}
      />

    </Stack.Navigator>
  );
}