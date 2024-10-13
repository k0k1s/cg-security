import React, { useRef, useState, useEffect } from 'react';
import { ScrollView, Alert } from 'react-native'; 
import { Container, Text, Button, Input } from "@/components";
import { useUser } from '@/providers/FirebaseProvider';
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig"; // Firestore instance
import BottomSheet from "@gorhom/bottom-sheet"; // Assuming this is the correct bottom sheet package

// Define the message type
type Message = {
  id: string;
  ticketId: string;
  message: string;
  username: string;
  timestamp: { seconds: number; nanoseconds: number };
};

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [feedback, setFeedback] = useState('');
  const bottomSheetRef = useRef<BottomSheet>(null); 
  const { data: user } = useUser(); 

  const username = user?.displayName || "Anonymous"; 

  // Function to fetch messages from Firestore
  const fetchMessages = async () => {
    try {
      const q = query(collection(db, "messages"), orderBy("timestamp", "desc"));
      const querySnapshot = await getDocs(q);

      // Ensure the fetched messages match the type
      const fetchedMessages: Message[] = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ticketId: doc.data().ticketId,
        message: doc.data().message,
        username: doc.data().username,
        timestamp: doc.data().timestamp,
      }));

      setMessages(fetchedMessages);  
    } catch (error) {
      console.error("Error fetching messages: ", error);
      Alert.alert("Error", "Could not fetch messages.");
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // Function to submit feedback
  const submitFeedback = async () => {
    if (!selectedMessage || !feedback) {
      Alert.alert("Error", "Please select a ticket and enter feedback.");
      return;
    }

    try {
      const feedbackData = {
        messageId: selectedMessage.id,
        feedback: feedback,
        username: username,
        timestamp: { seconds: Math.floor(Date.now() / 1000), nanoseconds: 0 },
      };

      await addDoc(collection(db, "feedback"), feedbackData);

      Alert.alert("Success", "Feedback submitted successfully!");
      setFeedback(''); 
      setSelectedMessage(null); 
      bottomSheetRef.current?.close(); 
    } catch (error) {
      console.error("Error submitting feedback: ", error);
      Alert.alert("Error", "Could not submit feedback.");
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      <Container style={{ marginBottom: 20 }}>
        <Text type="header" style={{ marginBottom: 10 }}>All Tickets</Text>

        {messages.length > 0 ? (
          messages.map(message => (
            <Container key={message.id} style={{ paddingVertical: 10 }}>
              <Text type="body">Ticket ID: {message.ticketId}</Text>
              <Text type="body">Message: {message.message}</Text>
              <Text type="body">Username: {message.username}</Text>
              <Text type="body">Timestamp: {new Date(message.timestamp.seconds * 1000).toLocaleString()}</Text>
              <Button onPress={() => {
                setSelectedMessage(message);
                bottomSheetRef.current?.expand(); 
              }}>
                <Text>Give Feedback</Text>
              </Button>
            </Container>
          ))
        ) : (
          <Text>No tickets found.</Text>
        )}
      </Container>

      <BottomSheet
        ref={bottomSheetRef}
        snapPoints={['25%', '50%', '75%']}
        onClose={() => setSelectedMessage(null)}
      >
        {selectedMessage && (
          <Container style={{ padding: 20 }}>
            <Text type="header" style={{ marginBottom: 10 }}>Give Feedback for {selectedMessage.ticketId}</Text>
            <Input
              placeholder="Enter your feedback"
              value={feedback}
              onChangeText={setFeedback}
              multiline
              style={{ height: 100 }}
            />
            <Button onPress={submitFeedback}>
              <Text>Submit Feedback</Text>
            </Button>
            <Button onPress={() => {
              setSelectedMessage(null);
              bottomSheetRef.current?.close(); 
            }}>
              <Text>Cancel</Text>
            </Button>
          </Container>
        )}
      </BottomSheet>
    </ScrollView>
  );
}
