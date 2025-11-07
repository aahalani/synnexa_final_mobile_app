import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useRouter, useFocusEffect, Stack } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { getUser, clearAuthData } from '../services/authService';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const router = useRouter();
  const navigation = useNavigation();

  useEffect(() => {
    loadUserData();
    loadFonts();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await getUser();
      const DEBUG_USER_LOGS = __DEV__ && process.env.DEBUG_USER_LOGS === 'true';
      
      if (userData) {
        // Determine display name based on user type
        let displayName = userData.username; // fallback
        let userType = 'User';
        
        // Check for student data first
        if (userData.studentRegistrationDto && userData.studentRegistrationDto.studentFullName) {
          displayName = userData.studentRegistrationDto.studentFullName;
          userType = 'Student';
        } else if (userData.studentRegistrationDto && userData.studentRegistrationDto.firstName && userData.studentRegistrationDto.lastName) {
          displayName = `${userData.studentRegistrationDto.firstName} ${userData.studentRegistrationDto.lastName}`;
          userType = 'Student';
        }
        // Check for faculty data
        else if (userData.facultyDto && userData.facultyDto.fullName) {
          displayName = userData.facultyDto.fullName;
          userType = 'Faculty';
        } else if (userData.facultyDto && userData.facultyDto.firstName && userData.facultyDto.lastName) {
          displayName = `${userData.facultyDto.firstName} ${userData.facultyDto.lastName}`;
          userType = 'Faculty';
        }
        // Check for role information
        else if (userData.selectedRoleDto && userData.selectedRoleDto.roleName) {
          userType = userData.selectedRoleDto.roleName;
        }
        
        setUser({
          ...userData,
          displayName,
          userType
        });
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Error loading user data');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        PlusJakartaSans: require('../assets/PlusJakartaSans.ttf'),
        PlusJakartaSans_Bold: require('../assets/PlusJakartaSans-Bold.ttf'),
        OpenSans_Regular: require('../assets/OpenSans-Regular.ttf'),
        OpenSans_Bold: require('../assets/OpenSans-Bold.ttf'),
      });
      setAssetsLoaded(true);
    } catch (error) {
      console.error('Error loading fonts:', error);
      // Set assets loaded anyway to prevent indefinite loading state
      setAssetsLoaded(true);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await clearAuthData();
              // Reset the entire navigation stack
              navigation.reset({
                index: 0,
                routes: [{ name: '(auth)' }],
              });
            } catch (error) {
              console.error('Error during logout:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  if (!assetsLoaded || loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1B4A99" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0)?.toUpperCase() || 'U'}
              </Text>
            </View>
          </View>
          
          <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.userType}>{user?.userType || 'User'}</Text>
          <Text style={styles.username}>@{user?.username || 'username'}</Text>
        </View>

        {/* Profile Options */}
        <View style={styles.optionsSection}>
          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <View style={styles.optionIcon}>
                <Feather name="user" size={20} color="#1B4A99" />
              </View>
              <Text style={styles.optionText}>Edit Profile</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <View style={styles.optionIcon}>
                <Feather name="settings" size={20} color="#1B4A99" />
              </View>
              <Text style={styles.optionText}>Settings</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <View style={styles.optionIcon}>
                <Feather name="help-circle" size={20} color="#1B4A99" />
              </View>
              <Text style={styles.optionText}>Help & Support</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <View style={styles.optionIcon}>
                <Feather name="info" size={20} color="#1B4A99" />
              </View>
              <Text style={styles.optionText}>About</Text>
            </View>
            <Feather name="chevron-right" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Feather name="log-out" size={20} color="#fff" />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    fontFamily: 'PlusJakartaSans',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'PlusJakartaSans_Bold',
  },
  placeholder: {
    width: 40,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1B4A99',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'PlusJakartaSans_Bold',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    fontFamily: 'PlusJakartaSans_Bold',
  },
  userType: {
    fontSize: 16,
    color: '#1B4A99',
    marginBottom: 5,
    fontFamily: 'PlusJakartaSans',
  },
  username: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'PlusJakartaSans',
  },
  optionsSection: {
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontFamily: 'PlusJakartaSans',
  },
  logoutSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#dc3545',
    paddingVertical: 15,
    borderRadius: 10,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
    fontFamily: 'PlusJakartaSans_Bold',
  },
});
