import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { apiFetch, apiUploadFormData, ENDPOINTS } from '../../../services/apiService';
import { getUser } from '../../../services/authService';
import { COLORS } from '../../../constants';
import { AntDesign } from '@expo/vector-icons';

const MarkAttendanceDetailsScreen = () => {
  const params = useLocalSearchParams();
  const batch = params.batch ? JSON.parse(params.batch) : null;
  const course = params.course ? JSON.parse(params.course) : null;
  const attendanceData = params.attendanceData ? JSON.parse(params.attendanceData) : null;
  const dateRange = params.dateRange || '';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [facultyId, setFacultyId] = useState(null);
  const [isLoadingFaculty, setIsLoadingFaculty] = useState(true);
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

  // Get facultyId from user data
  useEffect(() => {
    const fetchFacultyId = async () => {
      setIsLoadingFaculty(true);
      try {
        const userData = await getUser();
        // Try to get facultyId from facultyDto first, then fallback to userId
        if (userData?.facultyDto?.facultyId) {
          setFacultyId(userData.facultyDto.facultyId);
        } else if (userData?.userId) {
          setFacultyId(userData.userId);
        }
      } catch (error) {
        console.error('Error fetching faculty ID:', error);
      } finally {
        setIsLoadingFaculty(false);
      }
    };
    fetchFacultyId();
  }, []);

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

  const formatDateForAPI = (dateStr) => {
    if (!dateStr) return '';
    try {
      if (dateStr.includes('T')) {
        // ISO format: "2024-02-01T00:00:00"
        const date = new Date(dateStr);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        // Format: DD/MM/YYYY
        return `${day}/${month}/${year}`;
      } else if (dateStr.includes('/')) {
        // Already in DD/MM/YYYY format
        return dateStr;
      }
    } catch (e) {
      console.error('Error formatting date for API:', e);
    }
    return dateStr;
  };

  const handleSubmit = useCallback(async () => {
    if (!batch || !course || !attendanceData) {
      Alert.alert('Error', 'Missing required data.');
      return;
    }

    if (!facultyId) {
      Alert.alert('Error', 'Faculty information is missing. Please try again.');
      return;
    }

    // Calculate attendance percentage for each student
    const studentCourseData = [];
    const attendanceDtoList = [];

    students.forEach((student, studentIndex) => {
      let presentCount = 0;
      const totalDates = dates.length;

      // Build attendance records for this student
      dates.forEach((date) => {
        const isPresent = getAttendanceStatus(student.studentCourseId, date.id);
        if (isPresent) {
          presentCount++;
        }

        const attendanceDateStr = formatDateForAPI(date.courseDate || '');

        // Add attendance record
        attendanceDtoList.push({
          studentId: student.studentId,
          batchId: batch.batchId,
          courseId: course.courseId,
          facultyId: facultyId,
          attendanceDateStr: attendanceDateStr,
          isPresent: Boolean(isPresent), // Always include isPresent as a boolean
        });
      });

      // Calculate attendance percentage
      const attendancePercentage = totalDates > 0 ? (presentCount / totalDates) * 100 : 0;

      // Add student course data
      studentCourseData.push({
        studentCourseId: student.studentCourseId,
        studentId: student.studentId,
        courseId: course.courseId,
        attendancePercentage: parseFloat(attendancePercentage.toFixed(2)),
      });
    });

    // Build request body - try JSON format first (415 error suggests API expects JSON)
    const requestBody = {
      studentCourseDtoList: studentCourseData.map((sc) => ({
        studentCourseId: sc.studentCourseId,
        studentId: sc.studentId,
        courseId: sc.courseId,
        attendancePercentage: sc.attendancePercentage,
      })),
      attendanceDtoList: attendanceDtoList.map((att) => ({
        studentId: att.studentId,
        batchId: att.batchId,
        courseId: att.courseId,
        facultyId: att.facultyId,
        attendanceDateStr: att.attendanceDateStr,
        isPresent: Boolean(att.isPresent), // Ensure boolean conversion
      })),
      attendanceDateFromToStr: dateRange,
    };

    setIsSubmitting(true);
    try {
      console.log('[Attendance Submit Request]', JSON.stringify(requestBody, null, 2));

      // Try JSON first (most .NET APIs expect JSON for complex objects)
      let response;
      try {
        response = await apiFetch(ENDPOINTS.FACULTY_ATTENDANCE_SUBMIT, {
          method: 'POST',
          body: JSON.stringify(requestBody),
        });
      } catch (jsonError) {
        // If JSON fails with 415, try FormData as fallback
        if (jsonError.message?.includes('415') || jsonError.message?.includes('Unsupported Media Type')) {
          console.log('[Attendance Submit] JSON failed, trying FormData...');
          const formData = new FormData();

          // Add StudentCourseDtoList
          studentCourseData.forEach((studentCourse, index) => {
            formData.append(`StudentCourseDtoList[${index}].StudentCourseId`, studentCourse.studentCourseId);
            formData.append(`StudentCourseDtoList[${index}].StudentId`, String(studentCourse.studentId));
            formData.append(`StudentCourseDtoList[${index}].CourseId`, String(studentCourse.courseId));
            formData.append(`StudentCourseDtoList[${index}].AttendancePercentage`, String(studentCourse.attendancePercentage));
          });

          // Add AttendanceDtoList
          attendanceDtoList.forEach((attendance, index) => {
            formData.append(`AttendanceDtoList[${index}].StudentId`, String(attendance.studentId));
            formData.append(`AttendanceDtoList[${index}].BatchId`, String(attendance.batchId));
            formData.append(`AttendanceDtoList[${index}].CourseId`, String(attendance.courseId));
            formData.append(`AttendanceDtoList[${index}].FacultyId`, String(attendance.facultyId));
            formData.append(`AttendanceDtoList[${index}].AttendanceDateStr`, attendance.attendanceDateStr);
            // Always include isPresent as a boolean
            formData.append(`AttendanceDtoList[${index}].IsPresent`, Boolean(attendance.isPresent) ? 'True' : 'False');
          });

          response = await apiUploadFormData(ENDPOINTS.FACULTY_ATTENDANCE_SUBMIT, formData);
        } else {
          throw jsonError;
        }
      }

      console.log('[Attendance Submit API Response]', JSON.stringify(response, null, 2));
      
      // Show success message
      const responseMessage = response?.message || 'Attendance marked successfully!';
      
      Alert.alert(
        'Success',
        responseMessage,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Error submitting attendance:', error);
      const errorMessage = error.message || 'Failed to submit attendance.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [batch, course, attendanceData, students, dates, attendanceState, dateRange, facultyId]);

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
        <TouchableOpacity
          style={[styles.headerSubmitButton, (isSubmitting || isLoadingFaculty) && styles.headerSubmitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting || isLoadingFaculty}
          activeOpacity={0.7}
        >
          {isSubmitting || isLoadingFaculty ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <AntDesign name="checkcircle" size={18} color="#fff" />
              <Text style={styles.headerSubmitButtonText}>Save</Text>
            </>
          )}
        </TouchableOpacity>
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
    width: 0,
  },
  headerSubmitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  headerSubmitButtonDisabled: {
    opacity: 0.6,
  },
  headerSubmitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
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
    minHeight: 0, // Important for nested ScrollViews
  },
  content: {
    flex: 1,
  },
  tableScrollContent: {
    paddingBottom: 20, // Add padding at bottom of scrollable content
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

