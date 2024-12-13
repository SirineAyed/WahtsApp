import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For icons like "back" and "call"
import { useNavigation } from "@react-navigation/native";

export default ChatHeader = ({ profile , idDisc }) => {
  const navigation = useNavigation();
  const onBackPress = () => {
    navigation.goBack();
  };

  // Function to initiate a phone call
  const handleCall = () => {
    const url = `tel:${profile.telephone}`;
    Linking.openURL(url).catch((err) =>
      alert("Unable to make a call. Check your phone settings.")
    );
  };

  return (
    <View style={styles.headerContainer}>
      {/* Back Button */}
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      {/* Profile Section */}
      <View style={styles.profileSection}>
      <View style={styles.profileImageContainer}>
          <Image
            source={
              profile.profileImage
                ? { uri: profile.profileImage }
                : require("../assets/profil.png")
            }
            style={styles.profileImage}
          />
          {profile?.isConnected && <View style={styles.onlineDot} />} {/* Add green dot */}
        </View>
        <View>
          <Text style={styles.pseudoText}>{profile.pseudo}</Text>
          <Text style={styles.nameText}>{profile.nom}</Text>
        </View>
      </View>

      {/* Call Button */}
      <TouchableOpacity onPress={handleCall} style={styles.callButton}>
        <Ionicons name="call" size={24} color="#0F52BA" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    // backgroundColor: "white", // Messenger-style blue
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 10,
    // color : "black"
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 10,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
    backgroundColor: "#ccc", // Fallback color for loading
  },
  pseudoText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  nameText: {
    color: "gray", // Subtle contrast for the name
    fontSize: 14,
  },
  callButton: {
    padding: 10,
    // backgroundColor: "#00c851", // Green call button
    borderRadius: 50,
  },
  profileImageContainer: {
    position: "relative",
    width: 40,
    height: 40,
    marginRight: 7,
  },
  onlineDot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#4CAF50", // Green color
    borderWidth: 2,
    borderColor: "#fff", // White border to make it stand out
  },
});
