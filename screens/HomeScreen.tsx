import { View, Text, Button, StyleSheet } from "react-native";
import { NavigationProp } from "@react-navigation/native";

type Props = {
  navigation: NavigationProp<any>;
};

export default function HomeScreen({ navigation }: Props) {
  return (
    <View style={styles.container}>
      <Text>Welcome to Color Guessing Game!</Text>
      <Button
        title="Go to the game"
        onPress={() => navigation.navigate("Home")}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
