import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  TouchableOpacity,
  Alert,
  View,
  ImageBackground,
} from "react-native";
import firebase from "../../Config";
import { supabase } from "../../Config/initSupabase";
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

const database = firebase.database();
const ref_tableProfils = database.ref("Tabledeprofils");

export default function MyProfil(props) {
  const [nom, setNom] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [telephone, setTelephone] = useState("");
  const [isDefaultImage, setIsDefaultImage] = useState(true);
  const [uriImage, setUriImage] = useState("");
  const userId = firebase.auth().currentUser.uid;
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    const userProfileRef = ref_tableProfils.child(`unprofil${userId}`);
    userProfileRef.on("value", (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setNom(data.nom || "");
        setPseudo(data.pseudo || "");
        setTelephone(data.telephone || "");
        if (data.profileImage) {
          setUriImage(data.profileImage);
          setIsDefaultImage(false);
        }
      }
    });

    return () => userProfileRef.off();
  }, []);

  const handleImagePick = async (fromCamera) => {
    try {
      const permissionResult = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Denied",
          `You need to allow access to your ${
            fromCamera ? "camera" : "media library"
          }.`
        );
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            base64: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
            base64: true,
          });
      setModalVisible(false);
      if (!result.canceled) {
        const uri = result.assets[0].base64;
        if (!uri) throw new Error("Failed to get image base64 data.");
        setUriImage(result.assets[0].uri);
        setIsDefaultImage(false);
        await uploadImageToSupabase(uri);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const uploadImageToSupabase = async (uri) => {
    try {
      const fileName = `${userId}-${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from("profile-images")
        .upload(fileName, decode(uri), { contentType: "image/jpeg" });

      if (error) {
        console.log(error);
        throw error;
      }

      const imageUrl =
        process.env.EXPO_PUBLIC_SUPABASE_URL +
        "/storage/v1/object/public/" +
        data.fullPath;

      setUriImage(imageUrl);
    } catch (error) {
      console.log(error);
    }
  };

  const saveProfile = () => {
    if (!nom || !pseudo || !telephone) {
      console.log("Please fill all fields");
      return;
    }

    const userProfileRef = ref_tableProfils.child(`unprofil${userId}`);
    userProfileRef
      .update({
        id: userId,
        nom: nom,
        pseudo: pseudo,
        telephone: telephone,
        profileImage: uriImage,
        isConnected: true, // Assurez-vous que l'état de connexion est à true
      })
      .then(() => Alert.alert("Profile updated successfully!"))
      .catch((error) => Alert.alert("Error", error.message));
  };

  const handleDisconnect = () => {
    firebase.auth().signOut();
    navigation.replace("Auth");

    const userProfileRef = ref_tableProfils.child(`unprofil${userId}`);
    if (userProfileRef) {
      userProfileRef.update({ isConnected: false });
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/loginback.avif")}
      style={styles.container}
    >
      <StatusBar style="dark" />
      <Text style={styles.header}>My Profile</Text>

      <View style={styles.imageContainer}>
        <Image
          source={
            isDefaultImage
              ? require("../../assets/profil.png")
              : { uri: uriImage }
          }
          style={styles.profileImage}
        />
        <TouchableOpacity
          style={styles.cameraIcon}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="camera" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <Modal transparent={true} visible={isModalVisible} animationType="fade">
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleImagePick(true)}
            >
              <Text style={styles.modalButtonText}>Open Camera</Text>
              <Ionicons name="camera" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => handleImagePick(false)}
            >
              <Text style={styles.modalButtonText}>Select from Gallery</Text>
              <Ionicons name="image" size={24} color="#000" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <TextInput
        value={nom}
        onChangeText={setNom}
        placeholder="Name"
        style={styles.input}
      />
      <TextInput
        value={pseudo}
        onChangeText={setPseudo}
        placeholder="Username"
        style={styles.input}
      />
      <TextInput
        value={telephone}
        onChangeText={setTelephone}
        placeholder="Phone"
        keyboardType="phone-pad"
        style={styles.input}
      />

      <View style={styles.actionContainer}>
        <TouchableOpacity style={styles.saveButton} onPress={saveProfile}>
          <Ionicons name="save" size={20} color="#fff" />
          <Text style={styles.buttonText}>Save</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.disconnectButton}
          onPress={handleDisconnect}
        >
          <Ionicons name="log-out" size={20} color="#fff" />
          <Text style={styles.buttonText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    resizeMode: "cover",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0b75a7",
    marginBottom: 22,
  },
  imageContainer: {
    position: "relative",
    marginBottom: 20,
  },
  profileImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  cameraIcon: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#007bff",
    borderRadius: 15,
    padding: 5,
  },
  input: {
    width: "80%",
    height: 50,
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    fontSize: 16,
    color: "#333",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
    width: "80%",
  },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  disconnectButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  buttonText: {
    color: "#fff",
    marginLeft: 8,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    alignItems: "center",
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 10,
  },
  modalButtonText: {
    fontSize: 16,
    marginRight: 8,
    color: "#333",
  },
});