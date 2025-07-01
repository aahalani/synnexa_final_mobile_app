import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENDPOINTS, getConfig } from "../../../config";

const AttendanceScreen = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzeW5uZXhhVHV0b3JXZWJBcGlTdWJqZWN0IiwianRpIjoiYmFkOTgwYmYtYzc2MS00YjBhLWFiNDctYjNlZGE5MTEwMDhiIiwiaWF0IjoiMjcvOC8yMDI0IDg6MzY6NTVwbSIsIklkIjoiNiIsIlVzZXJOYW1lIjoiUzI0MDIwMSIsImV4cCI6MjA0MDEzMTIxNSwiaXNzIjoic3lubmV4YVR1dG9yV2ViQXBpSXNzdWVyIiwiYXVkIjoic3lubmV4YVR1dG9yV2ViQXBpQXVkaWVuY2UifQ.YNFygDgQM-PzcN-gA_GjJO-_-2GGdEFBhH3QthAuw-c";
      const userId = 6;
      const headers = getConfig(token, userId).headers;

      const response = await fetch(
        `${ENDPOINTS.GET_ATTENDANCE}?` +
          new URLSearchParams({
            tabConstant: "Attendance",
          }).toString(),
        {
          headers,
        }
      ).then((res) => res.json());

      console.log(response);
      setData(response);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setIsLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const calculateAttendancePercentage = (present, absent) => {
    const total = present + absent;
    return total > 0 ? ((present / total) * 100).toFixed(1) : 0;
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#000"]} // For Android
          tintColor="#000" // For iOS
          title="Pull to refresh"
          titleColor="#000"
        />
      }
    >
      <Text style={styles.header}>Attendance Overview</Text>
      {data.attendanceOverviewDtoList.map((course, index) => (
        <TouchableOpacity
          key={index}
          style={styles.courseCard}
          onPress={() => {
            router.push("(tabs)/attendance/Details");
          }}
        >
          <Text style={styles.courseName}>{course.courseName}</Text>
          <Text style={styles.batchName}>{course.batchName}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{course.presentCount}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{course.absentCount}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {calculateAttendancePercentage(
                  course.presentCount,
                  course.absentCount
                )}
                %
              </Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
          </View>
          <Text style={styles.dateRange}>
            {new Date(course.startDate).toLocaleDateString()} -{" "}
            {new Date(course.endDate).toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  batchName: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  dateRange: {
    fontSize: 14,
    color: "#999",
  },
});

export default AttendanceScreen;
