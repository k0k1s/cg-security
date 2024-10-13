import { Button, Container, ProfilePicture, Text, View } from "@/components";
import colors from "@/constants/Colors";
import { useUser } from "@/providers/FirebaseProvider";
import { router } from "expo-router";
import { Pressable } from "react-native";

export default function EditProfileScreen() {
  const { data: user, isLoading } = useUser(); // Assuming useUser returns an object with data and isLoading

  if (isLoading) {
    return <Text>Loading...</Text>; // Optional: Show loading state
  }

  if (!user) {
    return null; // Handle the case where user data isn't available
  }

  const { displayName, photoURL } = user;

  return (
    <Container>
      <View
        style={{
          padding: 20,
          borderColor: colors.gray,
          borderRadius: 20,
          borderWidth: 1,
          gap: 25,
        }}
      >
        <Text style={{ fontSize: 19 }}>Edit User Profile</Text>
        <View style={{ gap: 10 }}>
          <Pressable
            onPress={() => router.push("(secured)/profile/photo")}
            style={({ pressed }) => [
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              },
              pressed && { opacity: 0.7, transform: [{ scale: 0.99 }] },
            ]}
          >
            <Text style={{ fontSize: 16 }}>Profile Picture</Text>
            <ProfilePicture src={photoURL} width={40} />
          </Pressable>
          <Pressable
            onPress={() => router.push("(secured)/profile/username")}
            style={({ pressed }) => [
              {
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              },
              pressed && { opacity: 0.7, transform: [{ scale: 0.99 }] },
            ]}
          >
            <Text style={{ fontSize: 16 }}>Username</Text>
            <Text type="initials" weight="bold" style={{ fontSize: 15 }}>
              {displayName}
            </Text>
          </Pressable>
        </View>
      </View>
    </Container>
  );
}
