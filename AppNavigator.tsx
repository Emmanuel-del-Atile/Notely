import {
  Pressable,
  Text,
} from "react-native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import Home from "./Home";
import NoteDetails from "./NoteDetails";
import NoteEditor from "./NoteEditor";
import Settings from "./Settings";
import ForgotPassword from "./ForgotPassword";
import About from "./About";
import Favorites from "./Favorites";

import {
  colors,
  typography,
} from "./theme";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
     id ="AppStack"
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.surface,
        },

        headerTintColor: colors.text,

        headerTitleStyle: {
          fontWeight: typography.semibold,
        },

        headerShadowVisible: false,
      }}
    >

      <Stack.Screen
        name="home"
        component={Home}
        options={({ navigation }) => ({
          title: "Notely",

          headerRight: () => (
            <Pressable
              onPress={() =>
                navigation.navigate("Settings")
              }
              style={{
                padding: 6,
              }}
            >
              <Text
                style={{
                  fontSize: 22,
                  color: colors.text,
                }}
              >
                ⚙
              </Text>
            </Pressable>
          ),
        })}
      />
      
      <Stack.Screen
        name="NoteDetails"
        component={NoteDetails}
        options={{
          title: "Note",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={Settings}
        options={{
          title: "Settings",
        }}
      />

      <Stack.Screen
        name="forgotPassword"
        component={ForgotPassword}
        options={{
          title: "Reset Password",
        }}
      />

      <Stack.Screen
        name="About"
        component={About}
        options={{
          title: "About",
        }}
      />

      <Stack.Screen
        name="NoteEditor"
        component={NoteEditor}
        options={{
          title: "",
        }}
      /> 
      <Stack.Screen
        name="Favorites"
        component={Favorites}
        options={{ title: "Favorites" }}
      />
    </Stack.Navigator>
  );
}