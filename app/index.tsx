import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useUser } from "@/providers/FirebaseProvider"; // Ensure this imports your user query hook

export default function Index() {
  const { data: user, isLoading } = useUser(); // Fetch the user

  // Show a loading spinner or nothing while user data is loading
  if (isLoading) {
    return null; // Or return a loading spinner component if desired
  }

  // Redirect based on user role
  if (user) {
    // Check the role of the user and redirect accordingly
    switch (user.role) {
      case 'admin':
        return <Redirect href="(tabs-ad)" />;
      case 'user': // Add more roles if needed
        return <Redirect href="(tabs)" />;
      default:
        return <Redirect href="(  auth)" />; // Fallback for unknown roles
    }
  }

  // If no user is logged in, redirect to the authentication page
  return <Redirect href="(auth)" />;
}
