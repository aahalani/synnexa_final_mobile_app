import { View, Image, StyleSheet } from 'react-native';
import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { getUser } from '../services/authService';

const SplashScreen = () => {
  useEffect(() => {
    const checkUser = async () => {
      // Add a small delay for the splash screen effect
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const user = await getUser();

      if (user) {
        // User is logged in, navigate based on their role
        // Use the same role determination logic as login screen
        let role = user.selectedRoleDto?.roleName;
        
        // If selectedRoleDto is null, check roleDtoList for Faculty or Student
        if (!role && user.roleDtoList && user.roleDtoList.length > 0) {
          const facultyRole = user.roleDtoList.find(r => r.roleName === 'Faculty' && r.isActive);
          const studentRole = user.roleDtoList.find(r => r.roleName === 'Student' && r.isActive);
          
          if (facultyRole) {
            role = 'Faculty';
          } else if (studentRole) {
            role = 'Student';
          }
        }
        
        // Fallback: determine role by DTO presence if still not found
        if (!role) {
          if (user.facultyDto) {
            role = 'Faculty';
          } else if (user.studentRegistrationDto) {
            role = 'Student';
          }
        }

        if (user.isActive) {
          if (role === 'Faculty' || role === 'Tutor') {
            router.replace('(tabs_faculty)/home');
          } else if (role === 'Student') {
            router.replace('(tabs_student)/home');
          } else {
            // Invalid role, navigate to login
            router.replace('(auth)');
          }
        } else {
          // Account not active, navigate to login
          router.replace('(auth)');
        }
      } else {
        // No user, navigate to the login screen
        router.replace('(auth)');
      }
    };

    checkUser();
  }, []);

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