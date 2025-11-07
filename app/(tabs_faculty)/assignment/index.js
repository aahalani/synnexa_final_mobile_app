import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { apiFetch, ENDPOINTS } from '../../../services/apiService';
import { COLORS } from '../../../constants';
import { AntDesign } from '@expo/vector-icons';

const AssignmentScreen = () => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const response = await apiFetch(ENDPOINTS.FACULTY_CHECK_ASSIGNMENTS, {
        method: 'GET',
      });
      console.log('[Assignment API Response]', JSON.stringify(response, null, 2));
      setData(response);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch assignment data.');
      console.error('Error fetching assignment data:', error);
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

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const batchList = data?.batchDtoList || [];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {batchList.length === 0 ? (
          <View style={styles.emptyContainer}>
            <AntDesign name="book" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>No Batches Available</Text>
            <Text style={styles.emptySubtext}>
              There are no batches available for assignment checking
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Select Batch</Text>
              <Text style={styles.sectionSubtitle}>
                {batchList.length} {batchList.length === 1 ? 'batch' : 'batches'} available
              </Text>
            </View>
            {batchList.map((batch, index) => (
              <TouchableOpacity
                key={batch.batchId || index}
                style={styles.batchCard}
                activeOpacity={0.7}
                onPress={() => {
                  router.push({
                    pathname: '/(tabs_faculty)/assignment/Details',
                    params: {
                      batch: JSON.stringify(batch),
                      courses: JSON.stringify(data?.courseDtoList || []),
                    },
                  });
                }}
              >
                <View style={styles.batchCardHeader}>
                  <View style={styles.batchCodeContainer}>
                    <AntDesign name="appstore1" size={20} color={COLORS.primary} />
                    <Text style={[styles.batchCode, { marginLeft: 8 }]}>{batch.batchCode}</Text>
                  </View>
                  {batch.isActive && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.batchName}>{batch.batchName}</Text>
                <Text style={styles.batchDisplayName}>{batch.batchDisplayName}</Text>
                {batch.branchId && (
                  <View style={styles.batchInfo}>
                    <Text style={styles.batchInfoText}>Branch ID: {batch.branchId}</Text>
                  </View>
                )}
                {batch.admissionTo && (
                  <View style={styles.batchInfo}>
                    <Text style={styles.batchInfoText}>Admission To: Grade {batch.admissionTo}</Text>
                  </View>
                )}
              </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
  },
  batchCard: {
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
  batchCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  batchCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batchCode: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
  },
  batchName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  batchDisplayName: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 12,
  },
  batchInfo: {
    marginTop: 8,
  },
  batchInfoText: {
    fontSize: 13,
    color: COLORS.gray,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  activeBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#fff',
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

export default AssignmentScreen;

