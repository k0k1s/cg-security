import { useEffect, useRef, useState } from 'react';
import { Container, Post, Text, View } from "@/components";
import colors from "@/constants/Colors";
import { usePosts, useUser } from "@/providers/FirebaseProvider";
import { FlashList } from "@shopify/flash-list";
import { useQueryClient } from '@tanstack/react-query';
import BottomSheet from "@gorhom/bottom-sheet";
import { Post as PostType } from '@/lib/types';
import QuestBottomSheet from '@/components/BottomSheet';
import { subscribeToPosts } from '@/lib/api';
import { Picker } from '@react-native-picker/picker'; // Import Picker for dropdown selection

export default function HomeScreen() {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);  // Track selected post ID
  const [post, setPost] = useState<PostType | null>(null);
  const { data: user } = useUser();  // Access user data
  const { data: posts } = usePosts();  // Access posts data from react-query
  const queryClient = useQueryClient();

  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleSheet = () => {
    if (post) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  };

  // Subscribe to posts and update the query cache in real-time
  useEffect(() => {
    const unsubscribe = subscribeToPosts((updatedPosts) => {
      queryClient.setQueryData(['posts'], updatedPosts);  // Update the cache with new posts
    });

    return () => unsubscribe();  // Clean up the subscription on unmount
  }, [queryClient]);

  useEffect(handleSheet, [post]);

  // Handle selecting a post from the dropdown
  const handlePostSelection = (postId: string) => {
    setSelectedPostId(postId);
    const selected = posts?.find(post => post.id === postId) || null;
    setPost(selected);  // Update the selected post data
  };

  // Only show the selected post if a post is selected
  const filteredPosts = selectedPostId
    ? posts?.filter(post => post.id === selectedPostId)
    : [];

  if (!posts || posts.length < 1) {
    return (
      <Container style={{ alignItems: "center", justifyContent: "center" }}>
        <Text type="title" style={{ color: colors.blue }}>No Posts Available!</Text>
      </Container>
    );
  }

  return (
    <View style={{ flex: 1, padding: 10, paddingVertical: 15 }}>
      {/* Picker to select a post */}
      <Picker
        selectedValue={selectedPostId}
        onValueChange={(itemValue) => handlePostSelection(itemValue)}
        style={{ marginBottom: 15 }}
      >
        <Picker.Item label="Select a Post" value={null} />
        {posts.map(post => (
          <Picker.Item key={post.id} label={post.title} value={post.id} />
        ))}
      </Picker>

      {/* FlashList to display only the selected post */}
      {selectedPostId && (
        <FlashList
          data={filteredPosts}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            return <Post post={item} setPost={setPost} user={user!} />;
          }}
          estimatedItemSize={filteredPosts.length}
        />
      )}

      {/* Bottom Sheet for selected post */}
      <QuestBottomSheet ref={bottomSheetRef} data={post} setData={setPost} />
    </View>
  );
}
