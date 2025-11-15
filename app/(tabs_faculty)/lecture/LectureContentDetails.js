import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { apiFetch, apiUploadFormData, ENDPOINTS } from '../../../services/apiService';
import { getUser } from '../../../services/authService';
import { COLORS } from '../../../constants';
import { AntDesign } from '@expo/vector-icons';

const LectureContentDetailsScreen = () => {
  const [downloadingId, setDownloadingId] = useState(null);
  const [uploadingLectureId, setUploadingLectureId] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({}); // { lectureContentId: [files] }
  const [refreshing, setRefreshing] = useState(false);
  const [lectureData, setLectureData] = useState(null);
  const params = useLocalSearchParams();
  const batch = useMemo(() => {
    try {
      return params.batch ? JSON.parse(params.batch) : null;
    } catch (error) {
      console.error('Error parsing batch param:', error);
      return null;
    }
  }, [params.batch]);
  const course = useMemo(() => {
    try {
      return params.course ? JSON.parse(params.course) : null;
    } catch (error) {
      console.error('Error parsing course param:', error);
      return null;
    }
  }, [params.course]);
  // Initialize lectureData from params
  useEffect(() => {
    try {
      const parsedData = params.lectureData ? JSON.parse(params.lectureData) : null;
      if (parsedData) {
        setLectureData(parsedData);
      }
    } catch (error) {
      console.error('Error parsing lectureData param:', error);
    }
  }, [params.lectureData]);

  const dateRange = params.dateRange || '';

  const handleRefresh = useCallback(async () => {
    if (!batch || !course || !dateRange) {
      setRefreshing(false);
      return;
    }

    setRefreshing(true);
    try {
      const response = await apiFetch(ENDPOINTS.FACULTY_LECTURE_CONTENT_SEARCH, {
        method: 'POST',
        body: JSON.stringify({
          batchId: batch.batchId,
          courseId: course.courseId,
          lectureContentDateRangeStr: dateRange,
        }),
      });

      setLectureData(response);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to refresh lecture content.');
      console.error('Error refreshing lecture content:', error);
    } finally {
      setRefreshing(false);
    }
  }, [batch, course, dateRange]);

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

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleDownload = async (file) => {
    if (downloadingId) return;

    if (!file.fileBase64String) {
      Alert.alert('Download Failed', 'No file content available to download.');
      return;
    }

    setDownloadingId(file.lectureContentUploadId || file.originalFileName);

    // Ensure file has proper extension
    let fileName = file.originalFileName || 'download';
    if (!fileName.includes('.') && file.fileExtension) {
      fileName = fileName + file.fileExtension;
    } else if (!fileName.includes('.') && !file.fileExtension) {
      // Fallback: try to determine extension from content type
      const ext = file.fileContentType?.split('/')[1] || 'bin';
      fileName = fileName + '.' + ext;
    }

    const fileUri = FileSystem.cacheDirectory + fileName;

    try {
      await FileSystem.writeAsStringAsync(fileUri, file.fileBase64String, {
        encoding: FileSystem.EncodingType.Base64,
      });

      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please grant permission to save files to your device.');
          return;
        }
        await MediaLibrary.saveToLibraryAsync(fileUri);
        Alert.alert('Success', 'File saved to your gallery or downloads folder.');
      } else {
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert('Error', 'Sharing is not available on your device.');
          return;
        }
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error('Error during file download/saving:', error);
      Alert.alert('Download Error', 'Could not save the file.');
    } finally {
      setDownloadingId(null);
    }
  };

  const pickDocument = async (lectureContentId) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const files = result.assets.map((asset) => ({
          name: asset.name,
          uri: asset.uri,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size,
        }));
        setSelectedFiles((prev) => ({
          ...prev,
          [lectureContentId]: [...(prev[lectureContentId] || []), ...files],
        }));
      }
    } catch (err) {
      console.error('Error picking document:', err);
      Alert.alert('Error', 'Failed to pick document. Please try again.');
    }
  };

  const takePhoto = async (lectureContentId) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', "You've refused to allow this app to access your camera!");
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
          type: 'image/jpeg',
          size: asset.fileSize || 0,
        };
        setSelectedFiles((prev) => ({
          ...prev,
          [lectureContentId]: [...(prev[lectureContentId] || []), fileInfo],
        }));
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const showFilePickerOptions = (lectureContentId) => {
    Alert.alert(
      'Select File',
      'Choose how you want to add a file',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Pick Document', onPress: () => pickDocument(lectureContentId) },
        { text: 'Take Photo', onPress: () => takePhoto(lectureContentId) },
      ]
    );
  };

  const removeFile = (lectureContentId, index) => {
    setSelectedFiles((prev) => {
      const files = prev[lectureContentId] || [];
      const newFiles = files.filter((_, i) => i !== index);
      if (newFiles.length === 0) {
        const { [lectureContentId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [lectureContentId]: newFiles };
    });
  };

  const handleUpload = async (lectureContentId) => {
    const files = selectedFiles[lectureContentId];
    if (!files || files.length === 0) {
      Alert.alert('Error', 'Please select at least one file to upload.');
      return;
    }

    if (!lectureContentId) {
      Alert.alert('Error', 'Missing lecture content ID. Cannot upload.');
      return;
    }

    // Find the lecture data
    const lecture = lectureContentList.find((lec) => lec.lectureContentId === lectureContentId);
    if (!lecture) {
      Alert.alert('Error', 'Lecture content not found.');
      return;
    }

    setUploadingLectureId(lectureContentId);

    try {
      // Create FormData with files only
      // Note: lectureContentId must be sent as a query parameter, not form data
      const formData = new FormData();

      // Add all files with 'files' field name (matching API expectation)
      files.forEach((file, index) => {
        formData.append('files', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        });
      });


      // Use UploadLectureContentDocuments endpoint with lectureContentId as query parameter
      const endpoint = `${ENDPOINTS.FACULTY_LECTURE_CONTENT_UPLOAD_DOCUMENTS}?${new URLSearchParams({ lectureContentId: String(lectureContentId) })}`;
      await apiUploadFormData(endpoint, formData);

      // Clear selected files for this lecture
      setSelectedFiles((prev) => {
        const { [lectureContentId]: removed, ...rest } = prev;
        return rest;
      });
      
      Alert.alert(
        'Success',
        'Files uploaded successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Refresh the data to show newly uploaded files
              handleRefresh();
            },
          },
        ]
      );
    } catch (err) {
      console.error('Upload failed:', err);
      Alert.alert('Upload Failed', err.message || 'Failed to upload files. Please try again.');
    } finally {
      setUploadingLectureId(null);
    }
  };

  const lectureContentList = lectureData?.lectureContentDtoList || [];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <AntDesign name="arrowleft" size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Lecture Content</Text>
          <Text style={styles.headerSubtitle}>
            {course?.courseDisplayName || course?.name || 'Course'}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <AntDesign name="appstore1" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>{batch?.batchCode || 'N/A'}</Text>
          </View>
          <View style={styles.infoRow}>
            <AntDesign name="book" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>
              {course?.courseDisplayName || course?.name || 'N/A'}
            </Text>
          </View>
          {dateRange && (
            <View style={styles.infoRow}>
              <AntDesign name="calendar" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>{dateRange}</Text>
            </View>
          )}
          {lectureContentList.length > 0 && (
            <View style={styles.infoRow}>
              <AntDesign name="filetext1" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>
                {String(lectureContentList.length)} {lectureContentList.length === 1 ? 'lecture' : 'lectures'}
              </Text>
            </View>
          )}
        </View>

        {/* Lecture Content List */}
        {lectureContentList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AntDesign name="filetext1" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>No Lecture Content Found</Text>
            <Text style={styles.emptySubtext}>
              No lecture content found for the selected date range
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lecture Content</Text>
              <Text style={styles.sectionSubtitle}>
                {lectureContentList.length} {lectureContentList.length === 1 ? 'lecture' : 'lectures'} found
              </Text>
            </View>
            {lectureContentList.map((lecture, index) => (
              <View key={lecture.lectureContentId || index} style={styles.lectureCard}>
                {/* Lecture Header */}
                <View style={styles.lectureHeader}>
                  <View style={styles.lectureHeaderLeft}>
                    <AntDesign name="filetext1" size={24} color={COLORS.primary} />
                    <View style={styles.lectureTitleContainer}>
                      <Text style={styles.lectureTitle}>{lecture.lectureTitle || 'Untitled Lecture'}</Text>
                      <Text style={styles.lectureDate}>
                        {formatDate(lecture.lectureDate) || lecture.lectureDateStr || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Upload Files Section */}
                <View style={styles.uploadSection}>
                  <View style={styles.uploadSectionHeader}>
                    <Text style={styles.uploadSectionTitle}>Upload Files</Text>
                    <TouchableOpacity
                      style={styles.addFileButton}
                      onPress={() => showFilePickerOptions(lecture.lectureContentId)}
                      disabled={uploadingLectureId === lecture.lectureContentId}
                    >
                      <AntDesign name="plus" size={16} color={COLORS.primary} />
                      <Text style={styles.addFileButtonText}>Add File</Text>
                    </TouchableOpacity>
                  </View>
                  
                  {/* Selected Files Preview */}
                  {selectedFiles[lecture.lectureContentId] && selectedFiles[lecture.lectureContentId].length > 0 && (
                    <View style={styles.selectedFilesContainer}>
                      {selectedFiles[lecture.lectureContentId].map((file, index) => (
                        <View key={index} style={styles.selectedFileItem}>
                          <AntDesign name="file1" size={16} color={COLORS.primary} />
                          <Text style={styles.selectedFileName} numberOfLines={1}>
                            {file.name}
                          </Text>
                          <TouchableOpacity
                            onPress={() => removeFile(lecture.lectureContentId, index)}
                            style={styles.removeFileButton}
                          >
                            <AntDesign name="close" size={16} color={COLORS.gray} />
                          </TouchableOpacity>
                        </View>
                      ))}
                      <TouchableOpacity
                        style={[styles.uploadButton, uploadingLectureId === lecture.lectureContentId && styles.uploadButtonDisabled]}
                        onPress={() => handleUpload(lecture.lectureContentId)}
                        disabled={uploadingLectureId === lecture.lectureContentId}
                      >
                        {uploadingLectureId === lecture.lectureContentId ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <>
                            <AntDesign name="upload" size={16} color="#fff" />
                            <Text style={styles.uploadButtonText}>Upload Files</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>

                {/* Uploaded Files */}
                {lecture.lectureContentUploadDtoList && lecture.lectureContentUploadDtoList.length > 0 && (
                  <View style={styles.filesSection}>
                    <Text style={styles.filesSectionTitle}>
                      Files ({lecture.lectureContentUploadDtoList.length})
                    </Text>
                    {lecture.lectureContentUploadDtoList.map((file, fileIndex) => {
                      const hasBase64 = !!file.fileBase64String;
                      const isDownloading = downloadingId === (file.lectureContentUploadId || file.originalFileName);
                      return (
                        <TouchableOpacity
                          key={file.lectureContentUploadId || fileIndex}
                          style={styles.fileItem}
                          onPress={() => hasBase64 && handleDownload(file)}
                          disabled={isDownloading || !hasBase64}
                          activeOpacity={hasBase64 ? 0.7 : 1}
                        >
                          <View style={styles.fileIconContainer}>
                            {isDownloading ? (
                              <ActivityIndicator size="small" color={COLORS.primary} />
                            ) : (
                              <AntDesign 
                                name={
                                  file.fileExtension?.includes('.pdf') ? 'pdffile1' :
                                  file.fileExtension?.includes('.doc') || file.fileExtension?.includes('.docx') ? 'file1' :
                                  file.fileExtension?.includes('.jpg') || file.fileExtension?.includes('.jpeg') || file.fileExtension?.includes('.png') ? 'picture' :
                                  'file1'
                                } 
                                size={20} 
                                color={hasBase64 ? COLORS.primary : COLORS.gray2} 
                              />
                            )}
                          </View>
                          <View style={styles.fileInfo}>
                            <Text style={[styles.fileName, !hasBase64 && styles.fileNameDisabled]} numberOfLines={1}>
                              {file.originalFileName || 'Unknown File'}
                            </Text>
                            <Text style={styles.fileDetails}>
                              {formatFileSize(file.fileSizeBytes)} • {file.fileExtension || 'No extension'}
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

                {/* Lecture Metadata */}
                <View style={styles.lectureMetadata}>
                  {lecture.createdOn && (
                    <View style={styles.metadataRow}>
                      <AntDesign name="clockcircle" size={14} color={COLORS.gray} />
                      <Text style={styles.metadataText}>
                        Created: {formatDate(lecture.createdOn)}
                      </Text>
                    </View>
                  )}
                  {lecture.modifiedOn && (
                    <View style={styles.metadataRow}>
                      <AntDesign name="edit" size={14} color={COLORS.gray} />
                      <Text style={styles.metadataText}>
                        Modified: {formatDate(lecture.modifiedOn)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100, // Extra padding to ensure content is visible above tab bar
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  lectureCard: {
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
  lectureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  lectureHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  lectureTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  lectureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  lectureDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  uploadSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  uploadSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  addFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#F0F7FF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addFileButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 4,
  },
  selectedFilesContainer: {
    marginTop: 8,
  },
  selectedFileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedFileName: {
    fontSize: 12,
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  removeFileButton: {
    padding: 4,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 6,
  },
  filesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  filesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  fileNameDisabled: {
    color: COLORS.gray2,
  },
  fileDetails: {
    fontSize: 12,
    color: COLORS.gray,
  },
  lectureMetadata: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metadataText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default LectureContentDetailsScreen;

