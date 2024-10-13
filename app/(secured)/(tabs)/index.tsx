import { useEffect, useRef, useState } from 'react';
import { Container, Post, Text, View, Button } from "@/components"; // Ensure Button is imported
import colors from "@/constants/Colors";
//import { usePosts, useUser } from "@/providers/FirebaseProvider";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from '@tanstack/react-query';
import BottomSheet from "@gorhom/bottom-sheet";
import { Post as PostType } from '@/lib/types';
import QuestBottomSheet from '@/components/BottomSheet';
import { subscribeToPosts } from '@/lib/api';
import { ScrollView, Linking } from 'react-native'; // Import Linking
import { useUser } from '@/providers/FirebaseProvider';

export default function HomeScreen() {
  const [post, setPost] = useState<PostType | null>(null);
  const user = useUser();
 // const posts = usePosts();
  const queryClient = useQueryClient();
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleSheet = () => {
    if (post) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  };

  useEffect(() => {
    const unsubscribe = subscribeToPosts((updatedPosts) => {
      queryClient.setQueryData(['posts'], updatedPosts);
    });

    return () => unsubscribe();
  }, [queryClient]);

  useEffect(handleSheet, [post]);

  const handleDownload = () => {
    const folderUrl = 'https://console.firebase.google.com/project/cg-security-971f1/storage/cg-security-971f1.appspot.com/files/AUP'; // Your Firebase Storage folder URL
    Linking.openURL(folderUrl).catch(err => console.error("Error opening URL: ", err));
  };

 // if (!posts || posts.length < 1) {
//    return (
  //    <Container style={{ alignItems: "center", justifyContent: "center", flex: 1 }}>
  //      <Text type="title" style={{ color: colors.blue }}>No posts!</Text>
 //     </Container>
 //   );
 // }

  return (
    <ScrollView style={{ flex: 1, padding: 10 }}>
      {/* Acceptable Use Policy Section */}
      <Container style={{ marginBottom: 20 }}>
        <Text type="header" style={{ marginBottom: 10 }}>Acceptable Use Policy (AUP)</Text>
        <Text>
          This AUP applies to all users of GemGuard, including but not limited to:
        </Text>
        <Text>• Employees of CryptoGem</Text>
        <Text>• Contractors working on behalf of CryptoGem</Text>
        <Text>• Registered users and authorized third-party stakeholders</Text>
        <Text>• Any other individuals or entities granted access to GemGuard by CryptoGem</Text>
      </Container>

      {/* Reporting Violations Section */}
      <Container style={{ marginBottom: 20 }}>
        <Text type="header" style={{ marginBottom: 10 }}>Reporting Violations</Text>
        <Text>
          If you become aware of any violations of this AUP, you are required to immediately report them to CryptoGem's IT security team at:
        </Text>
        <Text>• Email: info@cryptogem.com</Text>
        <Text>• Phone: +94-11-6969678</Text>
      </Container>

      {/* Bottom Container for Downloading AUP PDF */}
      <Container style={{ marginTop: 20, paddingVertical: 10, alignItems: 'center', height: 80 }}>
        <Button onPress={handleDownload}>
          <Text>Download AUP PDF</Text>
        </Button>
      </Container>

      {/* Bottom Sheet for Post Details */}
      <QuestBottomSheet ref={bottomSheetRef} data={post} setData={setPost} />
    </ScrollView>
  );
}
