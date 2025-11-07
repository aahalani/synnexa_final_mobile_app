import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { apiFetch, ENDPOINTS } from '../../../services/apiService';
import { COLORS } from '../../../constants';
import { AntDesign } from '@expo/vector-icons';

const AssignmentSubmissionsScreen = () => {
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

  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Submitted');

  // Build the request body with required fields
  const buildRequestBody = useCallback((status) => {
    return {
      pageSize: 10,
      pageNumber: 1,
      batchId: batch?.batchId || 0,
      courseId: course?.courseId || 0,
      status: status,
      studentAssignmentDto: {
        studentAssignmentId: 0,
        assignmentId: 0,
        studentId: 0,
        batchId: batch?.batchId || 0,
        courseId: course?.courseId || 0,
        status: status,
      },
    };
  }, [batch, course]);

  const fetchData = useCallback(async () => {
    if (!batch || !course) {
      setIsLoading(false);
      setRefreshing(false);
      return;
    }

    setIsLoading(true);
    try {
      const requestBody = buildRequestBody(selectedStatus);
      const response = await apiFetch(ENDPOINTS.FACULTY_SEARCH_ASSIGNMENTS, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      setData(response);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch assignment submissions.');
      if (__DEV__) {
        console.error('Error fetching assignment submissions');
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [batch, course, buildRequestBody, selectedStatus]);

  // Fetch data on mount and when status changes
  useEffect(() => {
    if (!batch || !course) {
      setIsLoading(false);
      return;
    }

    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
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

  // Filter submissions by selected status - MUST be before any early returns
  const submissions = useMemo(() => {
    const allSubmissions = data?.studentAssignmentDtoList || [];
    return allSubmissions.filter(
      (submission) => submission.status === selectedStatus
    );
  }, [data?.studentAssignmentDtoList, selectedStatus]);
  
  const statusList = useMemo(() => {
    return data?.statusList && data.statusList.length > 0 
      ? data.statusList 
      : ['Submitted', 'Completed'];
  }, [data?.statusList]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <AntDesign name="arrowleft" size={24} color={COLORS.primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Assignment Submissions</Text>
            <Text style={styles.headerSubtitle}>
              {course?.courseDisplayName || course?.name || 'Course'}
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </View>
    );
  }

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
          <Text style={styles.headerTitle}>Assignment Submissions</Text>
          <Text style={styles.headerSubtitle}>
            {course?.courseDisplayName || course?.name || 'Course'}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Status Filter */}
      {statusList.length > 0 && (
        <View style={styles.statusFilter}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {statusList.map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  selectedStatus === status && styles.statusButtonActive,
                ]}
                onPress={() => {
                  setSelectedStatus(status);
                }}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    selectedStatus === status && styles.statusButtonTextActive,
                  ]}
                >
                  {status}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

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
        {data && (
          <View style={styles.infoRow}>
            <AntDesign name="filetext1" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>
              {String(data.totalItemCount || 0)} {data.totalItemCount === 1 ? 'submission' : 'submissions'}
            </Text>
          </View>
        )}
      </View>

      {/* Submissions List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {submissions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AntDesign name="inbox" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>No Submissions Found</Text>
            <Text style={styles.emptySubtext}>
              No assignments found with status "{selectedStatus}"
            </Text>
          </View>
        ) : (
          submissions.map((submission, index) => (
            <View key={submission.studentAssignmentId || index} style={styles.submissionCard}>
              {/* Student Info */}
              <View style={styles.studentHeader}>
                <View style={styles.studentInfo}>
                  <View style={styles.studentAvatar}>
                    <AntDesign name="user" size={24} color={COLORS.primary} />
                  </View>
                  <View style={styles.studentDetails}>
                    <Text style={styles.studentName}>
                      {submission.studentRegistrationDto?.studentFullName ||
                        `${submission.studentRegistrationDto?.firstName || ''} ${submission.studentRegistrationDto?.lastName || ''}`.trim() ||
                        'Unknown Student'}
                    </Text>
                    {submission.studentRegistrationDto?.stuNum && (
                      <Text style={styles.studentCode}>
                        {submission.studentRegistrationDto.stuNum}
                      </Text>
                    )}
                  </View>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    submission.status === 'Submitted' && styles.statusBadgeSubmitted,
                    submission.status === 'Completed' && styles.statusBadgeCompleted,
                  ]}
                >
                  <Text style={styles.statusBadgeText}>{submission.status || 'Pending'}</Text>
                </View>
              </View>

              {/* Assignment Details */}
              {submission.assignmentDto && (
                <View style={styles.assignmentSection}>
                  <Text style={styles.sectionTitle}>Assignment Details</Text>
                  {submission.assignmentDto.assignmentDetails && (
                    <Text style={styles.assignmentDetails}>
                      {submission.assignmentDto.assignmentDetails}
                    </Text>
                  )}
                  <View style={styles.dateRow}>
                    <AntDesign name="calendar" size={14} color={COLORS.gray} />
                    <Text style={styles.dateText}>
                      Due: {formatDate(submission.assignmentDto.toDate)}
                    </Text>
                  </View>
                  {submission.assignmentDto.assignmentCreatedDateStr && (
                    <View style={styles.dateRow}>
                      <AntDesign name="clockcircle" size={14} color={COLORS.gray} />
                      <Text style={styles.dateText}>
                        Created: {submission.assignmentDto.assignmentCreatedDateStr}
                      </Text>
                    </View>
                  )}
                </View>
              )}

              {/* Submission Info */}
              <View style={styles.submissionSection}>
                <Text style={styles.sectionTitle}>Submission</Text>
                {submission.studentSubmissionDate && (
                  <View style={styles.dateRow}>
                    <AntDesign name="checkcircle" size={14} color="#4CAF50" />
                    <Text style={styles.dateText}>
                      Submitted: {formatDate(submission.studentSubmissionDate)}
                    </Text>
                  </View>
                )}
                {submission.studentRemark && (
                  <View style={styles.remarkContainer}>
                    <Text style={styles.remarkLabel}>Student Remark:</Text>
                    <Text style={styles.remarkText}>{submission.studentRemark}</Text>
                  </View>
                )}
              </View>

              {/* Uploaded Files */}
              {submission.studentAssignmentUploadDtoList &&
                submission.studentAssignmentUploadDtoList.length > 0 && (
                  <View style={styles.filesSection}>
                    <Text style={styles.sectionTitle}>
                      Files ({submission.studentAssignmentUploadDtoList.length})
                    </Text>
                    {submission.studentAssignmentUploadDtoList.map((file, fileIndex) => (
                      <View key={file.studentAssignmentUploadId || fileIndex} style={styles.fileItem}>
                        <AntDesign name="file1" size={20} color={COLORS.primary} />
                        <View style={styles.fileInfo}>
                          <Text style={styles.fileName} numberOfLines={1}>
                            {file.originalFileName || 'Unknown file'}
                          </Text>
                          <Text style={styles.fileSize}>
                            {formatFileSize(file.fileSizeBytes) || '0 B'} • {file.fileExtension || ''}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

              {/* Marks and Faculty Remark */}
              {(submission.obtainedMarks !== null && submission.obtainedMarks !== undefined ||
                submission.facultyRemark ||
                (submission.assignmentDto?.outOff !== undefined && submission.assignmentDto?.outOff !== null)) && (
                <View style={styles.gradingSection}>
                  <Text style={styles.sectionTitle}>Grading</Text>
                  {submission.assignmentDto?.outOff !== undefined && submission.assignmentDto?.outOff !== null && (
                    <View style={styles.marksRow}>
                      <Text style={styles.marksLabel}>Total Marks:</Text>
                      <Text style={styles.marksValue}>{String(submission.assignmentDto.outOff)}</Text>
                    </View>
                  )}
                  {submission.obtainedMarks !== null && submission.obtainedMarks !== undefined && (
                    <View style={styles.marksRow}>
                      <Text style={styles.marksLabel}>Obtained Marks:</Text>
                      <Text style={[styles.marksValue, styles.marksValueObtained]}>
                        {String(submission.obtainedMarks)}
                      </Text>
                    </View>
                  )}
                  {submission.facultyRemark && (
                    <View style={styles.remarkContainer}>
                      <Text style={styles.remarkLabel}>Faculty Remark:</Text>
                      <Text style={styles.remarkText}>{submission.facultyRemark}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          ))
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
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  headerSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 2,
  },
  placeholder: {
    width: 40,
  },
  statusFilter: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  statusButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.gray,
  },
  statusButtonTextActive: {
    color: '#fff',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    justifyContent: 'space-around',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    marginLeft: 8,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
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
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  studentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  studentAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F4FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  studentDetails: {
    flex: 1,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  studentCode: {
    fontSize: 13,
    color: COLORS.gray,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  statusBadgeSubmitted: {
    backgroundColor: '#FFF3CD',
  },
  statusBadgeCompleted: {
    backgroundColor: '#D4EDDA',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  assignmentSection: {
    marginBottom: 16,
  },
  assignmentDetails: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 8,
    lineHeight: 20,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  dateText: {
    fontSize: 13,
    color: COLORS.gray,
    marginLeft: 6,
  },
  submissionSection: {
    marginBottom: 16,
  },
  remarkContainer: {
    marginTop: 8,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
  },
  remarkLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.gray,
    marginBottom: 4,
  },
  remarkText: {
    fontSize: 14,
    color: '#1A1A1A',
    lineHeight: 20,
  },
  filesSection: {
    marginBottom: 16,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginTop: 8,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 12,
    color: COLORS.gray,
  },
  gradingSection: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  marksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  marksLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
  },
  marksValue: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
  },
  marksValueObtained: {
    color: '#4CAF50',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 100,
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

export default AssignmentSubmissionsScreen;

