import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Image,
  TouchableOpacity,
  Linking,
  ImageBackground
} from "react-native";
import firebase from "../../Config";
import Icon from "react-native-vector-icons/MaterialIcons";

const database = firebase.database();
const ref_tableProfils = database.ref("Tabledeprofils");

export default function ListProfils(props) {
  const [data, setData] = useState([]);
  const userId = firebase.auth().currentUser.uid;

  useEffect(() => {
    ref_tableProfils.on("value", (snapshot) => {
      const d = [];
      snapshot.forEach((unprofil) => {
        d.push(unprofil.val());
      });
      setData(d.filter((profil) => profil.id !== userId));
    });

    return () => {
      ref_tableProfils.off();
    };
  }, [userId]);

  const handleCall = (phoneNumber) => {
    const url = `tel:${phoneNumber}`;
    Linking.openURL(url).catch((err) =>
      alert("Unable to make a call. Check your phone settings.")
    );
  };

  return (
    <ImageBackground style={styles.container}
    source={require("../../assets/loginback.avif")}
      >
      <StatusBar style="dark" />
      <Text style={styles.textstyle}>List profils</Text>

        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            return (
              <TouchableHighlight
                onPress={() => {
                  props.navigation.navigate("Chat", { profile: item });
                }}
                underlayColor="#ddd"
                style={styles.contactContainer}
                key={item.id}
              >
                <View style={styles.contactInner}>
                  {/* Profile Image */}
                  <View style={styles.profileImageContainer}>
                    <Image
                      source={
                        item.profileImage
                          ? { uri: item.profileImage }
                          : require("../../assets/profil.png")
                      }
                      style={styles.profileImage}
                    />
                    {item?.isConnected && <View style={styles.onlineDot} />}{" "}
                    {/* Add green dot */}
                  </View>
                  {/* Contact Info */}
                  <View style={styles.textContainer}>
                    <Text style={styles.contactName}>
                      {item.nom}
                    </Text>
                    <Text style={styles.contactPseudo}>@{item.pseudo}</Text>
                  </View>

                  {/* Phone Icon */}
                  {item.telephone && (
                    <TouchableOpacity
                      onPress={() => handleCall(item.telephone)}
                      style={styles.phoneIcon}
                    >
                      <Icon name="phone" size={25} color="#4CAF50" />
                    </TouchableOpacity>
                  )}
                </View>
              </TouchableHighlight>
            );
          }}
          style={styles.listContainer}
        />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  textinputstyle: {
    backgroundColor: "#0004",
    fontSize: 18,
    color: "#fff",
    width: "95%",
    height: 50,
    borderRadius: 10,
    margin: 5,
    paddingLeft: 15, // Add padding for better input appearance
  },
  textstyle: {
    fontSize: 32,
    fontFamily: "serif",
    color: "#0b75a7",
    fontWeight: "bold",
    paddingTop: 45,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  listContainer: {
    width: "100%",
    padding : 1,
    marginTop : 6
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
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: "#ccc",
  },
  profileImageContainer: {
    position: "relative",
    width: 50,
    height: 50,
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
  textContainer: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  contactPseudo: {
    fontSize: 14,
    color: "#666",
  },
  phoneIcon: {
    padding: 10,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  
});
