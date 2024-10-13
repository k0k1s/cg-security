import { Text } from "@/components";
import { useUser } from "@/providers/FirebaseProvider";
import { Redirect, Stack } from "expo-router";

export default function SecuredLayout() {
  const { data: user, isLoading } = useUser();

  // Show nothing or a loading indicator while user data is being fetched
  if (isLoading) return <Text>Loading...</Text>; // Optionally, you can add a loading spinner here

  // Redirect to authentication if there is no user
  if (!user) return <Redirect href="(auth)" />;

  // Determine the initial route based on user role
  let initialRouteName = "(tabs)"; // Default to the user route
  if (user.role === 'admin') {
    initialRouteName = "(tabs-ad)"; // Redirect admin to the admin route
  }

  return (
    <Stack initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
      <Stack.Screen name={initialRouteName} />
      <Stack.Screen name="profile" />
    </Stack>
  );
}
