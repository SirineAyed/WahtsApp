import { View, Text, Image, StyleSheet, TouchableOpacity ,Linking} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // For icons like "back" and "call"
import { useNavigation } from "@react-navigation/native";

export default ChatGroupHeader = ({ group }) => {
  const navigation = useNavigation();
  const onBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.headerContainer}>
      {/* Back Button */}
      <TouchableOpacity onPress={onBackPress} style={styles.backButton}>
        <Ionicons name="arrow-back" size={24} color="#000" />
      </TouchableOpacity>

      {/* Profile Section */}
      <View style={styles.profileSection}>
        <Image
          source={
            group.profileImage
              ? { uri: group.profileImage }
              : require("../assets/profil.png")
          }
          style={styles.profileImage}
        />
        <View>
          <Text style={styles.pseudoText}>{group.name}</Text>
        </View>
      </View>
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
    elevation: 5, // Shadow for Android
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
    borderBottomColor : "#ccc",
    borderBottomWidth : 1,
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
});
