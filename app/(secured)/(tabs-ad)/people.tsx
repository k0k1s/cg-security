import React, { useEffect, useState } from 'react';
import { Button, Container, Text, View } from "@/components";
import { logout, useUser } from "@/providers/FirebaseProvider"; 
import { useRouter } from "expo-router";
import { db } from "@/lib/firebaseConfig"; 
import { collection, getDocs } from "firebase/firestore"; 
import { FlatList } from 'react-native';

interface User {
  id: string;
  username: string; // Adjust field name as per Firestore
  email: string;       // Adjust field name as per Firestore
  role: 'admin' | 'user'; // Adjust as necessary
}

export default function TabTwoScreen() {
  const router = useRouter(); 
  const { data: user, isLoading: isUserLoading } = useUser(); 
  const [users, setUsers] = useState<User[]>([]); // Specify User type for users
  const [isLoading, setIsLoading] = useState(true); 

  const handleLogout = async () => {
    try {
      await logout();
      router.replace("(auth)"); 
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => {
          const data = doc.data();
          console.log('Fetched user data:', data); // Log the entire data object
          return {
            id: doc.id,
            username: data.username || "No Name", // Ensure these fields exist
            email: data.email || "No Email",
            role: data.role || "No Role",
          };
        });
        setUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isUserLoading && user) {
      fetchUsers();
    }
  }, [isUserLoading, user]);

  if (isUserLoading) {
    return <Text>Loading user data...</Text>; 
  }

  if (!user) {
    return <Text>No user is currently signed in.</Text>; 
  }

  const { displayName } = user;

  // Role color mapping
  const roleColor = {
    admin: 'orange',
    user: 'green',
  };

  return (
    <Container style={{ padding: 20 }}>
      <View style={{ marginBottom: 20 }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Welcome, {displayName}</Text>
      </View>

      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>All Users</Text>
      {isLoading ? (
        <Text>Loading users...</Text>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 10,
                padding: 15,
                marginBottom: 10,
              }}
            >
              <Text style={{ fontSize: 16 }}>Name: {item.username}</Text>
              <Text style={{ fontSize: 16 }}>Email: {item.email}</Text>
              <Text style={{ fontSize: 16, color: roleColor[item.role] }}>
                Role: {item.role}
              </Text>
            </View>
          )}
        />
      )}

      <Button onPress={handleLogout} type="solid" style={{ marginTop: 20 }}>
        Logout
      </Button>
    </Container>
  );
}
