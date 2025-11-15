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
import { getUser } from '../../../services/authService';
import { COLORS } from '../../../constants';
import { AntDesign } from '@expo/vector-icons';

const Details = () => {
  const params = useLocalSearchParams();
  const course = useMemo(() => {
    try {
      return params.course ? JSON.parse(params.course) : null;
    } catch (error) {
      console.error('Error parsing course param:', error);
      return null;
    }
  }, [params.course]);

  const [attendanceData, setAttendanceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [studentId, setStudentId] = useState(null);

  // Get studentId from user context
  useEffect(() => {
    const fetchStudentId = async () => {
      try {
        const user = await getUser();
        if (user?.studentRegistrationDto?.studentId) {
          setStudentId(user.studentRegistrationDto.studentId);
        } else if (user?.userId) {
          setStudentId(user.userId);
        }
      } catch (error) {
        console.error('Error fetching student ID:', error);
      }
    };
    fetchStudentId();
  }, []);

  // Build the request body based on the API structure from the image
  const buildRequestBody = useCallback(() => {
    if (!course) return null;
    
    return {
      studentId: studentId || course.studentId || 0,
      courseId: course.id || course.courseId || 0,
      courseCode: course.courseCode || '',
      courseName: course.courseName || '',
      batchId: course.batchId || 0,
      batchCode: course.batchCode || '',
      batchName: course.batchName || '',
      startDate: course.startDate || new Date().toISOString(),
      endDate: course.endDate || new Date().toISOString(),
      presentCount: course.presentCount || 0,
      absentCount: course.absentCount || 0,
      attendancePercentage: course.attendancePercentage || 0,
    };
  }, [course, studentId]);

  const fetchAttendanceData = useCallback(async () => {
    if (!course) {
      setIsLoading(false);
      setRefreshing(false);
      return;
    }

    setIsLoading(true);
    try {
      const requestBody = buildRequestBody();
      if (!requestBody) {
        setIsLoading(false);
        setRefreshing(false);
        return;
      }

      const response = await apiFetch(ENDPOINTS.STUDENT_ATTENDANCE_OVERVIEW, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      // Handle response - it should be an array of attendance records
      // If response is already an array, use it directly
      // If it's wrapped in an object, try to extract the array
      if (Array.isArray(response)) {
        setAttendanceData(response);
      } else if (response && Array.isArray(response.data)) {
        setAttendanceData(response.data);
      } else if (response && Array.isArray(response.attendanceDetailsDtoList)) {
        setAttendanceData(response.attendanceDetailsDtoList);
      } else {
        // If response is not an array, set empty array
        setAttendanceData([]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch attendance details.');
      console.error('Error fetching attendance data:', error);
      setAttendanceData([]);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [course, buildRequestBody]);

  useEffect(() => {
    // Only fetch if we have both course and studentId
    if (course && (studentId !== null || course.studentId)) {
      fetchAttendanceData();
    } else if (course) {
      // If we have course but no studentId yet, wait a bit for studentId to load
      const timer = setTimeout(() => {
        if (studentId !== null || course.studentId) {
          fetchAttendanceData();
        } else {
          setIsLoading(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [fetchAttendanceData, course, studentId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendanceData();
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

  // Calculate attendance statistics
  const attendanceStats = useMemo(() => {
    if (!attendanceData || !Array.isArray(attendanceData)) {
      return { total: 0, present: 0, absent: 0, percentage: 0 };
    }
    const records = attendanceData;
    const total = records.length;
    const present = records.filter((r) => r.isPresent === true).length;
    const absent = records.filter((r) => r.isPresent === false).length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { total, present, absent, percentage };
  }, [attendanceData]);

  // Sort attendance records by date (newest first)
  const sortedAttendanceRecords = useMemo(() => {
    if (!attendanceData || !Array.isArray(attendanceData)) return [];
    return [...attendanceData].sort((a, b) => {
      const dateA = new Date(a.attendanceDate || 0);
      const dateB = new Date(b.attendanceDate || 0);
      return dateB.getTime() - dateA.getTime();
    });
  }, [attendanceData]);

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
            <Text style={styles.headerTitle}>Attendance Details</Text>
            <Text style={styles.headerSubtitle}>
              {course?.courseName || course?.courseDisplayName || 'Course'}
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
          <Text style={styles.headerTitle}>Attendance Details</Text>
          <Text style={styles.headerSubtitle}>
            {course?.courseName || course?.courseDisplayName || 'Course'}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <AntDesign name="appstore1" size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>{course?.batchCode || course?.batchName || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <AntDesign name="book" size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>
            {course?.courseCode || course?.courseName || 'N/A'}
          </Text>
        </View>
        {attendanceStats.total > 0 && (
          <View style={styles.infoRow}>
            <AntDesign name="calendar" size={16} color={COLORS.primary} />
            <Text style={styles.infoText}>
              {attendanceStats.total} {attendanceStats.total === 1 ? 'record' : 'records'}
            </Text>
          </View>
        )}
      </View>

      {/* Attendance Overview Stats */}
      {attendanceStats.total > 0 && (
        <View style={styles.statsCard}>
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <AntDesign name="checkcircle" size={20} color="#4CAF50" />
            </View>
            <Text style={styles.statValue}>{attendanceStats.present}</Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: '#FFEBEE' }]}>
              <AntDesign name="closecircle" size={20} color="#F44336" />
            </View>
            <Text style={styles.statValue}>{attendanceStats.absent}</Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
          <View style={styles.statItem}>
            <View style={[styles.statIconContainer, { backgroundColor: attendanceStats.percentage >= 75 ? '#E8F5E9' : '#FFF3E0' }]}>
              <AntDesign name="linechart" size={20} color={attendanceStats.percentage >= 75 ? '#4CAF50' : '#FF9800'} />
            </View>
            <Text style={[styles.statValue, { color: attendanceStats.percentage >= 75 ? '#4CAF50' : '#FF9800' }]}>
              {attendanceStats.percentage}%
            </Text>
            <Text style={styles.statLabel}>Overall</Text>
          </View>
        </View>
      )}

      {/* Attendance Records List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {sortedAttendanceRecords.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AntDesign name="calendar" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>No Attendance Records</Text>
            <Text style={styles.emptySubtext}>
              Your attendance records will appear here
            </Text>
          </View>
        ) : (
          sortedAttendanceRecords.map((record, index) => (
            <View key={record.attendanceDate || index} style={styles.attendanceCard}>
              <View style={styles.cardContent}>
                <View style={styles.dateSection}>
                  <AntDesign name="calendar" size={16} color={COLORS.primary} />
                  <Text style={styles.attendanceDate}>
                    {formatDate(record.attendanceDate)}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    record.isPresent ? styles.statusBadgePresent : styles.statusBadgeAbsent,
                  ]}
                >
                  <AntDesign
                    name={record.isPresent ? 'checkcircle' : 'closecircle'}
                    size={14}
                    color="#fff"
                  />
                  <Text style={styles.statusBadgeText}>
                    {record.isPresent ? 'Present' : 'Absent'}
                  </Text>
                </View>
              </View>
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
    paddingTop: 16,
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
  statsCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    borderRadius: 12,
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
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.gray,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  attendanceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  attendanceDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginLeft: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgePresent: {
    backgroundColor: '#4CAF50',
  },
  statusBadgeAbsent: {
    backgroundColor: '#F44336',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
    marginLeft: 4,
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

export default Details;
