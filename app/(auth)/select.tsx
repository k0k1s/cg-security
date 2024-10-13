import { router } from "expo-router";

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
import { LoginSvg } from "@/assets";
import { useMutation } from "@tanstack/react-query";
import { login } from "@/providers/FirebaseProvider";

export default function LoginScreen() {
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
    onSuccess: () => router.replace("(tabs)"),
    onError: () => reset(),
  });
  
  const onSubmit = (body: SignInSchema) => mutation.mutate(body);

  return (
    
    <ParallaxScrollView>
      <Text
        type="title"
        style={{ alignSelf: "flex-start", color: colors.blue }}
      >
        Select
      </Text>

      <Button type="solid" href="/login">
        Employee
      </Button>

      <Button type="solid" href="/login-ad">
        Admin
      </Button>

    </ParallaxScrollView>
  );
}
