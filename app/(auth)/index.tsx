import { Container, Button, Text, View } from "@/components";
import { LoginSvg } from "@/assets"; // Keep LoginSvg if needed
import { FontAwesome } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Image } from 'react-native'; // Import Image

// Import your PNG logo
import logo from "../../assets/images/logoc.png"; // Adjust the path as necessary

export default function WelcomeScreen() {
  const { top } = useSafeAreaInsets();
  
  return (
    <Container style={{ paddingTop: top + 20 }}>
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <Image 
          source={logo} 
          style={{ width: 250, height: 62 }} // Increase width and height as needed
        />
      </View>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: "center" }}>
        <Text style={{ fontSize: 35, textAlign: "center", marginTop: 20 }} weight="bold">
          Empowering Awareness, Enhancing Security with{" "}
          <Text style={{ color: 'red', fontWeight: 'bold' }}>Gemguard!</Text>
        </Text>
        <LoginSvg />
        <Button type="solid" href="/select">
          Continue{"  "}
        </Button>
      </View>
    </Container>
  );
}
