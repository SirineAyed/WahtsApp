import React from "react";
import Auth from "./Screens/Auth";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import NewUser from "./Screens/NewUser";
import Home from "./Screens/Home";
import Chat from "./Screens/Chat";
import ChatGroup from "./Screens/ChatGroup";
import { useEffect, useState } from 'react';
import FlashMessage from "react-native-flash-message";
import firebase from "./Config";
const Stack = createNativeStackNavigator();

export default function App() {
  const [isConnected, setIsConnected] = useState(false);

  // Load connection status on component mount
  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setIsConnected(true);
        console.log("User is signed in");
      } else {
        setIsConnected(false);
        console.log("User is signed out");
      }
    });
    return unsubscribe;
  }, []);

  return (
    <NavigationContainer>
      <FlashMessage position="top" />
      <Stack.Navigator initialRouteName={isConnected ? "Home" : "Auth"} screenOptions={{headerShown : false}}>
        <Stack.Screen name="Auth" component={Auth} />
        <Stack.Screen name="NewUser" component={NewUser} />
        <Stack.Screen name="Home" component={Home} screenOptions={{headerShown : true}}/>
        <Stack.Screen name="Chat" component={Chat} />
        <Stack.Screen name="ChatGroup" component={ChatGroup} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}