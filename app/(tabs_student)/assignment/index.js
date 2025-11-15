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
import { router } from 'expo-router';
import { apiFetch, ENDPOINTS } from '../../../services/apiService';
import { COLORS } from '../../../constants';
import { AntDesign } from '@expo/vector-icons';

const AssignmentScreen = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const endpoint = `${ENDPOINTS.STUDENT_DASHBOARD}?${new URLSearchParams({ tabConstant: 'Submission' })}`;
      const response = await apiFetch(endpoint);
      setData(response);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch assignments.');
      console.error('Error fetching assignment data:', error);
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

    setDownloadingId(attachment.assignmentUploadId || attachment.originalFileName);

    // Ensure file has proper extension
    let fileName = attachment.originalFileName || 'download';
    if (!fileName.includes('.') && attachment.fileExtension) {
      fileName = fileName + attachment.fileExtension;
    } else if (!fileName.includes('.') && !attachment.fileExtension) {
      // Fallback: try to determine extension from content type
      const ext = attachment.fileContentType?.split('/')[1] || 'bin';
      fileName = fileName + '.' + ext;
    }

    const fileUri = FileSystem.cacheDirectory + fileName;

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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const assignmentList = data?.assignmentDtoList || [];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {assignmentList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AntDesign name="book" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>No Assignments</Text>
            <Text style={styles.emptySubtext}>
              Your assignments will appear here
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Assignments</Text>
              <Text style={styles.sectionSubtitle}>
                {assignmentList.length} {assignmentList.length === 1 ? 'assignment' : 'assignments'} available
              </Text>
            </View>
            {assignmentList.map((item, index) => {
              const isSubmitted = item.isStudentAssignmetSubmitted;
              const attachments = Array.isArray(item.assignmentUploadDtoList)
                ? item.assignmentUploadDtoList
                : typeof item.assignmentUploadDtoList === 'string'
                ? (() => {
                    try {
                      return JSON.parse(item.assignmentUploadDtoList);
                    } catch {
                      return [];
                    }
                  })()
                : [];

              return (
                <TouchableOpacity
                  key={item.assignmentId || index}
                  style={styles.assignmentCard}
                  activeOpacity={0.7}
                  onPress={() => {
                    router.push({
                      pathname: '/(tabs_student)/assignment/AssignmentDetails',
                      params: {
                        assignmentData: JSON.stringify(item),
                      },
                    });
                  }}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.courseInfo}>
                      <AntDesign name="book" size={24} color={COLORS.primary} />
                      <View style={styles.courseTextContainer}>
                        <Text style={styles.courseName}>{item.courseName || 'N/A'}</Text>
                        <Text style={styles.batchName}>{item.batchName || 'N/A'}</Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, isSubmitted ? styles.statusBadgeSubmitted : styles.statusBadgePending]}>
                      <Text style={[styles.statusText, isSubmitted ? styles.statusTextSubmitted : styles.statusTextPending]}>
                        {isSubmitted ? 'Submitted' : 'Pending'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.assignmentDetails} numberOfLines={3}>
                    {item.assignmentDetails || 'No details available'}
                  </Text>

                  <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                      <AntDesign name="calendar" size={14} color={COLORS.gray} />
                      <Text style={styles.infoText}>
                        {item.fromDateStr || 'N/A'} - {item.toDateStr || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.infoRow}>
                      <AntDesign name="star" size={14} color={COLORS.gray} />
                      <Text style={styles.infoText}>Out of: {item.outOff || 0} marks</Text>
                    </View>
                    {item.obtainedMarks !== null && item.obtainedMarks !== undefined && (
                      <View style={styles.infoRow}>
                        <AntDesign name="checkcircle" size={14} color="#4CAF50" />
                        <Text style={[styles.infoText, { color: '#4CAF50', fontWeight: '600' }]}>
                          Obtained: {item.obtainedMarks} marks
                        </Text>
                      </View>
                    )}
                  </View>

                  {attachments.length > 0 && (
                    <View style={styles.attachmentsContainer}>
                      <View style={styles.attachmentsHeader}>
                        <AntDesign name="paperclip" size={14} color={COLORS.gray} />
                        <Text style={styles.attachmentsLabel}>
                          {attachments.length} {attachments.length === 1 ? 'attachment' : 'attachments'}
                        </Text>
                      </View>
                      {attachments.map((attachment, attIndex) => {
                        const isDownloading = downloadingId === (attachment.assignmentUploadId || attachment.originalFileName);
                        const isImage = attachment.fileContentType?.startsWith('image');
                        const hasBase64 = !!attachment.fileBase64String;
                        
                        return (
                          <TouchableOpacity
                            key={attachment.assignmentUploadId || attIndex}
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
                                  size={16}
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
                              <AntDesign name="download" size={16} color={COLORS.gray} />
                            )}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  )}

                  <View style={styles.cardFooter}>
                    <AntDesign name="right" size={16} color={COLORS.gray} />
                  </View>
                </TouchableOpacity>
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
  assignmentCard: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
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
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  batchName: {
    fontSize: 12,
    color: COLORS.gray,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
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
  assignmentDetails: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 12,
  },
  infoContainer: {
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 6,
  },
  attachmentsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  attachmentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentsLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 6,
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginTop: 6,
  },
  attachmentIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  attachmentInfo: {
    flex: 1,
  },
  attachmentName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  attachmentSize: {
    fontSize: 11,
    color: COLORS.gray,
  },
  attachmentNameDisabled: {
    color: COLORS.gray2,
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: 8,
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

export default AssignmentScreen;
