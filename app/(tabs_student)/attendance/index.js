import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { apiFetch, ENDPOINTS } from '../../../services/apiService';
import { COLORS } from '../../../constants';
import { AntDesign } from '@expo/vector-icons';

const AttendanceScreen = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const endpoint = `${ENDPOINTS.STUDENT_DASHBOARD}?${new URLSearchParams({ tabConstant: 'Attendance' })}`;
      const response = await apiFetch(endpoint);
      setData(response);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch attendance data.');
      console.error('Error fetching data:', error);
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
  
  const calculateAttendancePercentage = (present, absent) => {
    const total = present + absent;
    return total > 0 ? ((present / total) * 100).toFixed(1) : 0;
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

  const attendanceList = data?.attendanceOverviewDtoList || [];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {attendanceList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AntDesign name="calendar" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>No Attendance Data</Text>
            <Text style={styles.emptySubtext}>
              Your attendance records will appear here
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Attendance Overview</Text>
              <Text style={styles.sectionSubtitle}>
                {attendanceList.length} {attendanceList.length === 1 ? 'course' : 'courses'}
              </Text>
            </View>
            {attendanceList.map((course, index) => {
              const percentage = parseFloat(calculateAttendancePercentage(course.presentCount, course.absentCount));
              const isGoodAttendance = percentage >= 75;
              
              // Generate stable unique key
              const courseId = course.id || course.courseId || course.batchId;
              const courseKey = courseId 
                ? String(courseId)
                : `${course.courseName || 'course'}-${course.batchName || 'batch'}`;
              
              return (
                <TouchableOpacity
                  key={courseKey}
                  style={styles.courseCard}
                  activeOpacity={0.7}
                  onPress={() => {
                    router.push({
                      pathname: '/(tabs_student)/attendance/Details',
                      params: {
                        course: JSON.stringify(course),
                      },
                    });
                  }}
                >
                  <View style={styles.cardHeader}>
                    <View style={styles.courseInfo}>
                      <AntDesign name="book" size={24} color={COLORS.primary} />
                      <View style={styles.courseTextContainer}>
                        <Text style={styles.courseName}>{course.courseName || 'N/A'}</Text>
                        <Text style={styles.batchName}>{course.batchName || 'N/A'}</Text>
                      </View>
                    </View>
                    <AntDesign name="right" size={18} color={COLORS.gray} />
                  </View>

                  <View style={styles.statsContainer}>
                    <View style={styles.statItem}>
                      <View style={[styles.statIconContainer, { backgroundColor: '#E8F5E9' }]}>
                        <AntDesign name="checkcircle" size={20} color="#4CAF50" />
                      </View>
                      <Text style={styles.statValue}>{course.presentCount || 0}</Text>
                      <Text style={styles.statLabel}>Present</Text>
                    </View>
                    <View style={styles.statItem}>
                      <View style={[styles.statIconContainer, { backgroundColor: '#FFEBEE' }]}>
                        <AntDesign name="closecircle" size={20} color="#F44336" />
                      </View>
                      <Text style={styles.statValue}>{course.absentCount || 0}</Text>
                      <Text style={styles.statLabel}>Absent</Text>
                    </View>
                    <View style={styles.statItem}>
                      <View style={[styles.statIconContainer, { backgroundColor: isGoodAttendance ? '#E8F5E9' : '#FFF3E0' }]}>
                        <AntDesign name="linechart" size={20} color={isGoodAttendance ? '#4CAF50' : '#FF9800'} />
                      </View>
                      <Text style={[styles.statValue, { color: isGoodAttendance ? '#4CAF50' : '#FF9800' }]}>
                        {percentage}%
                      </Text>
                      <Text style={styles.statLabel}>Attendance</Text>
                    </View>
                  </View>

                  {course.startDate && course.endDate && (
                    <View style={styles.dateContainer}>
                      <AntDesign name="calendar" size={14} color={COLORS.gray} />
                      <Text style={styles.dateText}>
                        {formatDate(course.startDate)} - {formatDate(course.endDate)}
                      </Text>
                    </View>
                  )}
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
  courseCard: {
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
    alignItems: 'center',
    marginBottom: 16,
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
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
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
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  dateText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 6,
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

export default AttendanceScreen;
