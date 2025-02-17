import { useState } from "react";
import { StyleSheet, Alert, Image, ScrollView } from "react-native";
import { Button, View, ImagePicker, Container, ProfilePicture, Text, Input } from "@/components";
import { CreatePostSchema, Post, createPostSchema } from "@/lib/types";
import { Timestamp } from "firebase/firestore";
import { useUser } from "@/providers/FirebaseProvider";
import { Entypo, Feather } from "@expo/vector-icons";
import colors from "@/constants/Colors";
import { router } from "expo-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { createPost } from "@/lib/api";

const CreatePost: React.FC = () => {
  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CreatePostSchema>({
    resolver: zodResolver(createPostSchema),
  });

  const [images, setImages] = useState<string[]>([]);
  const { data: user } = useUser();  // Accessing user data from the result

  // Fallback for username if displayName is undefined
  const username = user?.displayName ?? "Anonymous";  // Use "Anonymous" if displayName is undefined

  const mutation = useMutation({
    mutationFn: async (body: CreatePostSchema) => {
      const description = body.description.trim();
      const newPost: Omit<Post, "id"> = {
        description: description,
        imageUrls: body.imageUrls,
        author: {
          username: username, // Use fallback value
          id: user?.uid!,    // Ensure the uid exists
        },
        timestamp: Timestamp.now(),
      };

      if (!description) {
        Alert.alert("Description cannot be empty!");
        throw new Error("Description is required");
      }

      await createPost(newPost, images);
    },
    onSuccess: () => {
      router.push("(tabs-ad)");
      Alert.alert("Module created successfully!");
    },
    onError: (error) => {
      Alert.alert("Error creating post: ", error.message);
    },
    onSettled: () => {
      reset();
      setImages([]);
    },
  });

  const onSubmit = (body: CreatePostSchema) => {
    body.imageUrls = images;
    return mutation.mutate(body);
  };

  const deleteImage = (indexToRemove: number) => {
    setImages((prevImages) =>
      prevImages.filter((_, index) => index !== indexToRemove)
    );
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
          placeholder="Description"
          name="description"
          multiline
          numberOfLines={8}
        />
        <ImagePicker
          setState={setImages}
          textStyle={{ color: "white" }}
          style={{ backgroundColor: colors.blue, padding: 15, borderRadius: 50 }}
        >
          <Entypo name="images" size={24} color="white" style={{ marginTop: 5 }} />
        </ImagePicker>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.imageContainer}
          contentContainerStyle={{ gap: 10 }}
        >
          {images.length > 0 &&
            images.map((image, index) => (
              <View key={image}>
                <Image source={{ uri: image }} style={styles.image} />
                <Button
                  onPress={() => deleteImage(index)}
                  style={{ backgroundColor: colors.red, padding: 5, paddingHorizontal: 8, borderRadius: 20, position: "absolute", right: 0, top: 0 }}
                >
                  <Feather size={18} color="white" name="trash-2" />
                </Button>
              </View>
            ))}
        </ScrollView>
      </ScrollView>
      <Button onPress={handleSubmit(onSubmit)} type="solid" disabled={isSubmitting}>
        Submit Post
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
  imageContainer: {
    flexDirection: "row",
    marginVertical: 10,
  },
  image: {
    width: 130,
    aspectRatio: 1,
    borderRadius: 10,
  },
});

export default CreatePost;
