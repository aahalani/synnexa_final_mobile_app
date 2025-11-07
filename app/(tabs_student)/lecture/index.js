import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library';
import { apiFetch, ENDPOINTS } from '../../../services/apiService';
import { COLORS } from '../../../constants';
import { AntDesign } from '@expo/vector-icons';

const LectureScreen = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const endpoint = `${ENDPOINTS.STUDENT_DASHBOARD}?${new URLSearchParams({ tabConstant: 'Course Content' })}`;
      const response = await apiFetch(endpoint);
      setData(response);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch lecture content.');
      console.error('Error fetching lecture data:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDownload = async (attachment) => {
    if (downloadingId) return;

    if (!attachment.fileBase64String) {
      Alert.alert('Download Failed', 'No file content available to download.');
      return;
    }

    setDownloadingId(attachment.lectureContentUploadId);

    const fileUri = FileSystem.cacheDirectory + attachment.originalFileName;

    try {
      await FileSystem.writeAsStringAsync(fileUri, attachment.fileBase64String, {
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const lectureList = data?.lectureContentDtoList || [];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {lectureList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AntDesign name="filetext1" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>No Lecture Content</Text>
            <Text style={styles.emptySubtext}>
              Lecture materials will appear here when available
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Lecture Content</Text>
              <Text style={styles.sectionSubtitle}>
                {lectureList.length} {lectureList.length === 1 ? 'lecture' : 'lectures'} available
              </Text>
            </View>
            {lectureList.map((item, index) => {
              const attachments = item.lectureContentUploadDtoList || [];
              
              // Generate stable unique key for lecture card
              const lectureKey = item.lectureContentId 
                ? String(item.lectureContentId)
                : `${item.lectureTitle || 'lecture'}-${item.lectureDateStr || item.lectureDate || index}`;
              
              return (
                <View key={lectureKey} style={styles.lectureCard}>
                  <View style={styles.lectureHeader}>
                    <View style={styles.lectureHeaderLeft}>
                      <AntDesign name="filetext1" size={24} color={COLORS.primary} />
                      <View style={styles.lectureTitleContainer}>
                        <Text style={styles.lectureTitle}>{item.lectureTitle || 'Untitled Lecture'}</Text>
                        <Text style={styles.lectureDate}>
                          {formatDate(item.lectureDate) || item.lectureDateStr || 'N/A'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {attachments.length > 0 && (
                    <View style={styles.attachmentsSection}>
                      <View style={styles.attachmentsHeader}>
                        <AntDesign name="paperclip" size={16} color={COLORS.gray} />
                        <Text style={styles.attachmentsLabel}>
                          {attachments.length} {attachments.length === 1 ? 'file' : 'files'}
                        </Text>
                      </View>
                      {attachments.map((attachment, attIndex) => {
                        const isDownloading = downloadingId === attachment.lectureContentUploadId;
                        const isImage = attachment.fileContentType?.startsWith('image');
                        
                        // Generate stable unique key for attachment
                        const attachmentKey = attachment.lectureContentUploadId
                          ? String(attachment.lectureContentUploadId)
                          : `${attachment.originalFileName || 'file'}-${attachment.fileSizeBytes || attachment.fileContentType || attIndex}`;
                        
                        return (
                          <TouchableOpacity
                            key={attachmentKey}
                            style={styles.attachmentItem}
                            onPress={() => handleDownload(attachment)}
                            disabled={isDownloading}
                            activeOpacity={0.7}
                            accessible={true}
                            accessibilityRole="button"
                            accessibilityLabel={`Download ${attachment.originalFileName || 'file'}`}
                          >
                            <View style={styles.attachmentIconContainer}>
                              {isDownloading ? (
                                <ActivityIndicator size="small" color={COLORS.primary} />
                              ) : (
                                <AntDesign
                                  name={isImage ? 'picture' : 'file1'}
                                  size={20}
                                  color={COLORS.primary}
                                />
                              )}
                            </View>
                            <View style={styles.attachmentInfo}>
                              <Text style={styles.attachmentName} numberOfLines={1}>
                                {attachment.originalFileName || 'Unknown File'}
                              </Text>
                              <Text style={styles.attachmentSize}>
                                {formatFileSize(attachment.fileSizeBytes)} • {attachment.fileExtension || 'No extension'}
                              </Text>
                            </View>
                            {!isDownloading && (
                              <AntDesign name="download" size={18} color={COLORS.gray} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}
                </View>
              );
            })}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
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
    marginBottom: 16,
  },
  lectureHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
  attachmentsSection: {
    marginTop: 12,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  attachmentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  attachmentsLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginLeft: 6,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
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
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 12,
    color: COLORS.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.primary,
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 8,
    textAlign: 'center',
  },
});

export default LectureScreen;
