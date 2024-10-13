import { router } from "expo-router";
import { Image, View } from "react-native";
import {
  Input,
  Button,
  Text,
  ParallaxScrollView,
} from "@/components";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInSchema, signInSchema } from "@/lib/types";
import colors from "@/constants/Colors";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/providers/FirebaseProvider";
import { LoginSvg } from "@/assets"; // Keep LoginSvg if needed


export default function UserLoginScreen() {
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignInSchema>({
    resolver: zodResolver(signInSchema),
  });

  const mutation = useMutation({
    mutationFn: (body: SignInSchema) => login(body),
    onSuccess: ({ role }) => {
      if (role === "admin") {
        router.replace("(tabs-ad)"); // Admin tabs
      } else {
        router.replace("(tabs)"); // User tabs
      }
    },
    onError: () => reset(),
  });

  const onSubmit = (body: SignInSchema) => mutation.mutate(body);

  return (
    <ParallaxScrollView>
      <Text type="title" style={{ alignSelf: "flex-start", color: colors.navy }}>
        Employee Log In
      </Text>
      <Input
        controls={{ control, errors }}
        name="email"
        placeholder="Email"
        inputMode="email"
        icon="at-sign"
        style={{ width: "100%" }}
      />
      <Input
        controls={{ control, errors }}
        name="password"
        icon="lock"
        placeholder="Password"
        secureTextEntry
        style={{ width: "100%" }}
      />
      <Button type="solid" onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        Log In
      </Button>
      <Button href="/(auth)/register" style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 16 }}>Don't have an account?</Text>
        <Text weight="bold" type="link" style={{ fontSize: 16 }}>Register</Text>
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
