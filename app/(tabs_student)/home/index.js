import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Feather, AntDesign } from "@expo/vector-icons";
import * as Font from "expo-font";
import Container from "../../../components/Container";

const Card = ({ children, style }) => (
  <View style={[styles.card, style]}>{children}</View>
);

const screenHeight = Dimensions.get("window").height;

export default function Page() {
  const [user, setUser] = useState(null);
  const navigation = useNavigation();
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      text: "Your attendance for today is 100%.",
      icon: "checkcircleo",
      iconColor: "#4CAF50",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      text: "Your fees for this month are due.",
      icon: "exclamationcircleo",
      iconColor: "#FF9800",
      timestamp: "1 day ago",
      urgent: true,
    },
    {
      id: 3,
      text: "New assignment posted for Math.",
      icon: "book",
      iconColor: "#2196F3",
      timestamp: "3 days ago",
    },
    {
      id: 4,
      text: "Reminder: Submit your project by Friday.",
      icon: "filetext1",
      iconColor: "#9C27B0",
      timestamp: "5 days ago",
    },
  ]);

  useEffect(() => {
    (async () => {
      const user = "Avval Halani";
      setUser(user);
      console.log("user: ", user);
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

  const renderNotification = (notification) => (
    <Card
      key={notification.id}
      style={[
        notification.urgent ? styles.urgentNotification : null,
        {
          marginHorizontal: 0,
        },
      ]}
    >
      <View style={styles.notificationItem}>
        <AntDesign
          name={notification.icon}
          size={20}
          color={notification.iconColor}
          style={styles.notificationIcon}
        />
        <Text style={styles.notificationText}>{notification.text}</Text>
      </View>
      <Text style={styles.notificationTimestamp}>{notification.timestamp}</Text>
    </Card>
  );

  return !assetsLoaded ? (
    <ActivityIndicator size="large" color="#0000ff" />
  ) : (
    <Container style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.welcomeText}>Welcome Back,</Text>
            <Text style={styles.nameText}>Avval</Text>
          </View>
          <Feather name="user" size={25} color="#333" />
        </View>
        <Text style={styles.sectionTitle}>Quick Access</Text>

        <View style={styles.iconContainer}>
          {/* Attendance */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("attendance")}
          >
            <AntDesign name="checkcircleo" size={27} color="#333" />
            <Text style={styles.iconText}>Attendance</Text>
          </TouchableOpacity>

          {/* Fees */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("fees")}
          >
            <AntDesign name="creditcard" size={27} color="#333" />
            <Text style={styles.iconText}>Fees</Text>
          </TouchableOpacity>

          {/* Assignment */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("assignment")}
          >
            <AntDesign name="book" size={27} color="#333" />
            <Text style={styles.iconText}>Assignment</Text>
          </TouchableOpacity>

          {/* Lecture */}
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => navigation.navigate("lecture")}
          >
            <AntDesign name="filetext1" size={27} color="#333" />
            <Text style={styles.iconText}>Lecture</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Latest Notifications</Text>
        <View style={styles.notificationContainer}>
          {notifications.slice(-3).map(renderNotification)}
          <TouchableOpacity style={styles.viewMoreButton}>
            <Text style={styles.viewMoreText}>View More</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Upcoming Events</Text>
        <Card>
          <Text>Nothing to show here.</Text>
        </Card>

        <Text style={styles.sectionTitle}>Quick Links</Text>
        <Card>
          <Text>Nothing to show here.</Text>
        </Card>

        <Text style={styles.sectionTitle}>Useful Links</Text>
        <Card>
          <Text>Nothing to show here.</Text>
        </Card>
      </ScrollView>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    paddingBottom: screenHeight * 0.1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerText: {
    flexDirection: "row",
    alignItems: "center",
  },
  welcomeText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 18,
    marginRight: 5,
    color: "#333",
  },
  nameText: {
    fontFamily: "PlusJakartaSans_Bold",
    fontSize: 18,
    color: "#333",
  },
  sectionTitle: {
    fontFamily: "PlusJakartaSans_Bold",
    fontSize: 20,
    marginBottom: 10,
    paddingHorizontal: 20,
    paddingTop: 20,
    color: "#333",
  },
  iconContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  iconButton: {
    alignItems: "center",
  },
  iconText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 14,
    marginTop: 5,
    color: "#333",
  },
  notificationContainer: {
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  notificationItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  notificationIcon: {
    marginRight: 10,
  },
  notificationText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: "#333",
  },
  notificationTimestamp: {
    fontFamily: "PlusJakartaSans",
    fontSize: 12,
    color: "#888",
    marginTop: 5,
  },
  urgentNotification: {
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  viewMoreButton: {
    backgroundColor: "#2196F3",
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 15,
    alignSelf: "center",
    marginTop: 20,
  },
  viewMoreText: {
    fontFamily: "PlusJakartaSans",
    fontSize: 16,
    color: "#fff",
  },
});
