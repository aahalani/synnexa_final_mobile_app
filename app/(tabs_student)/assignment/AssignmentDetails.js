import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";

const height = Dimensions.get("window").height;

const AssignmentDetails = () => {
  const assignment = useLocalSearchParams();
  const [submission, setSubmission] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  console.log(assignment.isStudentAssignmetSubmitted);

  const handleSubmit = () => {
    console.log("Submitting assignment:", submission);
    console.log("Uploading files:", selectedFiles);
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        multiple: true,
      });

      if (result.type === "success") {
        setSelectedFiles([...selectedFiles, result]);
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

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      const fileName = `photo_${Date.now()}.jpg`;
      const newPath = FileSystem.documentDirectory + fileName;

      try {
        await FileSystem.moveAsync({
          from: asset.uri,
          to: newPath,
        });

        setSelectedFiles([...selectedFiles, { name: fileName, uri: newPath }]);
      } catch (error) {
        console.error("Error saving file:", error);
      }
    }
  };

  const removeFile = (index) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updatedFiles);
  };

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
                color:
                  assignment.isStudentAssignmetSubmitted === false
                    ? "#F44336"
                    : "#4CAF50",
              },
            ]}
          >
            {assignment.isStudentAssignmetSubmitted === false
              ? "Not Submitted"
              : "Submitted"}
          </Text>
        </View>
      </View>

      {assignment.assignmentUploadDtoList.length > 0 && (
        <View style={styles.attachmentsContainer}>
          <Text style={styles.attachmentsLabel}>Attachments:</Text>
          {assignment.assignmentUploadDtoList.map((attachment, index) => (
            <View
              key={attachment.assignmentUploadId}
              style={styles.attachmentItem}
            >
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
            {file.uri && (
              <Image source={{ uri: file.uri }} style={styles.thumbnail} />
            )}
            <Text style={styles.fileName}>{file.name}</Text>
            <TouchableOpacity onPress={() => removeFile(index)}>
              <Ionicons name="close-circle-outline" size={24} color="#F44336" />
            </TouchableOpacity>
          </View>
        ))}

        <TouchableOpacity
          onPress={handleSubmit}
          style={{
            padding: 12,
            borderRadius: 8,
            flex: 1,
            marginRight: 8,
            borderWidth: 1,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            Submit
          </Text>
        </TouchableOpacity>
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
    color: "#4c669f",
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
  submissionInput: {
    height: 120,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    textAlignVertical: "top",
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
    justifyContent: "space-between",
    backgroundColor: "#f0f0f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  fileName: {
    fontSize: 14,
    color: "#333",
    flex: 1,
    marginRight: 8,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 8,
  },
});

export default AssignmentDetails;
