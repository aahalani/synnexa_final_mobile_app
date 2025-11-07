import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { apiFetch, ENDPOINTS } from '../../../services/apiService';
import { COLORS } from '../../../constants';
import { AntDesign } from '@expo/vector-icons';

const FeesScreen = () => {
  const [paymentDto, setPaymentDto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const endpoint = `${ENDPOINTS.STUDENT_DASHBOARD}?${new URLSearchParams({ tabConstant: 'Fees' })}`;
      const response = await apiFetch(endpoint);
      setPaymentDto(response);
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to fetch fee data.');
      console.error('Error fetching fee data:', error);
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

  const formatCurrency = (amount) => {
    // Handle undefined, null, or empty string
    if (amount === undefined || amount === null || amount === '') {
      return `₹0.00`;
    }
    
    // Coerce to number after trimming if it's a string
    const trimmedAmount = typeof amount === 'string' ? amount.trim() : amount;
    const parsed = Number(trimmedAmount);
    
    // Validate the parsed value
    if (!Number.isFinite(parsed) || isNaN(parsed)) {
      return `₹0.00`;
    }
    
    return `₹${parsed.toFixed(2)}`;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  const payment = paymentDto?.paymentDto;
  const paymentLogs = payment?.paymentLogDtoList || [];

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {!payment ? (
          <View style={styles.emptyContainer}>
            <AntDesign name="creditcard" size={64} color={COLORS.gray} />
            <Text style={styles.emptyText}>No Fee Data</Text>
            <Text style={styles.emptySubtext}>
              Your fee information will appear here
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.headerSection}>
              <Text style={styles.sectionTitle}>Fee Overview</Text>
              {paymentDto.receiptNo && (
                <Text style={styles.receiptNo}>Receipt: {paymentDto.receiptNo}</Text>
              )}
            </View>

            {/* Summary Card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <AntDesign name="wallet" size={24} color={COLORS.primary} />
                <Text style={styles.summaryTitle}>Payment Summary</Text>
              </View>
              <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Total Fee</Text>
                  <Text style={styles.summaryValue}>{formatCurrency(payment.actualAmt)}</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Discount</Text>
                  <Text style={[styles.summaryValue, { color: '#4CAF50' }]}>
                    {payment.discountPercent || 0}%
                  </Text>
                </View>
              </View>
              <View style={styles.finalAmountContainer}>
                <Text style={styles.finalAmountLabel}>Final Amount</Text>
                <Text style={styles.finalAmountValue}>{formatCurrency(payment.finalAmt)}</Text>
              </View>
            </View>

            {/* Payment History */}
            {paymentLogs.length > 0 && (
              <View style={styles.paymentHistorySection}>
                <Text style={styles.sectionTitle}>Payment History</Text>
                <Text style={styles.sectionSubtitle}>
                  {paymentLogs.length} {paymentLogs.length === 1 ? 'payment' : 'payments'} recorded
                </Text>
                {paymentLogs.map((log, index) => (
                  <View key={index} style={styles.paymentLogCard}>
                    <View style={styles.paymentLogHeader}>
                      <View style={styles.paymentLogLeft}>
                        <View style={styles.paymentLogIconContainer}>
                          <AntDesign name="checkcircle" size={20} color="#4CAF50" />
                        </View>
                        <View style={styles.paymentLogInfo}>
                          <Text style={styles.paymentLogDate}>{log.paymentDateStr || 'N/A'}</Text>
                          <Text style={styles.paymentLogMode}>{log.paymentModeDisplayName || 'N/A'}</Text>
                        </View>
                      </View>
                      <View style={styles.paymentLogRight}>
                        <Text style={styles.paymentLogAmount}>{formatCurrency(log.amtPaid)}</Text>
                        {log.balanceAmt !== undefined && (
                          <Text style={styles.paymentLogBalance}>
                            Balance: {formatCurrency(log.balanceAmt)}
                          </Text>
                        )}
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 4,
  },
  receiptNo: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  summaryItem: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
  },
  finalAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  finalAmountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  finalAmountValue: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.primary,
  },
  paymentHistorySection: {
    marginTop: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginBottom: 16,
  },
  paymentLogCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
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
  paymentLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLogLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentLogIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentLogInfo: {
    flex: 1,
  },
  paymentLogDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  paymentLogMode: {
    fontSize: 12,
    color: COLORS.gray,
  },
  paymentLogRight: {
    alignItems: 'flex-end',
  },
  paymentLogAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  paymentLogBalance: {
    fontSize: 12,
    color: COLORS.gray,
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

export default FeesScreen;
