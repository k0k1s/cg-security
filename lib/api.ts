import {
  addDoc,
  collection,
  deleteDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  where,
  QuerySnapshot,
  Timestamp,
  DocumentData,
  updateDoc,
  doc,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { db, storage } from "@/lib/firebaseConfig";
import { Post, Like } from "@/lib/types";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";

// Fetch all posts
export const fetchPosts = async (): Promise<Post[]> => {
  try {
    const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
    const querySnapshot: QuerySnapshot<DocumentData> = await getDocs(postsQuery);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[];
  } catch (error) {
    console.error("Error fetching posts:", error);
    throw new Error("Failed to fetch posts");
  }
};

// Subscribe to posts
export const subscribeToPosts = (callback: (posts: Post[]) => void): (() => void) => {
  const postsQuery = query(collection(db, "posts"), orderBy("timestamp", "desc"));
  return onSnapshot(postsQuery, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const postsArray = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[];
    callback(postsArray);
  }, (error) => {
    console.error("Error subscribing to posts:", error);
  });
};

// Like a post
export const likePost = async (postId: string, userId: string): Promise<void> => {
  const like: Omit<Like, "id"> = {
    postId,
    userId,
    timestamp: Timestamp.now(),
  };
  try {
    await addDoc(collection(db, "likes"), like);
  } catch (error) {
    console.error("Error liking post:", error);
    throw new Error("Failed to like post");
  }
};

// Unlike a post
export const unlikePost = async (postId: string, userId: string): Promise<void> => {
  try {
    const likeRef = query(
      collection(db, "likes"),
      where("postId", "==", postId),
      where("userId", "==", userId)
    );
    const snapshots = await getDocs(likeRef);
    await Promise.all(snapshots.docs.map(doc => deleteDoc(doc.ref)));
  } catch (error) {
    console.error("Error unliking post:", error);
    throw new Error("Failed to unlike post");
  }
};

// Subscribe to likes
export const subscribeToLikes = (postId: string, callback: (likes: Like[]) => void): (() => void) => {
  const likesQuery = query(
    collection(db, "likes"),
    where("postId", "==", postId),
    orderBy("timestamp", "desc")
  );
  return onSnapshot(likesQuery, (querySnapshot: QuerySnapshot<DocumentData>) => {
    const likesArray = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Like[];
    callback(likesArray);
  }, (error) => {
    console.error("Error subscribing to likes:", error);
  });
};

// Delete a post
export const deletePost = async (id: string): Promise<void> => {
  const batch = writeBatch(db);  // Use a batch for better performance and atomicity

  try {
    const postRef = doc(db, "posts", id);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) {
      console.error("Post not found");
      throw new Error("Post not found");
    }

    const imageUrls: string[] = postDoc.data()?.imageUrls || [];

    // Delete images from storage
    await Promise.all(imageUrls.map(async (url) => {
      const imageRef = ref(storage, url);
      await deleteObject(imageRef);
    }));

    // Delete post from Firestore
    batch.delete(postRef);

    // Delete associated likes in batch
    const likeRef = query(
      collection(db, "likes"),
      where("postId", "==", id)
    );
    const snapshots = await getDocs(likeRef);
    snapshots.forEach((likeDoc) => batch.delete(likeDoc.ref));

    // Commit the batch
    await batch.commit();
    console.log(`Post and associated likes deleted successfully: ${id}`);
  } catch (error) {
    console.error("Error deleting post:", error);
    throw new Error("Failed to delete post. Please check the logs for more details.");
  }
};

// Upload an image
const uploadImage = async (uri: string, path: string): Promise<string> => {
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, blob);
    return await getDownloadURL(storageRef);
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }
};

// Create a post with improved image handling and batch writing
export const createPost = async (post: Omit<Post, "id">, imageUris: string[]): Promise<void> => {
  const batch = writeBatch(db);  // Use a Firestore batch for atomic writes
  const postRef = doc(collection(db, "posts"));

  try {
    console.log("Starting post creation...");

    // Step 1: Upload images and get their download URLs
    const imageUrls = await Promise.all(imageUris.map(async (uri, index) => {
      try {
        const path = `posts/${postRef.id}/${Date.now()}_${index}.jpg`;
        const downloadUrl = await uploadImage(uri, path);
        console.log(`Image uploaded: ${downloadUrl}`);
        return downloadUrl;
      } catch (error) {
        console.error(`Error uploading image ${uri}:`, error);
        throw error;
      }
    }));

    // Step 2: Add post document with image URLs in the batch
    const postWithImages = { ...post, imageUrls };
    batch.set(postRef, postWithImages);

    // Commit the batch
    await batch.commit();
    console.log(`Post created with ID: ${postRef.id} and image URLs: ${imageUrls}`);
  } catch (error) {
    console.error("Error creating post:", error);
    throw new Error("Failed to create post. Please check the logs for more details.");
  }
};
