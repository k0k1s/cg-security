import { Timestamp } from "firebase/firestore";
import { z } from "zod";
import { User as FirebaseUser } from "firebase/auth";

// Email Validation Schema
const email = z
  .string()
  .email("Invalid email address format")
  .nonempty("Email is required");

// Password Validation Schema
const password = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .max(30, "Password cannot exceed 30 characters")
  .nonempty("Password is required");

// Post Description Validation Schema
const description = z
  .string()
  .min(10, "Description must be at least 5 characters")
  .max(2500, "Description cannot be longer than 2500 characters")
  .nonempty("Description is required");

// Post Type Validation Schema
const postType = z.enum(
  ["policies", "awareness", "announcements"],
  { errorMap: () => ({ message: "Invalid post type" }) }
);

// Topic Validation Schema
const topic = z
  .string()
  .max(50, "Topic cannot be longer than 50 characters")
  .nonempty("Topic is required");

// Sign Up Validation Schema
export const signUpSchema = z.object({
  username: z
    .string()
    .max(20, "Username cannot exceed 20 characters")
    .nonempty("Username is required"),
  email,
  password,
  privacyPolicy: z.literal(true, { message: "Privacy policy acceptance is required" }),
  passwordConfirm: z.string().nonempty("Password confirmation is required"),
  role: z.enum(["user", "admin"], { message: "Role is required" }),
}).refine((data) => data.password === data.passwordConfirm, {
  path: ["passwordConfirm"],
  message: "Passwords must match",
});

// Sign In Validation Schema
export const signInSchema = z.object({
  email,
  password,
});

// Create Post Validation Schema
export const createPostSchema = z.object({
  description,
  imageUrls: z.array(z.string()).optional(),
});

// Type Inferences
export type SignUpSchema = z.infer<typeof signUpSchema>;
export type SignInSchema = z.infer<typeof signInSchema>;
export type CreatePostSchema = z.infer<typeof createPostSchema>;

// Extend FirebaseUser with role
export type User = FirebaseUser & {
  role: "user" | "admin" | null; // Role can be user, admin, or null
};



// Like Type Definition
export type Like = {
  id: string;
  userId: string;
  postId: string;
  timestamp: Timestamp;
};
