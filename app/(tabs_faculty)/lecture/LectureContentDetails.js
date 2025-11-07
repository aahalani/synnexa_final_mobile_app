import React, { useMemo } from 'react';
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

const LectureContentDetailsScreen = () => {
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
  const lectureData = useMemo(() => {
    try {
      return params.lectureData ? JSON.parse(params.lectureData) : null;
    } catch (error) {
      console.error('Error parsing lectureData param:', error);
      return null;
    }
  }, [params.lectureData]);
  const dateRange = params.dateRange || '';

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

  const lectureContentList = lectureData?.lectureContentDtoList || [];

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
          <Text style={styles.headerTitle}>Lecture Content</Text>
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
          {dateRange && (
            <View style={styles.infoRow}>
              <AntDesign name="calendar" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>{dateRange}</Text>
            </View>
          )}
          {lectureContentList.length > 0 && (
            <View style={styles.infoRow}>
              <AntDesign name="filetext1" size={16} color={COLORS.primary} />
              <Text style={styles.infoText}>
                {String(lectureContentList.length)} {lectureContentList.length === 1 ? 'lecture' : 'lectures'}
              </Text>
            </View>
          )}
        </View>

        {/* Lecture Content List */}
        {lectureContentList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AntDesign name="filetext1" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>No Lecture Content Found</Text>
            <Text style={styles.emptySubtext}>
              No lecture content found for the selected date range
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Lecture Content</Text>
              <Text style={styles.sectionSubtitle}>
                {lectureContentList.length} {lectureContentList.length === 1 ? 'lecture' : 'lectures'} found
              </Text>
            </View>
            {lectureContentList.map((lecture, index) => (
              <View key={lecture.lectureContentId || index} style={styles.lectureCard}>
                {/* Lecture Header */}
                <View style={styles.lectureHeader}>
                  <View style={styles.lectureHeaderLeft}>
                    <AntDesign name="filetext1" size={24} color={COLORS.primary} />
                    <View style={styles.lectureTitleContainer}>
                      <Text style={styles.lectureTitle}>{lecture.lectureTitle || 'Untitled Lecture'}</Text>
                      <Text style={styles.lectureDate}>
                        {formatDate(lecture.lectureDate) || lecture.lectureDateStr || 'N/A'}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Uploaded Files */}
                {lecture.lectureContentUploadDtoList && lecture.lectureContentUploadDtoList.length > 0 && (
                  <View style={styles.filesSection}>
                    <Text style={styles.filesSectionTitle}>
                      Files ({lecture.lectureContentUploadDtoList.length})
                    </Text>
                    {lecture.lectureContentUploadDtoList.map((file, fileIndex) => (
                      <View key={file.lectureContentUploadId || fileIndex} style={styles.fileItem}>
                        <View style={styles.fileIconContainer}>
                          <AntDesign 
                            name={
                              file.fileExtension?.includes('.pdf') ? 'pdffile1' :
                              file.fileExtension?.includes('.doc') || file.fileExtension?.includes('.docx') ? 'file1' :
                              file.fileExtension?.includes('.jpg') || file.fileExtension?.includes('.jpeg') || file.fileExtension?.includes('.png') ? 'picture' :
                              'file1'
                            } 
                            size={20} 
                            color={COLORS.primary} 
                          />
                        </View>
                        <View style={styles.fileInfo}>
                          <Text style={styles.fileName} numberOfLines={1}>
                            {file.originalFileName || 'Unknown File'}
                          </Text>
                          <Text style={styles.fileDetails}>
                            {formatFileSize(file.fileSizeBytes)} • {file.fileExtension || 'No extension'}
                          </Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Lecture Metadata */}
                <View style={styles.lectureMetadata}>
                  {lecture.createdOn && (
                    <View style={styles.metadataRow}>
                      <AntDesign name="clockcircle" size={14} color={COLORS.gray} />
                      <Text style={styles.metadataText}>
                        Created: {formatDate(lecture.createdOn)}
                      </Text>
                    </View>
                  )}
                  {lecture.modifiedOn && (
                    <View style={styles.metadataRow}>
                      <AntDesign name="edit" size={14} color={COLORS.gray} />
                      <Text style={styles.metadataText}>
                        Modified: {formatDate(lecture.modifiedOn)}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
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
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
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
  lectureCard: {
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
  lectureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  lectureHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  lectureTitleContainer: {
    marginLeft: 12,
    flex: 1,
  },
  lectureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  lectureDate: {
    fontSize: 12,
    color: COLORS.gray,
  },
  filesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  filesSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: 12,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    marginBottom: 8,
  },
  fileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  fileDetails: {
    fontSize: 12,
    color: COLORS.gray,
  },
  lectureMetadata: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metadataText: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
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

export default LectureContentDetailsScreen;

