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
  Platform, // Import Platform API
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as MediaLibrary from 'expo-media-library'; // Import MediaLibrary
import { apiFetch, ENDPOINTS } from '../../../services/apiService';
import { COLORS } from '../../../constants';

const LectureScreen = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingId, setDownloadingId] = useState(null);

  // No changes to fetchData, useEffect, or onRefresh
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

  /**
   * Handles downloading an attachment.
   * - On Android: Saves the file directly to the user's media library (Downloads/Pictures).
   * - On iOS: Opens the native share/save dialog.
   */
  const handleDownload = async (attachment) => {
    if (downloadingId) return;

    if (!attachment.fileBase64String) {
      Alert.alert('Download Failed', 'No file content available to download.');
      return;
    }

    setDownloadingId(attachment.lectureContentUploadId);

    // Define a temporary file path in the app's cache directory
    const fileUri = FileSystem.cacheDirectory + attachment.originalFileName;

    try {
      // Write the base64 string to the temporary file
      await FileSystem.writeAsStringAsync(fileUri, attachment.fileBase64String, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // --- Platform-specific logic ---
      if (Platform.OS === 'android') {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission Required', 'Please grant permission to save files to your device.');
          return;
        }

        await MediaLibrary.saveToLibraryAsync(fileUri);
        Alert.alert('Success', `File saved to your gallery or downloads folder.`);

      } else { // iOS and other platforms
        if (!(await Sharing.isAvailableAsync())) {
          Alert.alert('Error', 'Sharing is not available on your device.');
          return;
        }
        await Sharing.shareAsync(fileUri);
      }
    } catch (error) {
      console.error('Error during file download/saving:', error);
      Alert.alert('Download Error', 'Could not save the file.');
    } finally {
      setDownloadingId(null); // Reset downloading state
    }
  };


  const renderAttachmentItem = ({ item }) => {
    const isDownloadingThis = downloadingId === item.lectureContentUploadId;
    
    return (
      <TouchableOpacity 
        style={styles.attachmentItem} 
        onPress={() => handleDownload(item)}
        disabled={isDownloadingThis}
      >
        {isDownloadingThis ? (
          <ActivityIndicator size="small" color={COLORS.primary} />
        ) : (
          <Ionicons
            name={item.fileContentType.startsWith('image') ? 'image-outline' : 'document-outline'}
            size={24}
            color={COLORS.primary}
          />
        )}
        <Text style={styles.attachmentName} numberOfLines={1}>{item.originalFileName}</Text>
      </TouchableOpacity>
    );
  };
  
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
            horizontal={true}
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
      contentContainerStyle={{ paddingBottom: 100 }}
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
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    minWidth: 50,
    justifyContent: 'center',
  },
  attachmentName: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    maxWidth: 120, // Prevent long filenames from breaking layout
  },
  noDataMessage: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    marginTop: 20,
  },
});

export default LectureScreen;