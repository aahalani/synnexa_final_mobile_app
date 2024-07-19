import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { useEffect } from "react";
import { ENDPOINTS, getConfig } from "../../../config";

const LectureScreen = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    const token = await AsyncStorage.getItem("token");
    const userId = await AsyncStorage.getItem("userId");
    const headers = getConfig(token, userId).headers;

    const response = await fetch(
      `${ENDPOINTS.GET_ATTENDANCE}?` +
        new URLSearchParams({
          tabConstant: "Course Content",
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
  const renderAttachmentItem = ({ item }) => (
    <TouchableOpacity style={styles.attachmentItem}>
      <Ionicons
        name={
          item.fileContentType.startsWith("image")
            ? "image-outline"
            : "document-outline"
        }
        size={24}
        color="#4c669f"
      />
      <Text style={styles.attachmentName}>{item.originalFileName}</Text>
    </TouchableOpacity>
  );

  const renderLectureItem = ({ item }) => (
    <View style={styles.lectureCard}>
      <View style={styles.lectureHeader}>
        <Text style={styles.lectureTitle}>{item.lectureTitle}</Text>
        <Text style={styles.lectureDate}>{item.lectureDateStr}</Text>
      </View>
      <View style={styles.attachmentsContainer}>
        <Text style={styles.attachmentsLabel}>Attachments:</Text>
        <FlatList
          data={item.lectureContentUploadDtoList}
          renderItem={renderAttachmentItem}
          keyExtractor={(attachment) => attachment.lectureContentUploadId}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        />
      </View>
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
      <Text style={styles.header}>Lecture Content</Text>
      <FlatList
        data={data.lectureContentDtoList}
        renderItem={renderLectureItem}
        keyExtractor={(item) => item.lectureContentId}
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
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  lectureCard: {
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
  lectureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  lectureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  lectureDate: {
    fontSize: 14,
    color: "#666",
  },
  attachmentsContainer: {
    marginTop: 8,
  },
  attachmentsLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  attachmentName: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
});

export default LectureScreen;
