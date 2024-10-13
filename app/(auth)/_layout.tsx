import { Redirect, Stack, useNavigation } from "expo-router";
import { Button } from "@/components";
import { FontAwesome6 } from "@expo/vector-icons";
import { useUser } from "@/providers/FirebaseProvider";

export default function AuthLayout() {
  const { data: user } = useUser(); // Adjusted for useQuery returning data
  const navigation = useNavigation();
  const canGoBack = navigation.canGoBack(); // Check if we can go back

  // Redirect if the user is authenticated
  if (user) return <Redirect href="(secured)" />;

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerTransparent: true,
        headerTintColor: "black",
        title: "",
        headerLeft: () => (
          canGoBack ? (
            <Button onPress={() => navigation.goBack()} style={{ marginLeft: 20 }}>
              <FontAwesome6 name="arrow-left" size={24} color="black" />
            </Button>
          ) : null
        ),
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="select" />
      <Stack.Screen name="register-ad" />
      <Stack.Screen name="login-ad" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
    </Stack>
  );
}
