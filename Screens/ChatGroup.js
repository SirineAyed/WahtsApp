import React, { useState, useEffect } from "react";
import FlashMessage from "react-native-flash-message";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
  Linking,
  ImageBackground
} from "react-native";
import { StatusBar } from "expo-status-bar";
import firebase from "../Config"; // Update this to your Firebase config file
import { SafeAreaView } from "react-native-safe-area-context";
import ChatGroupHeader from "../components/ChatGroupHeader";
import { supabase } from "../Config/initSupabase"; // Import Supabase client
import * as ImagePicker from "expo-image-picker";
import { decode } from "base64-arraybuffer";
import * as Location from "expo-location";
const reflesdiscussions = firebase.database().ref("lesdiscussions");
const reflesprofils = firebase.database().ref("Tabledeprofils");

import { LogBox } from "react-native";

LogBox.ignoreLogs(["Text strings must be rendered within a <Text> component"]);

export default function Chat(props) {
  const [messages, setMessages] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [inputText, setInputText] = useState("");
  const group = props.route.params.group;
  const userId = firebase.auth().currentUser.uid;
  const ref_groupChat = reflesdiscussions.child(group.id);
  const [isTyping, setIsTyping] = useState(false); // Local typing state
  const [otherTyping, setOtherTyping] = useState([]); // State to track the other user's

  // Fetch messages in real-time from Firebase
  useEffect(() => {
    ref_groupChat.on("value", (snapshot) => {
      const fetchedMessages = [];
      snapshot.forEach((child) => {
        if (child.key !== "typing") {
          fetchedMessages.push({ id: child.key, ...child.val() });
        }
      });
      setMessages(fetchedMessages.reverse());
    });

    reflesprofils.on("value", (snapshot) => {
      const fetchedProfiles = [];
      snapshot.forEach((child) => {
        fetchedProfiles.push({ id: child.key, ...child.val() });
      });
      setProfiles(fetchedProfiles);
    });

    return () => {
      ref_groupChat.off();
      reflesprofils.off();
    };
  }, []);

  // Watch the other user's typing status
  useEffect(() => {
    const typingRef = ref_groupChat.child("typing");
    typingRef.on("value", (snapshot) => {
      const typingUsers = [];
      snapshot.forEach((child) => {
        if (child.key !== userId && child.val()) {
          typingUsers.push(child.key);
        }
      });
      setOtherTyping(typingUsers);
    });

    return () => typingRef.off();
  }, []);

  // Update typing status in Firebase
  const handleInputChange = (text) => {
    setInputText(text);

    // Set "typing" to true if inputText is not empty
    const typingRef = ref_groupChat.child("typing").child(userId);
    if (text.length > 0 && !isTyping) {
      setIsTyping(true);
      typingRef.set(true);
    } else if (text.length === 0 && isTyping) {
      setIsTyping(false);
      typingRef.set(false);
    }
  };

  // Send a new message to Firebase
  const sendMessage = () => {
    if (inputText.trim() === "") return;
    const key = ref_groupChat.push().key;
    const ref_groupChat_key = ref_groupChat.child(key);
    const newMessage = {
      id: key,
      text: inputText,
      sender: userId, // You can change this logic based on authentication
      date: new Date().toISOString(),
      type: "text",
    };

    ref_groupChat_key.set(newMessage);
    setInputText("");
    const typingRef = ref_groupChat.child("typing").child(userId);
    typingRef.set(false);
    setIsTyping(false);
  };


  const renderMessage = ({ item }) => {
    const isMe = item.sender === userId;

    return (
      <View>
        <TouchableOpacity
          style={[
            styles.messageContainer,
            isMe ? styles.myMessage : styles.otherMessage,
            (item.type === "image" || item.status === "deleted") && {
              backgroundColor: "transparent",
            },
          ]}
        >
          {!isMe && item.type === "image" && (
            <Text
              style={{
                color: "#000",
                fontSize: 12,
                marginBottom: 5,
                marginLeft: 5,
              }}
            >
              {profiles.find((profile) => profile.id === item.sender)?.pseudo}
            </Text>
          )}
          {item.type === "text" ? (
            <Text style={styles.messageText}>{item.text}</Text>
          ) : item.type === "location" ? (
            <TouchableOpacity
              onPress={() => Linking.openURL(item.text)} // Open the Google Maps link
              style={styles.locationMessage}
            >
              <Text style={styles.locationText}>Location</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
            >
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.imageMessage}
              />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const handleImagePick = async () => {
    try {
      // Request media library permissions
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          "Permission Denied",
          "You need to allow access to your media library to select an image."
        );
        return;
      }

      // Launch the image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: true,
      });

      if (!result.canceled) {
        const uri = result.assets[0].base64;
        if (!uri) throw new Error("Failed to get image base64 data.");
        //Upload to Supabase
        await uploadImageToSupabase(uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const uploadImageToSupabase = async (uri) => {
    try {
      const key = ref_groupChat.push().key;
      const ref_groupChat_key = ref_groupChat.child(key);
      const fileName = `${key}.jpg`; // Generate unique file name

      const { data, error } = await supabase.storage
        .from("sent-images") // Bucket name in Supabase
        .upload(fileName, decode(uri), { contentType: "image/jpeg" });

      if (error) {
        console.log(error);
        throw error;
      }

      const imageUrl =
        process.env.EXPO_PUBLIC_SUPABASE_URL +
        "/storage/v1/object/public/" +
        data.fullPath;

      const newMessage = {
        id: key,
        imageUrl: imageUrl,
        sender: userId, // You can change this logic based on authentication
        date: new Date().toISOString(),
        type: "image",
      };

      ref_groupChat_key.set(newMessage);
      // Alert.alert("Success", "Profile picture updated!");
    } catch (error) {
      Alert.alert("Error", "Failed to upload image.");
    }
  };

  const shareLocation = async () => {
    try {
      // Request location permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission Denied",
          "You need to enable location access to share your location"
        );
        return;
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      // Construct a location message
      const key = ref_groupChat.push().key;
      const ref_groupChat_key = ref_groupChat.child(key);

      const newMessage = {
        id: key,
        text: `https://www.google.com/maps?q=${latitude},${longitude}`, // Link to Google Maps
        sender: userId,
        date: new Date().toISOString(),
        type: "location",
      };

      // Send message to Firebase
      ref_groupChat_key.set(newMessage);
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to share location.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <FlashMessage position="top" />
      <StatusBar style="auto" />
      <ImageBackground
        source={require("../assets/chatBack.jpg")}
        style={{ flex: 1 }}
      >
      {/* Chat Header */}
      <ChatGroupHeader group={group} />

      <KeyboardAvoidingView
       
       behavior={Platform.OS}
       style={styles.flexGrow}
       >
          <FlatList
            data={messages}
            renderItem={renderMessage}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.messagesList}
            inverted
          />

          {/* Typing Indicator */}
          {otherTyping.length && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>
                {otherTyping.length === 1
                  ? `${otherTyping[0]} is typing...`
                  : "Several people are typing..."}
              </Text>
            </View>
          )}
          {/* Input Field */}
          <View style={styles.inputContainer}>
            <TouchableOpacity
              onPress={handleImagePick}
              style={styles.uploadButton}
            >
              <Text style={styles.uploadButtonText}>📷</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={shareLocation}
              style={styles.shareLocationButton}
            >
              <Text style={styles.shareLocationText}>🌍</Text>

            </TouchableOpacity>
            <TextInput
              style={styles.textInput}
              placeholder="Type a message..."
              value={inputText}
              onChangeText={handleInputChange}
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
              <Text style={styles.sendButtonText}>Send</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
        </ImageBackground>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  flexGrow: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    backgroundColor: "#0F52BA",
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  messagesList: {
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  messageContainer: {
    maxWidth: "75%",
    borderRadius: 20,
    padding: 10,
    marginVertical: 5,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#0F52BA",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "gray",
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  imageMessage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#f5f5f5",
  },
  textInput: {
    flex: 1,
    height: 40,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    backgroundColor: "#f9f9f9",
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: "#0F52BA",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  sendButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  typingIndicator: {
    alignSelf: "flex-start",
    marginLeft: 10,
    marginBottom: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 15,
  },
  typingText: {
    color: "#666",
    fontStyle: "italic",
  },
  reactionPicker: {
    zIndex: 20,
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-around",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 10,
    elevation: 5,
  },
 
  reactionsContainer2: {
    position: "absolute",
    bottom: -5,
    right: -15,
    flexDirection: "row",
    marginTop: 5,
    backgroundColor: "#d3d3d3",
    borderRadius: 20,
    padding: 2,
  },
  reaction: {
    fontSize: 14,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#0078FF", // Messenger-style blue
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 4, // Shadow for Android
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    padding: 10,
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
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  nameText: {
    color: "#e0e0e0", // Subtle contrast for the name
    fontSize: 14,
  },
  callButton: {
    padding: 10,
    backgroundColor: "#00c851", // Green call button
    borderRadius: 50,
  },
  uploadButton: {
    marginRight: 10,
    backgroundColor: "#ddd",
    borderRadius: 20,
    padding: 10,
  },
  uploadButtonText: {
    fontSize: 18,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)", // Dark background with transparency
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "100%",
    height: "80%",
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    borderRadius: 50,
    padding: 10,
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#000",
  },
  shareLocationButton: {
    marginRight: 4,
    backgroundColor: "#ddd",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  shareLocationText: {
    color: "#fff",
    fontWeight: "bold",
  },
  locationMessage: {
    backgroundColor: "#e0e0e0",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 5,
  },
  locationText: {
    color: "#0F52BA",
    fontSize: 16,
    fontWeight: "bold",
  },
});
