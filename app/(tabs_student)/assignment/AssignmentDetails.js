import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Platform,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as MediaLibrary from "expo-media-library";
import { apiUploadFormData, ENDPOINTS } from "../../../services/apiService";
import { COLORS } from "../../../constants";
import { AntDesign } from "@expo/vector-icons";

const AssignmentDetails = () => {
  const params = useLocalSearchParams();
  const [assignment, setAssignment] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

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
      }
    } catch (err) {
    }
  };

  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You've refused to allow this app to access your camera!");
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
      Alert.alert("Error", "Failed to capture photo. Please try again.");
    }
  };

  const removeFile = (index) => {
    setSelectedFiles((prevFiles) => prevFiles.filter((_, i) => i !== index));
  };

  const handleDownload = async (attachment) => {
    if (downloadingId) return;

    if (!attachment.fileBase64String) {
      Alert.alert('Download Failed', 'No file content available to download.');
      return;
    }

    setDownloadingId(attachment.assignmentUploadId || attachment.originalFileName);

    let fileName = attachment.originalFileName || 'download';
    if (!fileName.includes('.') && attachment.fileExtension) {
      fileName = fileName + attachment.fileExtension;
    } else if (!fileName.includes('.') && !attachment.fileExtension) {
      const ext = attachment.fileContentType?.split('/')[1] || 'bin';
      fileName = fileName + '.' + ext;
    }

    const fileUri = FileSystem.cacheDirectory + fileName;

    try {
      await FileSystem.writeAsStringAsync(fileUri, attachment.fileBase64String, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Detect file MIME type
      const mimeType = attachment.fileContentType || '';
      const isMediaFile = mimeType.startsWith('image/') || 
                         mimeType.startsWith('video/') || 
                         mimeType.startsWith('audio/');

      if (Platform.OS === 'android') {
        if (isMediaFile) {
          // For media files, use MediaLibrary
          try {
            const { status } = await MediaLibrary.requestPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Required', 'Please grant permission to save media files to your device.');
              return;
            }
            await MediaLibrary.saveToLibraryAsync(fileUri);
            Alert.alert('Success', 'File saved to your gallery.');
          } catch (error) {
            Alert.alert('Download Error', 'Could not save the media file. Please try again.');
          }
        } else {
          // For non-media documents, use sharing to let user pick save location
          // This is the recommended approach for Android as it works with scoped storage
          try {
            if (!(await Sharing.isAvailableAsync())) {
              // Fallback: try to copy to document directory if sharing not available
              const downloadsPath = FileSystem.documentDirectory + fileName;
              await FileSystem.copyAsync({
                from: fileUri,
                to: downloadsPath,
              });
              Alert.alert('Limited Access', 'File saved internally. You may not be able to access it from other apps.');
              return;
            }
            await Sharing.shareAsync(fileUri, {
              mimeType: mimeType || 'application/octet-stream',
              dialogTitle: 'Save file',
            });
          } catch (error) {
            Alert.alert('Download Error', 'Could not save the file. Please try again.');
          }
        }
      } else {
        // iOS - use sharing for all file types
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert('Error', 'Sharing is not available on your device.');
          return;
        }
        await Sharing.shareAsync(fileUri, {
          mimeType: mimeType || 'application/octet-stream',
        });
      }
    } catch (error) {
      Alert.alert('Download Error', 'Could not save the file.');
    } finally {
      setDownloadingId(null);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0 || isNaN(bytes)) return '0 B';
    try {
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      const size = Math.round(bytes / Math.pow(k, i) * 100) / 100;
      if (isNaN(size) || !isFinite(size)) return '0 B';
      return String(size) + ' ' + sizes[i];
    } catch (e) {
      return '0 B';
    }
  };

  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      Alert.alert("Error", "Please select at least one file to submit");
      return;
    }
    setIsSubmitting(true);
    try {
      const studentAssignmentId =
        assignment?.studentAssignmenId ||
        assignment?.studentAssignmentId ||
        assignment?.assignmentId;

      if (!studentAssignmentId) {
        Alert.alert("Error", "Missing assignment id. Cannot upload.");
        setIsSubmitting(false);
        return;
      }

      for (const file of selectedFiles) {
        const form = new FormData();
        const uri = file.uri;
        
        let sanitizedName = (file.name || `upload_${Date.now()}`)
          .replace(/[^a-zA-Z0-9._-]/g, '_')
          .replace(/_{2,}/g, '_');
        
        if (!sanitizedName.includes('.')) {
          const extension = file.type?.split('/')[1] || 'bin';
          sanitizedName = `${sanitizedName}.${extension}`;
        }
        
        const type = file.type || "application/octet-stream";

        form.append("abc", {
          uri,
          name: sanitizedName,
          type,
        });

        const endpoint = `${ENDPOINTS.STUDENT_ASSIGNMENT_UPLOAD}?${new URLSearchParams({ studentAssignmenId: String(studentAssignmentId) })}`;
        await apiUploadFormData(endpoint, form);
      }

      Alert.alert("Success", "Uploaded successfully.");
      setSelectedFiles([]);
    } catch (err) {
      Alert.alert("Error", err?.message || "Upload failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!assignment) {
    return (
      <View style={styles.loadingContainer}>
        <AntDesign name="filetext1" size={64} color={COLORS.gray} />
        <Text style={styles.emptyText}>No assignment data available</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.courseInfo}>
              <AntDesign name="book" size={24} color={COLORS.primary} />
              <View style={styles.courseTextContainer}>
                <Text style={styles.courseName}>{assignment.courseName || 'N/A'}</Text>
                <Text style={styles.batchName}>{assignment.batchName || 'N/A'}</Text>
              </View>
            </View>
            <View style={[
              styles.statusBadge,
              assignment.isStudentAssignmetSubmitted ? styles.statusBadgeSubmitted : styles.statusBadgePending
            ]}>
              <Text style={[
                styles.statusText,
                assignment.isStudentAssignmetSubmitted ? styles.statusTextSubmitted : styles.statusTextPending
              ]}>
                {assignment.isStudentAssignmetSubmitted ? 'Submitted' : 'Pending'}
              </Text>
            </View>
          </View>
        </View>

        {/* Assignment Details Card */}
        <View style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Assignment Details</Text>
          <Text style={styles.assignmentDetails}>
            {assignment.assignmentDetails || 'No details available'}
          </Text>

          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <AntDesign name="calendar" size={16} color={COLORS.gray} />
              <Text style={styles.infoText}>
                {assignment.fromDateStr || 'N/A'} - {assignment.toDateStr || 'N/A'}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <AntDesign name="star" size={16} color={COLORS.gray} />
              <Text style={styles.infoText}>Out of: {assignment.outOff || 0} marks</Text>
            </View>
            {assignment.obtainedMarks !== null && assignment.obtainedMarks !== undefined && (
              <View style={styles.infoRow}>
                <AntDesign name="checkcircle" size={16} color="#4CAF50" />
                <Text style={[styles.infoText, { color: '#4CAF50', fontWeight: '600' }]}>
                  Obtained: {assignment.obtainedMarks} marks
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Attachments Card */}
        {assignment.assignmentUploadDtoList?.length > 0 && (
          <View style={styles.attachmentsCard}>
            <View style={styles.sectionHeader}>
              <AntDesign name="paperclip" size={18} color={COLORS.primary} />
              <Text style={styles.sectionTitle}>Attachments</Text>
            </View>
            {assignment.assignmentUploadDtoList.map((attachment, index) => {
              const isDownloading = downloadingId === (attachment.assignmentUploadId || attachment.originalFileName);
              const isImage = attachment.fileContentType?.startsWith('image');
              const hasBase64 = !!attachment.fileBase64String;
              
              return (
                <TouchableOpacity
                  key={attachment.assignmentUploadId || index}
                  style={styles.attachmentItem}
                  onPress={() => hasBase64 && handleDownload(attachment)}
                  disabled={isDownloading || !hasBase64}
                  activeOpacity={hasBase64 ? 0.7 : 1}
                >
                  <View style={styles.attachmentIconContainer}>
                    {isDownloading ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <AntDesign
                        name={isImage ? 'picture' : 'file1'}
                        size={20}
                        color={hasBase64 ? COLORS.primary : COLORS.gray2}
                      />
                    )}
                  </View>
                  <View style={styles.attachmentInfo}>
                    <Text style={[styles.attachmentName, !hasBase64 && styles.attachmentNameDisabled]} numberOfLines={1}>
                      {attachment.originalFileName || 'Unknown File'}
                    </Text>
                    <Text style={styles.attachmentSize}>
                      {formatFileSize(attachment.fileSizeBytes)} • {attachment.fileExtension || ''}
                    </Text>
                  </View>
                  {!isDownloading && hasBase64 && (
                    <AntDesign name="download" size={18} color={COLORS.gray} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Submission Section Card */}
        <View style={styles.submissionCard}>
          <View style={styles.sectionHeader}>
            <AntDesign name="upload" size={18} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Your Submission</Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={pickDocument}
            >
              <AntDesign name="paperclip" size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Add Files</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.cameraButton]}
              onPress={takePhoto}
            >
              <AntDesign name="camera" size={20} color={COLORS.white} />
              <Text style={styles.actionButtonText}>Take Photo</Text>
            </TouchableOpacity>
          </View>

          {selectedFiles.length > 0 && (
            <>
              <View style={styles.selectedFilesContainer}>
                {selectedFiles.map((file, index) => (
                  <View key={index} style={styles.selectedFileItem}>
                    <View style={styles.selectedFileIcon}>
                      {file.type?.startsWith("image/") ? (
                        <Image source={{ uri: file.uri }} style={styles.thumbnail} />
                      ) : (
                        <AntDesign name="file1" size={20} color={COLORS.primary} />
                      )}
                    </View>
                    <View style={styles.selectedFileInfo}>
                      <Text style={styles.selectedFileName} numberOfLines={1}>
                        {file.name}
                      </Text>
                      <Text style={styles.selectedFileSize}>
                        {formatFileSize(file.size)}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFile(index)}
                      style={styles.removeButton}
                    >
                      <AntDesign name="closecircle" size={20} color="#F44336" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>

              <TouchableOpacity
                onPress={isSubmitting ? undefined : handleSubmit}
                style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <AntDesign name="checkcircle" size={20} color={COLORS.white} />
                    <Text style={styles.submitButtonText}>Submit Files</Text>
                  </>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  courseInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  courseTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  courseName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  batchName: {
    fontSize: 14,
    color: COLORS.gray,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeSubmitted: {
    backgroundColor: '#E8F5E9',
  },
  statusBadgePending: {
    backgroundColor: '#FFF3E0',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  statusTextSubmitted: {
    color: '#4CAF50',
  },
  statusTextPending: {
    color: '#FF9800',
  },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 8,
  },
  assignmentDetails: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  infoContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 8,
  },
  attachmentsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginTop: 8,
  },
  attachmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  attachmentNameDisabled: {
    color: COLORS.gray2,
  },
  attachmentSize: {
    fontSize: 12,
    color: COLORS.gray,
  },
  submissionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
  },
  cameraButton: {
    backgroundColor: '#4CAF50',
  },
  actionButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  selectedFilesContainer: {
    marginBottom: 16,
  },
  selectedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedFileIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  thumbnail: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  selectedFileInfo: {
    flex: 1,
  },
  selectedFileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  selectedFileSize: {
    fontSize: 12,
    color: COLORS.gray,
  },
  removeButton: {
    padding: 4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: 14,
    borderRadius: 8,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.gray,
    marginTop: 16,
  },
});

export default AssignmentDetails;
