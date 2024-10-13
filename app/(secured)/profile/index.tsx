import { Button, Container, ProfilePicture, Text, View } from "@/components";
import colors from "@/constants/Colors";
import { obfuscateEmail } from "@/lib/utils";
import { useUser, logout } from "@/providers/FirebaseProvider";
import { useRouter } from "expo-router"; // Importing useRouter

export default function ProfileScreen() {
  const router = useRouter(); // Initialize the router
  const { data: user, isLoading } = useUser(); // Assuming useUser returns data and isLoading

  if (isLoading) {
    return <Text>Loading...</Text>; // Display loading message
  }

  if (!user) {
    return null; // Handle case where user data isn't available
  }

  const { displayName, photoURL, metadata, uid, email } = user;

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect to the initial screen (e.g., login screen)
      router.replace("(auth)"); // Adjust this to your initial route
    } catch (error) {
      console.error("Logout Error:", error);
      // Handle any errors (e.g., show an error message)
    }
  };

  return (
    <Container style={{ gap: 30 }}>
      <View style={{ borderRadius: 20, overflow: "hidden" }}>
        <View style={{ backgroundColor: colors.blue, aspectRatio: 2.5 }} />
        <View
          style={{
            borderTopWidth: 0,
            borderBottomStartRadius: 20,
            borderBottomEndRadius: 20,
            borderWidth: 1,
            borderColor: colors.gray,
            padding: 20,
            alignItems: "center",
          }}
        >
          <ProfilePicture
            width={100}
            style={{ marginTop: -100, marginBottom: 5 }}
            src={photoURL}
          />
          <Text type="subtitle" style={{ textTransform: "capitalize" }}>
            {displayName}
          </Text>
          <Text style={{ fontSize: 15 }}>
            User since:{" "}
            {metadata.creationTime ? 
              new Date(metadata.creationTime).toLocaleDateString() 
              : "Unknown"}
          </Text>
          <Text style={{ fontSize: 15, color: colors.gray, textAlign: "center" }}>
            <Text weight="bold" style={{ color: colors.gray }}>
              ID:{" "}
            </Text>
            {uid}
          </Text>
        </View>
      </View>

      <View
        style={{
          padding: 20,
          borderRadius: 20,
          borderWidth: 1,
          borderColor: colors.gray,
        }}
      >
        <View>
          <Text style={{ fontSize: 17 }}>Email: </Text>
          <Text weight="bold" style={{ fontSize: 17 }}>
            {email ? obfuscateEmail(email) : "Not provided"}
          </Text>
        </View>
      </View>

      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Button href="(secured)/profile/edit" type="solid">
          Edit Account
        </Button>
        <Button onPress={handleLogout} type="solid">
          Logout
        </Button>
      </View>
    </Container>
  );
}
