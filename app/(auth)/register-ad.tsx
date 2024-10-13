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
  });

  const mutation = useMutation({
    mutationFn: (body: SignUpSchema) => signUp(body), // Pass body directly
    onSuccess: () => router.replace("(tabs-ad)"),
    onError: () => reset(),
  });

  const onSubmit = (body: SignUpSchema) => mutation.mutate(body);

  const openPrivacyPolicy = () => {
    Linking.openURL('https://static.googleusercontent.com/media/www.google.com/en//intl/en/policies/privacy/google_privacy_policy_en.pdf'); // Replace with your URL
  };

  return (
    <ParallaxScrollView>
        <Text type="title" style={{ alignSelf: "flex-start", color: colors.red }}>
        Admin Registration
        </Text>
      <Input controls={{ control, errors }} name="username" placeholder="Username" />
      <Input controls={{ control, errors }} name="email" placeholder="Email" inputMode="email" />
      <Input controls={{ control, errors }} name="password" placeholder="Password" secureTextEntry />
      <Input controls={{ control, errors }} name="passwordConfirm" placeholder="Repeat Password" secureTextEntry />
      
      {/* Role Selection */}
      <View>
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

      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
  <Controller
    control={control}
    name="privacy_policy"
    render={({ field: { value, onChange } }) => (
      <Checkbox value={value} onValueChange={onChange} />
    )}
  />
  <Text style={{ marginLeft: 8 }}> {/* Add margin to create space */}
    <TouchableOpacity onPress={openPrivacyPolicy}>
      <Text style={{ color: "blue" }}>I accept the Privacy Policy</Text>
    </TouchableOpacity>
  </Text>
</View>
{errors.privacy_policy && (
  <Text style={{ color: "red", alignSelf: "flex-start" }}>
    {errors.privacy_policy?.message as string}
  </Text>
)}


      <Button type="solid" onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        Register
      </Button>
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

