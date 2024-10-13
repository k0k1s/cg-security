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
          const role = userDoc.exists() ? userDoc.data().role : null;
          resolve({ ...user, role } as User);
        } catch (error) {
          console.error("Error fetching user role:", error);
          reject(error);
        }
      } else {
        resolve(null);
      }
      unsubscribe();
    }, (error) => {
      console.error("Auth state change error:", error);
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

// Sign up function
export const signUp = async (data: SignUpSchema): Promise<User | null> => {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, data.email, data.password);
    await updateProfile(user, { displayName: data.username });
    await setDoc(doc(db, "users", user.uid), { role: data.role });
    const fullUser = { ...user, role: data.role } as User;
    queryClient.setQueryData(["user"], fullUser);
    return fullUser;
  } catch (error) {
    console.error("Sign Up Error:", error);
    throw new Error(error.message || "Sign Up failed");
  }
};

// Login function
export const login = async (data: SignInSchema): Promise<User | null> => {
  try {
    const { user } = await signInWithEmailAndPassword(auth, data.email, data.password);
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const role = userDoc.exists() ? userDoc.data().role : null;
    const fullUser = { ...user, role } as User;
    queryClient.setQueryData(["user"], fullUser);
    return fullUser;
  } catch (error) {
    console.error("Login Error:", error);
    throw new Error(error.message || "Login failed");
  }
};

// Logout function
export const logout = async () => {
  try {
    await signOut(auth);
    queryClient.setQueryData(["user"], null);
  } catch (error) {
    console.error("Logout Error:", error);
    throw new Error("Logout failed");
  }
};

// Props type for FirebaseProvider
interface FirebaseProviderProps {
  children: React.ReactNode;
}

// Export the provider
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({ children }) => {
  const user = useUser();
  const posts = usePosts();

  if (user.isLoading || posts.isLoading) return <Loader />;

  const value = {
    signUp,
    login,
    logout,
    user: user.data,
    posts: posts.data || [],
  };

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
