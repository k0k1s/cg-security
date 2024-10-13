import React, { useRef, useState, useEffect } from 'react';
import { ScrollView, Alert, Linking } from 'react-native'; 
import { Container, Text, Button } from "@/components";
import { useUser } from '@/providers/FirebaseProvider';
import storage from '@react-native-firebase/storage'; 
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebaseConfig"; // Firestore instance
import * as DocumentPicker from 'expo-document-picker'; 
import QuestBottomSheet from '@/components/BottomSheet';

// Define the message type
type Message = {
  id: string;
  ticketId: string;
  message: string;
  username: string;
  timestamp: { seconds: number; nanoseconds: number };
};

export default function HomeScreen() {
  const [messages, setMessages] = useState<Message[]>([]);  // State typed as an array of Message objects
  const user = useUser();
  const bottomSheetRef = useRef(null);

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

      setMessages(fetchedMessages);  // Set the state with fetched messages
    } catch (error) {
      console.error("Error fetching messages: ", error);
      Alert.alert("Error", "Could not fetch messages.");
    }
  };

  // Fetch messages when the component mounts
  useEffect(() => {
    fetchMessages();
  }, []);

  const handleDownload = async () => {
    const storageUrl = 'https://console.firebase.google.com/project/cg-security-971f1/storage/cg-security-971f1.appspot.com/files/AUP';

    try {
      await Linking.openURL(storageUrl);
    } catch (error) {
      console.error("Error opening Firebase Storage: ", error);
      Alert.alert("Error", "Could not open the Firebase Storage.");
    }
  };

  const handleUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ 
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.uri) {
        const { uri, name } = result;

        // Upload the file to the specified path in Firebase Storage
        const reference = storage().ref(`AUP/${name}`);
        await reference.putFile(uri);

        console.log('File uploaded successfully!');
        Alert.alert("Success", "File uploaded successfully!");
      } else {
        Alert.alert("No File Selected", "Please select a file to upload.");
      }
    } catch (err) {
      console.error('Error picking or uploading file: ', err);
      Alert.alert("Error", "Could not upload the file.");
    }
  };

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      <Container style={{ marginBottom: 20 }}>
        <Text type="header" style={{ marginBottom: 10 }}>All Tickets</Text>

        {/* Display fetched messages */}
        {messages.length > 0 ? (
          messages.map(message => (
            <Container key={message.id} style={{ paddingVertical: 10 }}>
              <Text type="body">Ticket ID: {message.ticketId}</Text>
              <Text type="body">Message: {message.message}</Text>
              <Text type="body">Username: {message.username}</Text>
              <Text type="body">Timestamp: {new Date(message.timestamp.seconds * 1000).toLocaleString()}</Text>
            </Container>
          ))
        ) : (
          <Text>No tickets found.</Text>
        )}
      </Container>

      <Container style={{ marginTop: 20, paddingVertical: 10, alignItems: 'center', height: 80 }}>
        <Button onPress={handleDownload}>
          <Text>Open AUP Folder</Text>
        </Button>
        <Button onPress={handleUpload} style={{ marginTop: 10 }}>
          <Text>Upload AUP PDF</Text>
        </Button>
      </Container>

      <Container style={{ marginBottom: 20 }}>
        <Text type="header" style={{ marginBottom: 10 }}>Reporting Violations</Text>
        <Text>If you become aware of any violations of this AUP, you are required to immediately report them to CryptoGem's IT security team at:</Text>
        <Text>• Email: info@cryptogem.com</Text>
        <Text>• Phone: +94-11-6969678</Text>
      </Container>

      {/* Bottom Sheet for Post Details */}
      <QuestBottomSheet ref={bottomSheetRef} data={null} setData={() => {}} />
    </ScrollView>
  );
}
