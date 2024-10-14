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
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignUpSchema>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      role: "user",  // Set default role value
      privacyPolicy: false,  // Initialize privacyPolicy checkbox as false
    },
  });

  // Mutation function to handle the sign-up process
  const mutation = useMutation({
    mutationFn: (body: SignUpSchema) => {
      console.log("Submitting SignUp data:", body);  // Log the submission data for debugging
      return signUp(body);  // Pass body to the sign-up function
    },
    onSuccess: () => {
      console.log("Sign-up successful, navigating to the main page...");
      router.replace("(tabs)");  // Redirect to the main page on success
    },
    onError: (error: any) => {
      console.error("Sign-up failed:", error.message);  // Log error message
      reset();  // Reset the form on error
    },
  });

  // Form submission handler
  const onSubmit = (body: SignUpSchema) => {
    mutation.mutate(body);  // Trigger the mutation
  };

  // Open Privacy Policy URL
  const openPrivacyPolicy = () => {
    Linking.openURL('https://static.googleusercontent.com/media/www.google.com/en//intl/en/policies/privacy/google_privacy_policy_en.pdf');  // Replace with your own URL if needed
  };

  return (
    <ParallaxScrollView>
      {/* Title */}
      <Text type="title" style={{ alignSelf: "flex-start", color: colors.red }}>
        Employee Registration
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

      {/* Password Confirmation Input */}
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
              <Picker.Item label="Employee" value="user" />
            </Picker>
          )}
        />
        {errors.role && <Text style={{ color: "red" }}>{errors.role.message}</Text>}
      </View>

      {/* Privacy Policy Checkbox */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16 }}>
        <Controller
          control={control}
          name="privacyPolicy"  // Change from "privacy_policy" to match schema
          render={({ field: { value, onChange } }) => (
            <Checkbox
              value={value}  // Ensure checkbox reflects boolean value
              onValueChange={onChange}
              color={value ? colors.red : undefined}  // Add color for checked state
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

      {/* Logo Section */}
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
