import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENDPOINTS, getConfig } from "../../../config";

const FeesScreen = () => {
  const [paymentDto, setPaymentDto] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const token =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJzeW5uZXhhVHV0b3JXZWJBcGlTdWJqZWN0IiwianRpIjoiYmFkOTgwYmYtYzc2MS00YjBhLWFiNDctYjNlZGE5MTEwMDhiIiwiaWF0IjoiMjcvOC8yMDI0IDg6MzY6NTVwbSIsIklkIjoiNiIsIlVzZXJOYW1lIjoiUzI0MDIwMSIsImV4cCI6MjA0MDEzMTIxNSwiaXNzIjoic3lubmV4YVR1dG9yV2ViQXBpSXNzdWVyIiwiYXVkIjoic3lubmV4YVR1dG9yV2ViQXBpQXVkaWVuY2UifQ.YNFygDgQM-PzcN-gA_GjJO-_-2GGdEFBhH3QthAuw-c";
      const userId = 6;
      const headers = getConfig(token, userId).headers;

      const response = await fetch(
        `${ENDPOINTS.GET_ATTENDANCE}?` +
          new URLSearchParams({
            tabConstant: "Fees",
          }).toString(),
        {
          headers,
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setPaymentDto(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      setPaymentDto(null);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData().then(() => setRefreshing(false));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const renderPaymentLogItem = ({ item }) => (
    <View style={styles.paymentLogItem}>
      <View style={styles.paymentLogLeft}>
        <Text style={styles.paymentLogDate}>{item.paymentDateStr}</Text>
        <Text style={styles.paymentLogMode}>{item.paymentModeDisplayName}</Text>
      </View>
      <View style={styles.paymentLogRight}>
        <Text style={styles.paymentLogAmount}>₹{item.amtPaid.toFixed(2)}</Text>
        <Text style={styles.paymentLogBalance}>
          Balance: ₹{item.balanceAmt.toFixed(2)}
        </Text>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#333" />
      </View>
    );
  }

  if (!paymentDto) {
    return (
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#000"]}
            tintColor="#000"
            title="Pull to refresh"
            titleColor="#000"
          />
        }
      >
        <Text style={styles.noDataMessage}>No fee data available.</Text>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#000"]}
          tintColor="#000"
          title="Pull to refresh"
          titleColor="#000"
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Fees Overview</Text>
        <Text style={styles.receiptNo}>{paymentDto.receiptNo}</Text>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Total Fee</Text>
          <Text style={styles.summaryValue}>
            ₹{paymentDto.paymentDto.actualAmt.toFixed(2)}
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Discount</Text>
          <Text style={styles.summaryValue}>
            {paymentDto.paymentDto.discountPercent}%
          </Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Final Amount</Text>
          <Text style={styles.summaryValue}>
            ₹{paymentDto.paymentDto.finalAmt.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.paymentLogsHeader}>
        <Ionicons name="time-outline" size={24} color="#4c669f" />
        <Text style={styles.paymentLogsTitle}>Payment History</Text>
      </View>

      <FlatList
        data={paymentDto.paymentDto.paymentLogDtoList}
        renderItem={renderPaymentLogItem}
        keyExtractor={(item) => item.paymentLogId.toString()}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  header: {
    padding: 20,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#000",
  },
  receiptNo: {
    fontSize: 16,
    color: "#e0e0e0",
    marginTop: 5,
  },
  summaryCard: {
    backgroundColor: "#fff",
    margin: 16,
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: "#666",
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  paymentLogsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 16,
    marginTop: 20,
    marginBottom: 10,
  },
  paymentLogsTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
  },
  paymentLogItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  paymentLogLeft: {
    flex: 1,
  },
  paymentLogRight: {
    alignItems: "flex-end",
  },
  paymentLogDate: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  paymentLogMode: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  paymentLogAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  paymentLogBalance: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  noDataMessage: {
    textAlign: "center",
    color: "#666",
    fontSize: 16,
    marginTop: 20,
  },
});

export default FeesScreen;
