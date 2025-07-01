import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiFetch, ENDPOINTS } from '../../../services/apiService';
import { COLORS } from '../../../constants';

const LectureScreen = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const endpoint = `${ENDPOINTS.STUDENT_DASHBOARD}?${new URLSearchParams({ tabConstant: 'Course Content' })}`;
      const response = await apiFetch(endpoint);
      setData(response);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch lecture content.');
      console.error('Error fetching lecture data:', error);
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

  const renderAttachmentItem = ({ item }) => (
    <TouchableOpacity style={styles.attachmentItem}>
      <Ionicons
        name={item.fileContentType.startsWith('image') ? 'image-outline' : 'document-outline'}
        size={24}
        color={COLORS.primary}
      />
      <Text style={styles.attachmentName}>{item.originalFileName}</Text>
    </TouchableOpacity>
  );

  const renderLectureItem = ({ item }) => (
    <View style={styles.lectureCard}>
      <View style={styles.lectureHeader}>
        <Text style={styles.lectureTitle}>{item.lectureTitle}</Text>
        <Text style={styles.lectureDate}>{item.lectureDateStr}</Text>
      </View>
      {item.lectureContentUploadDtoList && item.lectureContentUploadDtoList.length > 0 && (
        <View style={styles.attachmentsContainer}>
          <Text style={styles.attachmentsLabel}>Attachments:</Text>
          <FlatList
            data={item.lectureContentUploadDtoList}
            renderItem={renderAttachmentItem}
            keyExtractor={(attachment) => attachment.lectureContentUploadId.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <Text style={styles.header}>Lecture Content</Text>
      {data && data.lectureContentDtoList && data.lectureContentDtoList.length > 0 ? (
        <FlatList
          data={data.lectureContentDtoList}
          renderItem={renderLectureItem}
          keyExtractor={(item) => item.lectureContentId.toString()}
          scrollEnabled={false}
        />
      ) : (
        <Text style={styles.noDataMessage}>No lecture content available.</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
        padding: 16,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 16,
    },
    lectureCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    lectureHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    lectureTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        flex: 1,
    },
    lectureDate: {
        fontSize: 14,
        color: '#666',
    },
    attachmentsContainer: {
        marginTop: 8,
    },
    attachmentsLabel: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    attachmentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        padding: 8,
        marginRight: 8,
    },
    attachmentName: {
        fontSize: 14,
        color: '#333',
        marginLeft: 8,
    },
    noDataMessage: {
        textAlign: 'center',
        color: '#666',
        fontSize: 16,
        marginTop: 20,
    },
});

export default LectureScreen;