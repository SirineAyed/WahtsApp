import { StatusBar } from "expo-status-bar";
import {
  ImageBackground,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
} from "react-native";
import { useState } from "react";
import firebase from "../Config";
import { saveConnectionStatus } from "../utils/ConnectionUtils";

const auth = firebase.auth();

export default function NewUser(props) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  return (
    <ImageBackground
      source={require("../assets/loginback.avif")} // Vibrant gradient background
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={styles.card}>
        <Text style={styles.title}>Sign Up</Text>

        {/* Email Input */}
        <TextInput
          keyboardType="email-address"
          placeholder="Enter your email"
          placeholderTextColor="#ccc"
          style={styles.textInput}
          onChangeText={(text) => setEmail(text)}
        />

        {/* Password Input */}
        <TextInput
          placeholder="Enter your password"
          placeholderTextColor="#ccc"
          secureTextEntry={true}
          style={styles.textInput}
          onChangeText={(text) => setPwd(text)}
        />

        {/* Confirm Password Input */}
        <TextInput
          placeholder="Confirm your password"
          placeholderTextColor="#ccc"
          secureTextEntry={true}
          style={styles.textInput}
          onChangeText={(text) => setConfirmPwd(text)}
        />

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={() => {
              if (!email || !pwd || !confirmPwd) {
                alert("Please fill in all fields.");
                return;
              }

              if (pwd === confirmPwd) {
                auth
                  .createUserWithEmailAndPassword(email, pwd)
                  .then(async () => {
                    props.navigation.navigate("Home");
                    await saveConnectionStatus(true);
                  })
                  .catch((error) => {
                    alert(error.message);
                  });
              } else {
                alert("Passwords do not match.");
              }
            }}
          >
            <Text style={styles.buttonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              props.navigation.goBack();
            }}
          >
            <Text style={styles.buttonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  card: {
    backgroundColor: "#ffffffee", // Transparent white
    height: 450,
    width: "85%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 20,
  },
  textInput: {
    height: 50,
    width: "100%",
    backgroundColor: "#F5F6FA",
    borderRadius: 25,
    paddingHorizontal: 20,
    fontSize: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#E4E5E9",
    color: "#333",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  submitButton: {
    backgroundColor: "#6A98F0",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "45%",
    alignItems: "center",
    shadowColor: "#6A98F0",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  backButton: {
    backgroundColor: "#FF7070",
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    width: "45%",
    alignItems: "center",
    shadowColor: "#FF7070",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 10,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
});
