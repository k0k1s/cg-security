import React, { createContext, useContext } from 'react';
import { useQuery } from "@tanstack/react-query";
import { User as FirebaseUser, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebaseConfig";
import { queryClient } from "./QueryClientProvider";
import { SignInSchema, SignUpSchema, Post } from "@/lib/types";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { fetchPosts } from "@/lib/api"; 
import { Loader } from '@/components';

// Define a custom User type that extends FirebaseUser
export interface User extends FirebaseUser {
  role: 'admin' | 'user' | null;
  username: string | null; // Adding username to User type
}

// Create context
const FirebaseContext = createContext<{
  signUp: (data: SignUpSchema) => Promise<User | null>;
  login: (data: SignInSchema) => Promise<User | null>;
  logout: () => Promise<void>;
  user: User | null;
  posts: Post[];
} | null>(null);

// Custom hook to use the Firebase context
export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error("useFirebase must be used within a FirebaseProvider");
  }
  return context;
};

// Function to resume the user session
const resumeSession = async (): Promise<User | null> => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          const userData = userDoc.exists() ? userDoc.data() : {};
          const role = userData.role || null;
          const username = userData.username || user.displayName || null;
          const email = userData.email || user.email || null;

          console.log("User session resumed, role:", role, "username:", username, "email:", email);
          resolve({ ...user, role, username, email } as User);
        } catch (error) {
          console.error("Error fetching user role during session resume:", error);
          reject(error);
        }
      } else {
        console.log("No user session found");
        resolve(null);
      }
      unsubscribe();
    }, (error) => {
      console.error("Auth state change error during session resume:", error);
      reject(error);
    });
  });
};

// Hook to get the current user
export const useUser = () => {
  return useQuery<User | null>({
    queryKey: ["user"],
    queryFn: resumeSession,
    staleTime: Infinity,
    retry: false, // Do not retry on failure
  });
};

// Hook to fetch posts
export const usePosts = () => {
  return useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: fetchPosts,
    staleTime: Infinity,
    retry: false, // Do not retry on failure
  });
};

// Sign up function with additional data (username, email, role)
export const signUp = async (data: SignUpSchema): Promise<User | null> => {
  try {
    console.log("Starting Sign Up process with data:", data);
    
    const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);
    console.log("User created with email:", user.email);

    // Update user profile with display name (username)
    await updateProfile(user, { displayName: data.username });
    console.log("Profile updated with username:", data.username);

    // Create user document in Firestore with additional info (role, email, username)
    await setDoc(doc(db, "users", user.uid), {
      role: data.role,
      email: data.email,
      username: data.username,
      createdAt: new Date(),  // Optional: track creation timestamp
    });
    console.log("User document created in Firestore with role, username, and email");

    const fullUser = { ...user, role: data.role, username: data.username, email: data.email } as User;
    console.log("Full user object created:", fullUser);

    // Update the query client cache
    queryClient.setQueryData(["user"], fullUser);
    console.log("User data set in query cache");

    return fullUser;
  } catch (error: any) {
    console.error("Error during Sign Up process:", error);
    throw new Error(error.message || "Sign Up failed");
  }
};

// Login function with logging and fetching user details
export const login = async (data: SignInSchema): Promise<User | null> => {
  try {
    console.log("Starting login process with data:", data);
    
    const { user } = await signInWithEmailAndPassword(auth, data.email, data.password);
    console.log("User logged in with email:", user.email);

    // Fetch user role, username, and email from Firestore
    const userDoc = await getDoc(doc(db, "users", user.uid));
    const userData = userDoc.exists() ? userDoc.data() : {};
    const role = userData.role || null;
    const username = userData.username || user.displayName || null;
    const email = userData.email || user.email || null;

    console.log("Fetched user role, username, and email from Firestore:", role, username, email);

    const fullUser = { ...user, role, username, email } as User;
    console.log("Full user object created after login:", fullUser);

    // Update the query client cache
    queryClient.setQueryData(["user"], fullUser);
    console.log("User data set in query cache after login");

    return fullUser;
  } catch (error: any) {
    console.error("Login Error:", error);
    throw new Error(error.message || "Login failed");
  }
};

// Logout function with logging
export const logout = async () => {
  try {
    console.log("Starting logout process");

    await signOut(auth);
    queryClient.setQueryData(["user"], null);
    console.log("User signed out and query cache cleared");
  } catch (error: any) {
    console.error("Logout Error:", error);
    throw new Error("Logout failed");
  }
};

// Props type for FirebaseProvider
interface FirebaseProviderProps {
  children: React.ReactNode;
}

// Export the provider with logging in the render process
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const user = useUser();
  const posts = usePosts();

  if (user.isLoading || posts.isLoading) {
    console.log("Loading user or posts data...");
    return <Loader />;
  }

  const value = {
    signUp,
    login,
    logout,
    user: user.data,
    posts: posts.data || [],
  };

  console.log("Rendering FirebaseProvider with user:", user.data, "and posts:", posts.data);

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
