import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const height = Dimensions.get("window").height;

const AssignmentDetails = () => {
  const params = useLocalSearchParams();
  const [assignment, setAssignment] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      if (params.assignmentData) {
        const parsedData = JSON.parse(params.assignmentData);
        if (typeof parsedData.assignmentUploadDtoList === "string") {
          parsedData.assignmentUploadDtoList = JSON.parse(
            parsedData.assignmentUploadDtoList
          );
        }
        setAssignment(parsedData);
      }
    } catch (error) {
      console.error("Error parsing assignment data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.assignmentData]);

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
      });

      console.log("DocumentPicker result:", result);

      if (!result.canceled) {
        if (result.assets && result.assets.length > 0) {
          // Multiple files selected
          const files = result.assets.map((asset) => ({
            name: asset.name,
            uri: asset.uri,
            type: asset.mimeType,
            size: asset.size,
          }));
          setSelectedFiles((prevFiles) => [...prevFiles, ...files]);
        } else {
          // Single file selected
          const fileInfo = {
            name: result.name,
            uri: result.uri,
            type: result.mimeType,
            size: result.size,
          };
          setSelectedFiles((prevFiles) => [...prevFiles, fileInfo]);
        }
      } else {
        console.log("Document picking canceled or dismissed");
      }
    } catch (err) {
      console.error("Error picking document:", err);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("You've refused to allow this app to access your camera!");
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = `photo_${Date.now()}.jpg`;
        const newPath = FileSystem.documentDirectory + fileName;

        await FileSystem.moveAsync({
          from: asset.uri,
          to: newPath,
        });

        const fileInfo = {
          name: fileName,
          uri: newPath,
          type: "image/jpeg",
          size: asset.fileSize || 0,
        };
        setSelectedFiles((prevFiles) => [...prevFiles, fileInfo]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      alert("Failed to capture photo. Please try again.");
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      alert("Please select at least one file to submit");
      return;
    }
    console.log("Files to upload:", selectedFiles);
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#4c669f" />
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text>No assignment data available</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.courseName}>{assignment.courseName}</Text>
        <Text style={styles.batchName}>{assignment.batchName}</Text>
      </View>

      <Text style={styles.title}>{assignment.assignmentDetails}</Text>

      <View style={styles.dateContainer}>
        <Ionicons name="calendar-outline" size={20} color="#666" />
        <Text style={styles.dateText}>
          {assignment.fromDateStr} - {assignment.toDateStr}
        </Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Out of:</Text>
          <Text style={styles.infoValue}>{assignment.outOff}</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status:</Text>
          <Text
            style={[
              styles.infoValue,
              {
                color: assignment.isStudentAssignmetSubmitted
                  ? "#4CAF50"
                  : "#F44336",
              },
            ]}
          >
            {assignment.isStudentAssignmetSubmitted
              ? "Submitted"
              : "Not Submitted"}
          </Text>
        </View>
      </View>

      {assignment.assignmentUploadDtoList?.length > 0 && (
        <View style={styles.attachmentsContainer}>
          <Text style={styles.attachmentsLabel}>Attachments:</Text>
          {assignment.assignmentUploadDtoList.map((attachment, index) => (
            <View key={index} style={styles.attachmentItem}>
              <Ionicons name="document-outline" size={24} color="#4c669f" />
              <Text style={styles.attachmentName}>
                {attachment.originalFileName}
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.submissionContainer}>
        <Text style={styles.submissionLabel}>Your Submission:</Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.filePickerButton}
            onPress={pickDocument}
          >
            <Ionicons name="attach-outline" size={24} color="#fff" />
            <Text style={styles.filePickerButtonText}>Add Files</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cameraButton} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={24} color="#fff" />
            <Text style={styles.filePickerButtonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>

        {selectedFiles.map((file, index) => (
          <View key={index} style={styles.fileItem}>
            {file.type?.startsWith("image/") ? (
              <Image source={{ uri: file.uri }} style={styles.thumbnail} />
            ) : (
              <Ionicons name="document-outline" size={24} color="#4c669f" />
            )}
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>
                {file.name}
              </Text>
              <Text style={styles.fileSize}>
                {(file.size / 1024).toFixed(2)} KB
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => removeFile(index)}
              style={styles.removeButton}
            >
              <Ionicons name="close-circle-outline" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        ))}

        {selectedFiles.length > 0 && (
          <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
            <Text style={styles.submitButtonText}>Submit Files</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  courseName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  batchName: {
    fontSize: 16,
    color: "#666",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  dateText: {
    fontSize: 16,
    color: "#666",
    marginLeft: 8,
  },
  infoContainer: {
    backgroundColor: "#f0f0f0",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  attachmentsContainer: {
    marginBottom: 16,
  },
  attachmentsLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  attachmentName: {
    fontSize: 16,
    color: "#000",
    marginLeft: 8,
  },
  submissionContainer: {
    marginTop: 16,
  },
  submissionLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  filePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4c669f",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
  },
  cameraButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
  },
  filePickerButtonText: {
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  fileItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 8,
  },
  fileName: {
    fontSize: 14,
    color: "#333",
    marginBottom: 2,
  },
  fileSize: {
    fontSize: 12,
    color: "#666",
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  removeButton: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: "#4c669f",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default AssignmentDetails;
