import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, useLocalSearchParams } from 'expo-router';
import { apiFetch, ENDPOINTS } from '../../../services/apiService';
import { getUser } from '../../../services/authService';
import { COLORS } from '../../../constants';
import { AntDesign } from '@expo/vector-icons';

const CreateLectureContentScreen = () => {
  const params = useLocalSearchParams();
  const batch = params.batch ? JSON.parse(params.batch) : null;
  const course = params.course ? JSON.parse(params.course) : null;

  const [lectureTitle, setLectureTitle] = useState('');
  const [lectureDate, setLectureDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [facultyId, setFacultyId] = useState(null);

  useEffect(() => {
    // Get faculty ID from user data
    const fetchFacultyId = async () => {
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
      }
    };
    fetchFacultyId();
  }, []);

  const formatDateForAPI = (date) => {
    if (!date) return '';
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
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

  const onDateChange = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (event.type !== 'dismissed' && selectedDate) {
      setLectureDate(selectedDate);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!lectureTitle.trim()) {
      Alert.alert('Error', 'Please enter a lecture title.');
      return;
    }

    if (!batch || !course) {
      Alert.alert('Error', 'Batch or course information is missing.');
      return;
    }

    if (!facultyId) {
      Alert.alert('Error', 'Faculty information is missing. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      const requestBody = {
        lectureContentDto: {
          lectureContentId: '00000000-0000-0000-0000-000000000000',
          batchId: batch.batchId,
          courseId: course.courseId,
          lectureDateStr: formatDateForAPI(lectureDate),
          lectureTitle: lectureTitle.trim(),
          facultyId: facultyId,
        },
      };

      console.log('[Create Lecture Content Request]', JSON.stringify(requestBody, null, 2));

      const response = await apiFetch(ENDPOINTS.FACULTY_LECTURE_CONTENT_SUBMIT, {
        method: 'POST',
        body: JSON.stringify(requestBody),
      });

      console.log('[Create Lecture Content Response]', JSON.stringify(response, null, 2));

      Alert.alert(
        'Success',
        'Lecture content created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to the course details screen
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to create lecture content.');
      console.error('Error creating lecture content:', error);
    } finally {
      setIsLoading(false);
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
          <Text style={styles.headerTitle}>Create Lecture Content</Text>
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

        {/* Form Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Lecture Details</Text>
          <Text style={styles.sectionSubtitle}>
            Fill in the details to create new lecture content
          </Text>

          {/* Lecture Title Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Lecture Title *</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter lecture title"
              placeholderTextColor={COLORS.gray}
              value={lectureTitle}
              onChangeText={setLectureTitle}
              maxLength={200}
            />
          </View>

          {/* Lecture Date Picker */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Lecture Date *</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <AntDesign name="calendar" size={20} color={COLORS.primary} />
              <Text style={styles.dateText}>{formatDateForDisplay(lectureDate)}</Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={lectureDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <AntDesign name="checkcircle" size={20} color="#fff" />
                <Text style={styles.submitButtonText}>Create Lecture Content</Text>
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
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E5E5E5',
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
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
});

export default CreateLectureContentScreen;

