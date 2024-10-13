import { Tabs, router } from "expo-router";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import colors from "@/constants/Colors";
import { useUser } from "@/providers/FirebaseProvider";
import { Button, HelloWave, ProfilePicture, Text, View } from "@/components";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function TabLayout() {
  const { data: user } = useUser(); // Use data destructuring for clarity
  const { top } = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.red,
        tabBarShowLabel: false,
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "home" : "home-outline"}
              color={color}
            />
          ),
          header: () => (
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                paddingHorizontal: 20,
                paddingTop: 5 + top,
                paddingBottom: 5,
                alignItems: "center",
              }}
            >
              <View style={{ alignItems: "center", gap: 8, flexDirection: "row" }}>
                <Text type="header" style={{ textTransform: "capitalize" }}>
                  {user?.displayName}
                </Text>
                <HelloWave />
              </View>
              <Button onPress={() => router.push("(secured)/profile")}>
                <ProfilePicture width={50} src={user?.photoURL} />
              </Button>
            </View>
          ),
        }}
      />

      {/* Support Tab */}
      <Tabs.Screen
        name="answer"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "mail" : "mail-outline"}
              color={color}
              size={35}
            />
          ),
          header: () => (
            <Text
              type="header"
              style={{
                backgroundColor: "white",
                paddingHorizontal: 20,
                paddingBottom: 10,
                paddingTop: 10 + top,
              }}
            >
              Answer
            </Text>
          ),
        }}
      />

      {/* Create Post Tab */}
      <Tabs.Screen
        name="create"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "add-circle" : "add-circle-outline"}
              color={color}
              size={35}
            />
          ),
          header: () => (
            <Text
              type="header"
              style={{
                backgroundColor: "white",
                paddingHorizontal: 20,
                paddingBottom: 10,
                paddingTop: 10 + top,
              }}
            >
              Create
            </Text>
          ),
        }}
      />

      {/* Quizz Tab */}
      <Tabs.Screen
        name="quizz"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "podium" : "podium-outline"}
              color={color}
              size={35}
            />
          ),
          header: () => (
            <Text
              type="header"
              style={{
                backgroundColor: "white",
                paddingHorizontal: 20,
                paddingBottom: 10,
                paddingTop: 10 + top,
              }}
            >
              Quizz
            </Text>
          ),
        }}
      />

      {/* Settings Tab */}
      <Tabs.Screen
        name="people"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon
              name={focused ? "people" : "people-outline"}
              color={color}
            />
          ),
          header: () => (
            <Text
              type="header"
              style={{
                backgroundColor: "white",
                paddingHorizontal: 20,
                paddingBottom: 10,
                paddingTop: 10 + top,
              }}
            >
              Manage Employees
            </Text>
          ),
        }}
      />
    </Tabs>
  );
}
