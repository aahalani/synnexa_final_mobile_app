import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { router } from "expo-router";
import { Feather, AntDesign } from "@expo/vector-icons";
import * as Font from "expo-font";
import Container from "../../../components/Container";
import { getUser } from "../../../services/authService";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

export default function FacultyHomeScreen() {
  const [user, setUser] = useState(null);
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const userData = await getUser();
        const DEBUG_USER_LOGS = __DEV__ && process.env.DEBUG_USER_LOGS === 'true';
        
        if (userData) {
          let displayName = userData.username; // fallback
          
          // Check for faculty data first
          if (userData.facultyDto && userData.facultyDto.facultyFullName) {
            displayName = userData.facultyDto.facultyFullName;
          } else if (userData.facultyDto && userData.facultyDto.firstName && userData.facultyDto.lastName) {
            displayName = `${userData.facultyDto.firstName} ${userData.facultyDto.lastName}`;
          } else if (userData.firstName && userData.lastName) {
            displayName = `${userData.firstName} ${userData.lastName}`;
          }
          
          setUser(displayName);
        }
      } catch (error) {
        if (__DEV__) {
          console.error("Error fetching user data");
        }
        setUser("Faculty");
      }
    })();
  }, []);

  const _loadAssetsAsync = async () => {
    await Font.loadAsync({
      PlusJakartaSans: require("../../../assets/PlusJakartaSans.ttf"),
      PlusJakartaSans_Bold: require("../../../assets/PlusJakartaSans-Bold.ttf"),
    });
    setAssetsLoaded(true);
  };

  useEffect(() => {
    _loadAssetsAsync();
  }, []);

  const quickAccessItems = [
    {
      id: 1,
      title: "Attendance",
      icon: "checkcircle",
      iconType: "AntDesign",
      color: "#4A90E2",
      gradient: ["#4A90E2", "#357ABD"],
      onPress: () => router.push("/(tabs_faculty)/attendance"),
    },
    {
      id: 2,
      title: "Assignment",
      icon: "book",
      iconType: "AntDesign",
      color: "#FF6B6B",
      gradient: ["#FF6B6B", "#E55555"],
      onPress: () => router.push("/(tabs_faculty)/assignment"),
    },
    {
      id: 3,
      title: "Lecture Content",
      icon: "filetext1",
      iconType: "AntDesign",
      color: "#9B59B6",
      gradient: ["#9B59B6", "#8E44AD"],
      onPress: () => router.push("/(tabs_faculty)/lecture"),
    },
  ];

  const renderIcon = (item) => {
    const IconComponent = item.iconType === "AntDesign" ? AntDesign : Feather;
    return <IconComponent name={item.icon} size={32} color="#fff" />;
  };

  return !assetsLoaded ? (
    <ActivityIndicator size="large" color="#4A90E2" />
  ) : (
    <Container style={styles.container}>
      <LinearGradient
        colors={["#F8F9FA", "#FFFFFF"]}
        style={styles.gradientBackground}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Hello,</Text>
              <Text style={styles.nameText}>{user?.split(' ')[0] || 'Faculty'} 👋</Text>
            </View>
            <Text style={styles.subGreetingText}>What would you like to do today?</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/profile')}
            style={styles.profileButton}
          >
            <View style={styles.profileIconContainer}>
              <Feather name="user" size={20} color="#4A90E2" />
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Access Grid */}
        <View style={styles.contentContainer}>
          <View style={styles.gridContainer}>
            {quickAccessItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                onPress={item.onPress}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={item.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.cardGradient}
                >
                  <View style={styles.iconContainer}>
                    {renderIcon(item)}
                  </View>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </LinearGradient>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradientBackground: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerLeft: {
    flex: 1,
  },
  greetingContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 6,
  },
  greetingText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 24,
    color: "#666",
    marginRight: 8,
  },
  nameText: {
    fontFamily: "PlusJakartaSans_Bold",
    fontSize: 28,
    color: "#1A1A1A",
  },
  subGreetingText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    color: "#999",
    marginTop: 4,
  },
  profileButton: {
    marginTop: 4,
  },
  profileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  card: {
    width: (width - 60) / 2,
    height: 160,
    marginBottom: 20,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  cardGradient: {
    flex: 1,
    padding: 20,
    justifyContent: "space-between",
    borderRadius: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: "PlusJakartaSans_Bold",
    fontSize: 18,
    color: "#fff",
    marginTop: "auto",
  },
});