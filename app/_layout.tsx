import "react-native-reanimated";
import "react-native-gesture-handler";

import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { FontAwesome } from "@expo/vector-icons";

import { ReactQueryProvider } from "@/providers";
import { FirebaseProvider } from "@/providers/FirebaseProvider"; // Use named import
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded] = useFonts({
    poppins_regular: require("@/assets/fonts/Poppins-Regular.ttf"),
    poppins_medium: require("@/assets/fonts/Poppins-Medium.ttf"),
    poppins_bold: require("@/assets/fonts/Poppins-Bold.ttf"),
    poppins_semibold: require("@/assets/fonts/Poppins-SemiBold.ttf"),
    poppins_light: require("@/assets/fonts/Poppins-Light.ttf"),
    poppins_extrabold: require("@/assets/fonts/Poppins-ExtraBold.ttf"),
    poppins_black: require("@/assets/fonts/Poppins-Black.ttf"),
    poppins_italic: require("@/assets/fonts/Poppins-Italic.ttf"),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView>
      <StatusBar style="dark" />
      <ReactQueryProvider>
        <FirebaseProvider>
          <Stack
            screenOptions={{ headerShown: false }}
            initialRouteName="index"
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(secured)" />
          </Stack>
        </FirebaseProvider>
      </ReactQueryProvider>
    </GestureHandlerRootView>
  );
}
