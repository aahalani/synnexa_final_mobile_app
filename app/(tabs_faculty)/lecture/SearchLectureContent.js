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

const SearchLectureContentScreen = () => {
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
    const lectureContentDateRangeStr = `${formatDateForAPI(dateFrom)} - ${formatDateForAPI(dateTo)}`;

    setIsLoading(true);
    try {
      const response = await apiFetch(ENDPOINTS.FACULTY_LECTURE_CONTENT_SEARCH, {
        method: 'POST',
        body: JSON.stringify({
          batchId: batch.batchId,
          courseId: course.courseId,
          lectureContentDateRangeStr: lectureContentDateRangeStr,
        }),
      });

      console.log('[Lecture Content Search API Response]', JSON.stringify(response, null, 2));
      
      // Redirect to lecture content details page with the response data
      router.push({
        pathname: '/(tabs_faculty)/lecture/LectureContentDetails',
        params: {
          batch: JSON.stringify(batch),
          course: JSON.stringify(course),
          lectureData: JSON.stringify(response),
          dateRange: lectureContentDateRangeStr,
        },
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to search lecture content.');
      console.error('Error searching lecture content:', error);
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
          <Text style={styles.headerTitle}>Search Lecture Content</Text>
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

          <View style={styles.dateContainer}>
            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>From Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDateFromPicker(true)}
              >
                <AntDesign name="calendar" size={20} color={COLORS.primary} />
                <Text style={styles.dateText}>{formatDateForDisplay(dateFrom)}</Text>
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

            <View style={styles.dateField}>
              <Text style={styles.dateLabel}>To Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDateToPicker(true)}
              >
                <AntDesign name="calendar" size={20} color={COLORS.primary} />
                <Text style={styles.dateText}>{formatDateForDisplay(dateTo)}</Text>
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
        </View>

        {/* Search Button */}
        <TouchableOpacity
          style={[styles.searchButton, isLoading && styles.searchButtonDisabled]}
          onPress={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <AntDesign name="search1" size={20} color="#fff" />
              <Text style={styles.searchButtonText}>Search Lecture Content</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Create New Lecture Button */}
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => {
            router.push({
              pathname: '/(tabs_faculty)/lecture/CreateLectureContent',
              params: {
                batch: JSON.stringify(batch),
                course: JSON.stringify(course),
              },
            });
          }}
        >
          <AntDesign name="pluscircle" size={20} color="#fff" />
          <Text style={styles.createButtonText}>Create New Lecture Content</Text>
        </TouchableOpacity>
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
  infoLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginLeft: 8,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
  },
  dateContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dateField: {
    flex: 1,
    marginRight: 8,
  },
  dateLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 8,
    fontWeight: '500',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  dateText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  searchButtonDisabled: {
    opacity: 0.6,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
});

export default SearchLectureContentScreen;

