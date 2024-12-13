import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  TextInput,
  TouchableHighlight,
  ActivityIndicator,
  Button,
} from "react-native";
import firebase from "../../Config";
import Icon from "react-native-vector-icons/MaterialIcons"; // Import phone icon
import { useNavigation } from "@react-navigation/native";

const database = firebase.database();
const auth = firebase.auth();
const ref_tableGroups = database.ref("TabledeGroups");
const ref_tableProfils = database.ref("Tabledeprofils");

export default function ListGroups(props) {
  const [data, setData] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const navigation = useNavigation();

  const currentUser = auth.currentUser; // Get the current logged-in user
  const currentUserId = currentUser ? currentUser.uid : null;

  useEffect(() => {
    // Fetch groups data
    ref_tableGroups.on("value", (snapshot) => {
      const groups = [];
      snapshot.forEach((group) => {
        groups.push(group.val());
      });
      setData(groups.filter((group) => group.members.includes(currentUserId)));
    });

    // Fetch profiles data
    ref_tableProfils.on("value", (snapshot) => {
      const profilesList = [];
      snapshot.forEach((profile) => {
        profilesList.push(profile.val());
      });
      setProfiles(profilesList);
    });

    return () => {
      ref_tableGroups.off();
      ref_tableProfils.off();
    };
  }, []);

  // Filter out the current user from the profiles list
  const filteredProfiles = profiles.filter((profile) => profile.id !== currentUserId);

  const toggleProfileSelection = (profileId) => {
    setSelectedProfiles((prevSelected) =>
      prevSelected.includes(profileId)
        ? prevSelected.filter((id) => id !== profileId)
        : [...prevSelected, profileId]
    );
  };

  const handleCreateGroup = () => {
    if (!newGroupName) {
      console.log("Please enter a group name");
      return;
    }
    const key = ref_tableGroups.push().key;
    const newGroup = {
      id: key,
      name: newGroupName,
      admin: currentUserId,
      members: [currentUserId, ...selectedProfiles], // Automatically add the current user to the group
    };

    // Add new group to the database
    ref_tableGroups.child(key).set(newGroup);

    // Reset form and close modal
    setNewGroupName("");
    setSelectedProfiles([]);
    setModalVisible(false);
  };

  return (
    <ImageBackground style={styles.container}
    source={require("../../assets/loginback.avif")}
      >
      <StatusBar style="dark" />
      <Text style={styles.textstyle}>List Groups</Text>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableHighlight
              onPress={() => {
                props.navigation.navigate("ChatGroup",{ group : item });
              }}
              underlayColor="#ddd"
              style={styles.contactContainer}
            >
              <View style={styles.contactInner}>
                <Text style={styles.contactName}>{item.name}</Text>
                <Icon name="group" size={25} color="#4CAF50" />
              </View>
            </TouchableHighlight>
          )}
          style={styles.listContainer}
        />

      {/* Floating Add Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        style={styles.floatingButton}
      >
        <Icon name="add" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Modal for Creating Group */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Create New Group</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Group Name"
              value={newGroupName}
              onChangeText={setNewGroupName}
            />
            <Text style={styles.selectProfilesTitle}>Select Members</Text>
            <FlatList
              data={filteredProfiles}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => toggleProfileSelection(item.id)}
                  style={styles.profileItem}
                >
                  <Text
                    style={[
                      styles.profileName,
                      selectedProfiles.includes(item.id) && styles.selectedProfile,
                    ]}
                  >
                    {item.nom} (@{item.pseudo})
                  </Text>
                </TouchableOpacity>
              )}
              style={styles.profileList}
            />
            <View style={styles.modalButtons}>
              <Button title="Cancel" onPress={() => setModalVisible(false)} />
              <Button title="Create" onPress={handleCreateGroup} />
            </View>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  textstyle: {
    fontSize: 32,
    color: "#0b75a7",
    fontWeight: "bold",
    paddingTop: 45,
  },
  textinputstyle: {
    backgroundColor: "#0004",
    fontSize: 16,
    color: "#fff",
    width: "95%",
    height: 50,
    borderRadius: 10,
    margin: 5,
    paddingLeft: 15,
  },
  listContainer: {
    width: "100%",
    padding: 10,
  },
  contactContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3EDEDFF", // Subtle off-white for better contrast
    marginBottom: 12,
    borderRadius: 12, // More rounded corners
    padding: 14,
    elevation: 4, // Slightly more prominent shadow on Android
    shadowColor: "#000", // Shadow for iOS
    shadowOpacity: 0.1, 
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  contactInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  contactName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 50,
    elevation: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContainer: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  modalInput: {
    fontSize: 16,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    marginBottom: 20,
  },
  selectProfilesTitle: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: "bold",
  },
  profileList: {
    maxHeight: 200,
    marginBottom: 20,
  },
  profileItem: {
    padding: 10,
  },
  profileName: {
    fontSize: 16,
    color: "#333",
  },
  selectedProfile: {
    color: "#4CAF50",
    fontWeight: "bold",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  skeletonContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginBottom: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  skeletonImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ccc",
  },
  skeletonTextContainer: {
    marginLeft: 10,
  },
  skeletonText: {
    width: 150,
    height: 15,
    backgroundColor: "#ccc",
    marginBottom: 5,
  },
  skeletonTextSmall: {
    width: 100,
    height: 12,
  },
});
