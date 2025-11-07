import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { apiFetch, ENDPOINTS } from '../../../services/apiService';
import { COLORS } from '../../../constants';
import { AntDesign } from '@expo/vector-icons';

const MarkAttendanceDetailsScreen = () => {
  const params = useLocalSearchParams();
  const batch = params.batch ? JSON.parse(params.batch) : null;
  const course = params.course ? JSON.parse(params.course) : null;
  const attendanceData = params.attendanceData ? JSON.parse(params.attendanceData) : null;
  const dateRange = params.dateRange || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attendanceState, setAttendanceState] = useState(() => {
    // Initialize attendance state from attendanceDtoList
    const initialState = {};
    if (attendanceData?.attendanceDtoList) {
      attendanceData.attendanceDtoList.forEach((attendance) => {
        const key = `${attendance.studentCourseId}_${attendance.attendanceDateIdStr}`;
        initialState[key] = attendance.isPresent;
      });
    }
    return initialState;
  });

  // Get students from studentRegistrationDtoList
  const students = useMemo(() => {
    return attendanceData?.studentRegistrationDtoList || [];
  }, [attendanceData]);

  // Get dates from courseWeekDayDtoList
  const dates = useMemo(() => {
    return attendanceData?.courseWeekDayDtoList || [];
  }, [attendanceData]);

  const toggleAttendance = (studentCourseId, attendanceDateIdStr) => {
    const key = `${studentCourseId}_${attendanceDateIdStr}`;
    setAttendanceState((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const getAttendanceStatus = (studentCourseId, attendanceDateIdStr) => {
    const key = `${studentCourseId}_${attendanceDateIdStr}`;
    return attendanceState[key] === true;
  };

  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return '';
    // Handle ISO date string or DD/MM/YYYY format
    try {
      if (dateStr.includes('T')) {
        // ISO format: "2024-02-01T00:00:00"
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        return `${day}/${month}`;
      } else if (dateStr.includes('/')) {
        // DD/MM/YYYY format
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          return `${parts[0]}/${parts[1]}`;
        }
      }
    } catch (e) {
      console.error('Error formatting date:', e);
    }
    return dateStr;
  };

  const handleSubmit = useCallback(async () => {
    if (!batch || !course || !attendanceData) {
      Alert.alert('Error', 'Missing required data.');
      return;
    }

    // Build attendanceDtoList from current state
    const attendanceDtoList = [];
    
    students.forEach((student) => {
      dates.forEach((date) => {
        const isPresent = getAttendanceStatus(student.studentCourseId, date.id);
        // Find existing attendance record if any
        const existingAttendance = attendanceData.attendanceDtoList?.find(
          (a) => a.studentCourseId === student.studentCourseId && a.attendanceDateIdStr === date.id
        );

        attendanceDtoList.push({
          studentCourseId: student.studentCourseId,
          studentId: student.studentId,
          attendanceDate: date.courseDate,
          attendanceDateStr: date.courseDate ? new Date(date.courseDate).toLocaleDateString('en-GB') : '',
          attendanceDateIdStr: date.id,
          attendanceId: existingAttendance?.attendanceId || '00000000-0000-0000-0000-000000000000',
          batchId: batch.batchId,
          courseId: course.courseId,
          facultyId: null, // Will be set by backend
          isPresent: isPresent,
          createdBy: 0,
          createdOn: existingAttendance?.createdOn || '0001-01-01T00:00:00',
          modifiedBy: null,
          modifiedOn: null,
          attendanceCount: 0,
          attendancePercentage: 0,
          studentFullName: student.studentFullName,
        });
      });
    });

    setIsSubmitting(true);
    try {
      const response = await apiFetch(ENDPOINTS.FACULTY_ATTENDANCE_SUBMIT, {
        method: 'POST',
        body: JSON.stringify({
          batchId: batch.batchId,
          courseId: course.courseId,
          attendanceDateFromToStr: dateRange,
          attendanceDtoList: attendanceDtoList,
        }),
      });

      console.log('[Attendance Submit API Response]', JSON.stringify(response, null, 2));
      Alert.alert('Success', 'Attendance marked successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit attendance.');
      console.error('Error submitting attendance:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [batch, course, attendanceData, students, dates, attendanceState, dateRange]);

  if (!attendanceData || !students.length || !dates.length) {
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
            <Text style={styles.headerTitle}>Mark Attendance</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <AntDesign name="inbox" size={64} color={COLORS.gray} />
          <Text style={styles.emptyText}>No Attendance Data Available</Text>
          <Text style={styles.emptySubtext}>
            Please search for attendance data first.
          </Text>
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
          <Text style={styles.headerTitle}>Mark Attendance</Text>
          <Text style={styles.headerSubtitle}>
            {course?.courseDisplayName || course?.name || 'Course'}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      {/* Info Card */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <AntDesign name="appstore1" size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>{batch?.batchCode || 'N/A'}</Text>
        </View>
        <View style={styles.infoRow}>
          <AntDesign name="calendar" size={16} color={COLORS.primary} />
          <Text style={styles.infoText}>{dateRange}</Text>
        </View>
      </View>

      {/* Attendance Table */}
      <View style={styles.tableContainer}>
        {/* Scrollable Table with both horizontal and vertical scrolling */}
        <ScrollView
          style={styles.content}
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={true}
            nestedScrollEnabled={true}
            contentContainerStyle={styles.tableScrollContent}
          >
            <View>
              {/* Header Row */}
              <View style={styles.tableHeader}>
                <View style={[styles.studentNameColumn, styles.headerCell]}>
                  <Text style={styles.headerText}>Student</Text>
                </View>
                {dates.map((date, index) => (
                  <View key={date.id || index} style={[styles.dateColumn, styles.headerCell]}>
                    <Text style={styles.headerText} numberOfLines={2}>
                      {formatDateForDisplay(date.courseDate || '')}
                    </Text>
                    <Text style={styles.headerSubtext}>{date.weekDay || ''}</Text>
                  </View>
                ))}
              </View>

              {/* Student Rows */}
              {students.map((student, studentIndex) => (
                <View key={student.studentCourseId || studentIndex} style={styles.tableRow}>
                  <View style={styles.studentNameColumn}>
                    <Text style={styles.studentName} numberOfLines={2}>
                      {student.studentFullName || student.firstName || `Student ${studentIndex + 1}`}
                    </Text>
                    {student.stuNum && (
                      <Text style={styles.studentCode}>{student.stuNum}</Text>
                    )}
                  </View>
                  {dates.map((date, dateIndex) => {
                    const isPresent = getAttendanceStatus(student.studentCourseId, date.id);
                    return (
                      <TouchableOpacity
                        key={`${student.studentCourseId}_${date.id}`}
                        style={[
                          styles.dateColumn,
                          styles.attendanceCell,
                          isPresent && styles.presentCell,
                        ]}
                        onPress={() => toggleAttendance(student.studentCourseId, date.id)}
                        activeOpacity={0.7}
                      >
                        {isPresent ? (
                          <AntDesign name="checkcircle" size={20} color="#4CAF50" />
                        ) : (
                          <AntDesign name="closecircle" size={20} color="#F44336" />
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              ))}
            </View>
          </ScrollView>
        </ScrollView>
      </View>

      {/* Submit Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.7}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <AntDesign name="checkcircle" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Attendance</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
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
  tableContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  tableScrollContent: {
    flexGrow: 1,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: COLORS.primary,
    borderBottomWidth: 2,
    borderBottomColor: '#E5E5E5',
  },
  headerCell: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    borderRightColor: '#E5E5E5',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  headerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
  },
  headerSubtext: {
    fontSize: 10,
    color: '#fff',
    marginTop: 2,
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  studentNameColumn: {
    width: 120,
    padding: 12,
    borderRightWidth: 2,
    borderRightColor: '#E5E5E5',
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
  },
  studentName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  studentCode: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 4,
  },
  dateColumn: {
    width: 80,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendanceCell: {
    backgroundColor: '#FFF',
  },
  presentCell: {
    backgroundColor: '#E8F5E9',
  },
  footer: {
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
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

export default MarkAttendanceDetailsScreen;

