import { View, Image, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';
import { getUser } from '../services/authService';

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const checkUser = async () => {
      // Add a small delay for the splash screen effect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = await getUser();

      if (user) {
        // User is logged in, navigate based on their role
        const role = user.selectedRoleDto.roleName;
        if (role === 'Tutor') {
          navigation.replace('(tabs_faculty)');
        } else {
          navigation.replace('(tabs_student)');
        }
      } else {
        // No user, navigate to the login screen
        navigation.replace('(auth)');
      }
    };

    checkUser();
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/fulllogo.png')}
        style={styles.logo}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 400,
    height: 400,
    resizeMode: 'contain',
  },
});

export default SplashScreen;