import { useState } from "react";
import { StyleSheet, Alert, ScrollView } from "react-native";
import { Button, View, Container, ProfilePicture, Text, Input } from "@/components";
import { Timestamp, addDoc, collection } from "firebase/firestore"; // Import Firebase functions
import { useUser } from "@/providers/FirebaseProvider";
import { db } from "@/lib/firebaseConfig";  // Assuming your Firebase is initialized in a `firebase.js` file
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import colors from "@/constants/Colors";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation } from "@tanstack/react-query";

// Schema for the message form
const createMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
});

const CreateMessage: React.FC = () => {
  // Define the form data type explicitly
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<{ message: string }>({
    resolver: zodResolver(createMessageSchema),
  });

  const { data: user } = useUser();  // Accessing user data from the result

  // Fallback for username if displayName is undefined
  const username = user?.displayName ?? "Anonymous";  // Use "Anonymous" if displayName is undefined

  // New function to save message to Firebase
  const saveMessageToFirebase = async (message: string) => {
    const ticketId = `TICKET-${Math.floor(Math.random() * 1000000)}`;  // Random ticketId generation
    const timestamp = Timestamp.now(); // Firebase timestamp for date and time

    const newMessage = {
      ticketId: ticketId,
      message: message,
      username: username, // Use fallback value
      userId: user?.uid!,
      timestamp: timestamp,
    };

    try {
      // Save the new message to the Firebase Firestore collection called "messages"
      await addDoc(collection(db, "messages"), newMessage);
    } catch (error) {
      console.error("Error saving message:", error);
      throw new Error("Failed to save message: " + error.message);
    }
  };

  // Test Firestore Write Function
  const testWriteToFirestore = async () => {
    try {
      await addDoc(collection(db, "testCollection"), {
        testField: "testValue",
        timestamp: Timestamp.now(),
      });
      Alert.alert("Test write succeeded!");
    } catch (error) {
      console.error("Test write failed:", error);
      Alert.alert("Test write failed: " + error.message);
    }
  };

  const mutation = useMutation({
    mutationFn: async (data: { message: string }) => {
      const message = data.message.trim();

      if (!message) {
        Alert.alert("Message cannot be empty!");
        throw new Error("Message is required");
      }

      await saveMessageToFirebase(message);  // Save the message using the new function
    },
    onSuccess: () => {
      router.push("(tabs)");
      Alert.alert("Message sent successfully!");
    },
    onError: (error) => {
      Alert.alert("Error sending message: ", error.message);
    },
    onSettled: () => {
      reset();
    },
  });

  const onSubmit = (data: { message: string }) => {
    mutation.mutate(data);
  };

  return (
    <Container style={{ paddingVertical: 10, gap: 20 }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 20 }}>
        <View style={{ gap: 10, flexDirection: "row", alignItems: "center" }}>
          <ProfilePicture width={60} src={user?.photoURL} />
          <View>
            <Text type="initials" style={{ fontSize: 20 }} numberOfLines={1} ellipsizeMode="tail">
              {username} {/* Display the username or fallback */}
            </Text>
          </View>
        </View>
        <Input
          controls={{ errors, control }}
          inputStyle={styles.input}
          placeholder="Enter your message"
          name="message"
          multiline
          numberOfLines={4}
        />
      </ScrollView>
      <Button onPress={handleSubmit(onSubmit)} type="solid" disabled={isSubmitting}>
        Send Message
      </Button>
    </Container>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    paddingLeft: 10,
    fontSize: 16,
    borderRadius: 10,
    textAlignVertical: "top",
  },
});

export default CreateMessage;
