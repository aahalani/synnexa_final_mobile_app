import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENDPOINTS, getConfig } from "../../../config";

const height = Dimensions.get("window").height;

const AssignmentScreen = () => {

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    const token = await AsyncStorage.getItem("token");
    const userId = await AsyncStorage.getItem("userId");
    const headers = getConfig(token, userId).headers;

    const response = await fetch(
      `${ENDPOINTS.GET_ATTENDANCE}?` +
        new URLSearchParams({
          tabConstant: "Submission",
        }).toString(),
      {
        headers,
      }
    ).then((res) => res.json());

    console.log(response);
    setData(response);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderAssignmentItem = ({ item }) => (
    <View style={styles.assignmentCard}>
      <View style={styles.assignmentHeader}>
        <Text style={styles.courseName}>{item.courseName}</Text>
        <Text style={styles.batchName}>{item.batchName}</Text>
      </View>
      <Text style={styles.assignmentDetails}>{item.assignmentDetails}</Text>
      <View style={styles.dateContainer}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.dateText}>
          {item.fromDateStr} - {item.toDateStr}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Out of:</Text>
        <Text style={styles.infoValue}>{item.outOff}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Status:</Text>
        <Text
          style={[
            styles.infoValue,
            { color: item.isStudentAssignmetSubmitted ? "#4CAF50" : "#F44336" },
          ]}
        >
          {item.isStudentAssignmetSubmitted ? "Submitted" : "Not Submitted"}
        </Text>
      </View>
      {item.assignmentUploadDtoList.length > 0 && (
        <View style={styles.attachmentsContainer}>
          <Text style={styles.attachmentsLabel}>Attachments:</Text>
          {item.assignmentUploadDtoList.map((attachment, index) => (
            <TouchableOpacity
              key={attachment.assignmentUploadId}
              style={styles.attachmentItem}
            >
              <Ionicons name="document-outline" size={20} color="#4c669f" />
              <Text style={styles.attachmentName}>
                {attachment.originalFileName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Assignments</Text>
      <FlatList
        data={data.assignmentDtoList}
        renderItem={renderAssignmentItem}
        keyExtractor={(item) => item.assignmentId.toString()}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 16,
    marginBottom: height > 700 ? 100 : 80,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  assignmentCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  batchName: {
    fontSize: 14,
    color: "#666",
  },
  assignmentDetails: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  attachmentsContainer: {
    marginTop: 8,
  },
  attachmentsLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  attachmentName: {
    fontSize: 14,
    color: "#4c669f",
    marginLeft: 4,
  },
});

export default AssignmentScreen;
