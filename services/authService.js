import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  TOKEN: 'auth_token',
  USER: 'user_data',
};

// --- Getters ---
export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (e) {
    console.error('Failed to fetch the token from storage', e);
    return null;
  }
};

export const getUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  } catch (e) {
    console.error('Failed to fetch the user from storage', e);
    return null;
  }
};

// --- Setters ---
export const storeAuthData = async (token, user) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to save the auth data to storage', e);
  }
};

// --- Clear ---
export const clearAuthData = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
  } catch (e) {
    console.error('Failed to clear the auth data from storage', e);
  }
};