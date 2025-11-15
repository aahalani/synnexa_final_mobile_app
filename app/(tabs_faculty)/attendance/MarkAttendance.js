import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { apiFetch, ENDPOINTS } from '../../../services/apiService';
import { COLORS } from '../../../constants';
import { AntDesign } from '@expo/vector-icons';

const MarkAttendanceScreen = () => {
  const params = useLocalSearchParams();
  const batch = params.batch ? JSON.parse(params.batch) : null;
  const course = params.course ? JSON.parse(params.course) : null;

  const [dateFrom, setDateFrom] = useState(new Date());
  const [dateTo, setDateTo] = useState(new Date());
  const [showDateFromPicker, setShowDateFromPicker] = useState(false);
  const [showDateToPicker, setShowDateToPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const formatDateForAPI = (date) => {
    if (!date) return '';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    // Format: DD/MM/YYYY
    return `${day}/${month}/${year}`;
  };

  const formatDateForDisplay = (date) => {
    if (!date) return 'Select Date';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleSearch = useCallback(async () => {
    if (!batch || !course) {
      Alert.alert('Error', 'Batch or course information is missing.');
      return;
    }

    if (!dateFrom || !dateTo) {
      Alert.alert('Error', 'Please select both start and end dates.');
      return;
    }

    // Format date range as string (format: "DD/MM/YYYY - DD/MM/YYYY")
    const attendanceDateFromToStr = `${formatDateForAPI(dateFrom)} - ${formatDateForAPI(dateTo)}`;

    setIsLoading(true);
    try {
      const response = await apiFetch(ENDPOINTS.FACULTY_ATTENDANCE_SEARCH, {
        method: 'POST',
        body: JSON.stringify({
          batchId: batch.batchId,
          courseId: course.courseId,
          attendanceDateFromToStr: attendanceDateFromToStr,
        }),
      });

      console.log('[Attendance Search API Response]', JSON.stringify(response, null, 2));
      
      // Redirect to attendance marking page with the response data
      router.push({
        pathname: '/(tabs_faculty)/attendance/MarkAttendanceDetails',
        params: {
          batch: JSON.stringify(batch),
          course: JSON.stringify(course),
          attendanceData: JSON.stringify(response),
          dateRange: attendanceDateFromToStr,
        },
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to search attendance data.');
      console.error('Error searching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  }, [batch, course, dateFrom, dateTo]);

  const onDateFromChange = (event, selectedDate) => {
    setShowDateFromPicker(Platform.OS === 'ios');
    if (event.type !== 'dismissed' && selectedDate) {
      setDateFrom(selectedDate);
    }
  };

  const onDateToChange = (event, selectedDate) => {
    setShowDateToPicker(Platform.OS === 'ios');
    if (event.type !== 'dismissed' && selectedDate) {
      setDateTo(selectedDate);
    }
  };

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

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Batch and Course Info Card */}
        {(batch || course) && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <AntDesign name="appstore1" size={20} color={COLORS.primary} />
              <Text style={styles.infoLabel}>Batch:</Text>
              <Text style={styles.infoValue}>{batch?.batchCode || 'N/A'}</Text>
            </View>
            <View style={styles.infoRow}>
              <AntDesign name="book" size={20} color={COLORS.primary} />
              <Text style={styles.infoLabel}>Course:</Text>
              <Text style={styles.infoValue}>{course?.courseDisplayName || course?.name || 'N/A'}</Text>
            </View>
          </View>
        )}

        {/* Date Range Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Date Range</Text>
          <Text style={styles.sectionSubtitle}>
            Tap on the date fields to select dates
          </Text>

          <View style={styles.dateInputContainer}>
            <View style={styles.dateInputWrapper}>
              <Text style={styles.dateLabel}>From Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDateFromPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateInputText, !dateFrom && styles.dateInputPlaceholder]}>
                  {formatDateForDisplay(dateFrom)}
                </Text>
                <AntDesign name="calendar" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              {showDateFromPicker && (
                <DateTimePicker
                  value={dateFrom}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateFromChange}
                  maximumDate={dateTo}
                />
              )}
            </View>

            <View style={styles.dateInputWrapper}>
              <Text style={styles.dateLabel}>To Date</Text>
              <TouchableOpacity
                style={styles.dateInput}
                onPress={() => setShowDateToPicker(true)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dateInputText, !dateTo && styles.dateInputPlaceholder]}>
                  {formatDateForDisplay(dateTo)}
                </Text>
                <AntDesign name="calendar" size={20} color={COLORS.primary} />
              </TouchableOpacity>
              {showDateToPicker && (
                <DateTimePicker
                  value={dateTo}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateToChange}
                  minimumDate={dateFrom}
                />
              )}
            </View>
          </View>

          <TouchableOpacity
            style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <AntDesign name="search1" size={20} color="#fff" />
                <Text style={styles.searchButtonText}>Search Attendance</Text>
              </>
            )}
          </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  infoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
    marginLeft: 8,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
  },
  dateInputContainer: {
    marginBottom: 20,
  },
  dateInputWrapper: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 8,
  },
  dateInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dateInputText: {
    fontSize: 16,
    color: '#1A1A1A',
  },
  dateInputPlaceholder: {
    color: COLORS.gray,
  },
  searchButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default MarkAttendanceScreen;

