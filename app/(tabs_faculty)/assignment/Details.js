import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { COLORS } from '../../../constants';
import { AntDesign } from '@expo/vector-icons';

const AssignmentDetailsScreen = () => {
  const params = useLocalSearchParams();
  const batch = params.batch ? JSON.parse(params.batch) : null;
  const allCourses = params.courses ? JSON.parse(params.courses) : [];

  // Filter courses for this batch if necessary, or use all courses
  const courseList = allCourses || [];

  if (!batch) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Batch details not found.</Text>
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
          <Text style={styles.headerTitle}>{batch?.batchCode || 'Batch Details'}</Text>
          <Text style={styles.headerSubtitle}>{batch?.batchName || ''}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Batch Info Card */}
        {batch && (
          <View style={styles.batchInfoCard}>
            <View style={styles.batchInfoHeader}>
              <AntDesign name="appstore1" size={24} color={COLORS.primary} />
              <Text style={[styles.batchInfoTitle, { marginLeft: 8 }]}>Batch Information</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Batch Code:</Text>
              <Text style={styles.infoValue}>{batch.batchCode}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Batch Name:</Text>
              <Text style={styles.infoValue}>{batch.batchName}</Text>
            </View>
            {batch.branchId && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Branch ID:</Text>
                <Text style={styles.infoValue}>{batch.branchId}</Text>
              </View>
            )}
            {batch.admissionTo && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Admission To:</Text>
                <Text style={styles.infoValue}>Grade {batch.admissionTo}</Text>
              </View>
            )}
            {batch.isActive && (
              <View style={styles.activeBadgeContainer}>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              </View>
            )}
          </View>
        )}

        {/* Courses Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Course</Text>
          <Text style={styles.sectionSubtitle}>
            {courseList.length} {courseList.length === 1 ? 'course' : 'courses'} available
          </Text>
        </View>

        {courseList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AntDesign name="book" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>No Courses Available</Text>
            <Text style={styles.emptySubtext}>
              There are no courses available for this batch
            </Text>
          </View>
        ) : (
          courseList.map((course, index) => (
            <TouchableOpacity
              key={course.courseId || index}
              style={styles.courseCard}
              activeOpacity={0.7}
              onPress={() => {
                router.push({
                  pathname: '/(tabs_faculty)/assignment/AssignmentSubmissions',
                  params: {
                    batch: JSON.stringify(batch),
                    course: JSON.stringify(course),
                  },
                });
              }}
            >
              <View style={styles.courseCardHeader}>
                <View style={styles.courseCodeContainer}>
                  <AntDesign name="book" size={20} color={COLORS.primary} />
                  <Text style={[styles.courseCode, { marginLeft: 8 }]}>{course.code}</Text>
                </View>
                {course.isActive && (
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                  </View>
                )}
              </View>
              <Text style={styles.courseName}>{course.name}</Text>
              <Text style={styles.courseDisplayName}>{course.courseDisplayName}</Text>
              <View style={styles.courseDetails}>
                {course.hours && (
                  <View style={[styles.courseDetailItem, { marginRight: 16 }]}>
                    <AntDesign name="clockcircle" size={14} color={COLORS.gray} />
                    <Text style={styles.courseDetailText}>{course.hours} hours</Text>
                  </View>
                )}
                {course.credits && (
                  <View style={styles.courseDetailItem}>
                    <AntDesign name="star" size={14} color={COLORS.gray} />
                    <Text style={styles.courseDetailText}>{course.credits} credits</Text>
                  </View>
                )}
              </View>
              {course.description && (
                <Text style={styles.courseDescription} numberOfLines={2}>
                  {course.description}
                </Text>
              )}
            </TouchableOpacity>
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
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  batchInfoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  batchInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  batchInfoTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: COLORS.gray,
    fontWeight: '500',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#1A1A1A',
    fontWeight: '600',
    flex: 1,
  },
  activeBadgeContainer: {
    marginTop: 8,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
  },
  sectionHeader: {
    marginBottom: 16,
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
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  courseCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseCode: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  courseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  courseDisplayName: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
  },
  courseDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  courseDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  courseDetailText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 4,
  },
  courseDescription: {
    fontSize: 13,
    color: COLORS.gray,
    marginTop: 8,
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

export default AssignmentDetailsScreen;

