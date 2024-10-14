import { Image, View } from "react-native";
import { Button, Input, ParallaxScrollView, Text } from "@/components";
import { signUpSchema, SignUpSchema } from "@/lib/types";
import { signUp } from "@/providers/FirebaseProvider";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Checkbox from "expo-checkbox";
import { router } from "expo-router";
import { Controller, useForm } from "react-hook-form";
import { Linking, TouchableOpacity } from 'react-native';
import colors from "@/constants/Colors";
import { Picker } from '@react-native-picker/picker'; // Import Picker

export default function UserRegisterScreen() {
  // Initialize the form with default values
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: "admin", // Set default role to admin
      privacyPolicy: false, // Ensure the privacy policy is unchecked initially
    },
  });

  // Mutation function for registration
  const mutation = useMutation({
    mutationFn: (body: SignUpSchema) => {
      console.log("Attempting to sign up with data:", body); // Log data being sent
      return signUp(body);
    },
    onSuccess: () => {
      console.log("Sign up successful! Redirecting...");
      router.replace("(tabs-ad)"); // Redirect on success
    },
    onError: (error: any) => {
      console.error("Sign up failed:", error.message); // Log the error
      reset(); // Reset the form on error
    },
  });

  // Submit handler
  const onSubmit = (body: SignUpSchema) => {
    mutation.mutate(body); // Trigger mutation on form submission
  };

  // Function to open privacy policy URL
  const openPrivacyPolicy = () => {
    Linking.openURL('https://static.googleusercontent.com/media/www.google.com/en//intl/en/policies/privacy/google_privacy_policy_en.pdf');
  };

  return (
    <ParallaxScrollView>
      {/* Registration Title */}
      <Text type="title" style={{ alignSelf: "flex-start", color: colors.red }}>
        Admin Registration
      </Text>

      {/* Username Input */}
      <Input controls={{ control, errors }} name="username" placeholder="Username" />
      {errors.username && <Text style={{ color: "red" }}>{errors.username.message}</Text>}

      {/* Email Input */}
      <Input controls={{ control, errors }} name="email" placeholder="Email" inputMode="email" />
      {errors.email && <Text style={{ color: "red" }}>{errors.email.message}</Text>}

      {/* Password Input */}
      <Input controls={{ control, errors }} name="password" placeholder="Password" secureTextEntry />
      {errors.password && <Text style={{ color: "red" }}>{errors.password.message}</Text>}

      {/* Password Confirm Input */}
      <Input controls={{ control, errors }} name="passwordConfirm" placeholder="Repeat Password" secureTextEntry />
      {errors.passwordConfirm && <Text style={{ color: "red" }}>{errors.passwordConfirm.message}</Text>}

      {/* Role Selection */}
      <View style={{ marginTop: 10 }}>
        <Text>Select Role</Text>
        <Controller
          control={control}
          name="role"
          render={({ field: { value, onChange } }) => (
            <Picker selectedValue={value} onValueChange={onChange}>
              <Picker.Item label="Admin" value="admin" />
            </Picker>
          )}
        />
        {errors.role && <Text style={{ color: "red" }}>{errors.role.message}</Text>}
      </View>

      {/* Privacy Policy Checkbox */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 10 }}>
        <Controller
          control={control}
          name="privacyPolicy"
          render={({ field: { value, onChange } }) => (
            <Checkbox
              value={value} // Ensure checkbox reflects boolean value
              onValueChange={onChange}
              color={value ? colors.red : undefined} // Add color for checked state
            />
          )}
        />
        <Text style={{ marginLeft: 8 }}>
          <TouchableOpacity onPress={openPrivacyPolicy}>
            <Text style={{ color: "blue" }}>I accept the Privacy Policy</Text>
          </TouchableOpacity>
        </Text>
      </View>
      {errors.privacyPolicy && (
        <Text style={{ color: "red", alignSelf: "flex-start" }}>
          {errors.privacyPolicy.message}
        </Text>
      )}

      {/* Register Button */}
      <Button type="solid" onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? "Registering..." : "Register"}
      </Button>

      {/* Logo Image */}
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <Image
          source={require('@/assets/images/logoc.png')}
          style={{ width: 150, height: 70 }}
          resizeMode="contain"
        />
      </View>
    </ParallaxScrollView>
  );
}
