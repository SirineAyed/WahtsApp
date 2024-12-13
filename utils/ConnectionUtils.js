import AsyncStorage from '@react-native-async-storage/async-storage';

const CONNECTION_STATUS_KEY = 'isConnected';

// Save connection status
export const saveConnectionStatus = async (isConnected) => {
  try {
    await AsyncStorage.setItem(CONNECTION_STATUS_KEY, JSON.stringify(isConnected));
  } catch (error) {
    console.error('Error saving connection status:', error);
  }
};

// Retrieve connection status
export const getConnectionStatus = async () => {
  try { 
    const status = await AsyncStorage.getItem(CONNECTION_STATUS_KEY);
    return status !== null ? JSON.parse(status) : false; // Default to false if not set
  } catch (error) {
    console.error('Error retrieving connection status:', error);
    return false;
  }
};
