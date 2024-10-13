import React from "react";
import { Stack } from "expo-router";
import { Text } from "@/components";
import { useUser } from "@/providers/FirebaseProvider";

export default function ProfileLayout() {
  const { data: user, isLoading } = useUser();

  // Show loading indicator while user data is being fetched
  if (isLoading) {
    return <Text type="header">Loading...</Text>; // Or a spinner/loading component
  }

  return (
    <Stack
      initialRouteName="index"
      screenOptions={{
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          headerTitle: () => (
            <Text
              type="header"
              style={{
                backgroundColor: "white",
                marginTop: 4,
              }}
            >
              {user?.displayName || "Profile"} {/* Fallback to "Profile" if no display name */}
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="edit"
        options={{
          headerTitle: () => (
            <Text
              type="header"
              style={{
                backgroundColor: "white",
                marginTop: 4,
              }}
            >
              Edit Profile
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="photo"
        options={{
          headerTitle: () => (
            <Text
              type="header"
              style={{
                backgroundColor: "white",
                marginTop: 4,
              }}
            >
              Change Photo
            </Text>
          ),
        }}
      />
      <Stack.Screen
        name="username"
        options={{
          headerTitle: () => (
            <Text
              type="header"
              style={{
                backgroundColor: "white",
                marginTop: 4,
              }}
            >
              Change Username
            </Text>
          ),
        }}
      />
    </Stack>
  );
}
