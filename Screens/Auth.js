import { StatusBar } from "expo-status-bar";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Alert,
} from "react-native";
import firebase from "../Config";
import { useNavigation } from "@react-navigation/native";
import { saveConnectionStatus } from "../utils/ConnectionUtils";

const auth = firebase.auth();
const database = firebase.database();
const ref_tableProfils = database.ref("Tabledeprofils");

export default function Auth(props) {
  let email, password;
  const navigation = useNavigation();

  const handleLogin = async () => {
    try {
      // Connexion avec Firebase Auth
      const userCredential = await auth.signInWithEmailAndPassword(
        email,
        password
      );

      // Récupérer l'ID de l'utilisateur connecté
      const userId = userCredential.user.uid;

      // Mettre à jour l'état de connexion à true dans Firebase Realtime Database
      await ref_tableProfils.child(`unprofil${userId}`).update({
        isConnected: true,
      });

      // Naviguer vers la page d'accueil
      navigation.reset({
        index: 0,
        routes: [{ name: "Home" }],
      });
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <ImageBackground
      source={require("../assets/loginback.avif")} // Use a vibrant gradient background image
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={styles.card}>
        <Text style={styles.welcomeText}>Welcome Back!</Text>

        {/* Email Input */}
        <TextInput
          keyboardType="email-address"
          placeholder="Enter your email"
          placeholderTextColor="#888"
          onChangeText={(text) => {
            email = text;
          }}
          style={styles.textInput}
        />

        {/* Password Input */}
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#888"
          secureTextEntry={true}
          style={styles.textInput}
          onChangeText={(text) => {
            password = text;
          }}
        />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleLogin} // Appeler la fonction handleLogin
          >
            <Text style={styles.buttonText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.exitButton}
            onPress={() => {
              // Ajouter une action pour annuler (si nécessaire)
              Alert.alert("Cancel", "Login canceled");
            }}
          >
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        {/* Create New User */}
        <Text
          style={styles.newUserText}
          onPress={() => {
            props.navigation.navigate("NewUser");
          }}
        >
          Don't have an account? Sign up
        </Text>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffffee", // Transparent white
    height: 400,
    width: "85%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  welcomeText: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#3A3D42",
    marginBottom: 20,
    fontFamily: "Arial",
    textAlign: "center",
  },
  textInput: {
    height: 50,
    width: "100%",
    backgroundColor: "#F3F4F6",
    borderRadius: 25,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    color: "#333",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  submitButton: {
    backgroundColor: "#6C63FF",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "45%",
    alignItems: "center",
    shadowColor: "#6C63FF",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  exitButton: {
    backgroundColor: "#FF5E57",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "45%",
    alignItems: "center",
    shadowColor: "#FF5E57",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  newUserText: {
    width: "100%",
    textAlign: "center",
    color: "#6C63FF",
    fontWeight: "600",
    marginTop: 20,
    textDecorationLine: "underline",
  },
});