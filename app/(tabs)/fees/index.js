import React from "react";
import { View, Text, StyleSheet, ScrollView, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const FeesScreen = () => {
  const paymentDto = {
    courseDto: {
      courseId: 0,
      code: null,
      name: null,
      description: null,
      hours: null,
      credits: null,
      comments: null,
      isActive: null,
      isActiveId: 0,
      branchId: 0,
      createdOn: "0001-01-01T00:00:00",
      modifiedOn: null,
      createdBy: 0,
      modifiedBy: null,
      isSelected: false,
      courseDisplayName: null,
    },
    attendanceOverviewDtoList: [],
    attendanceDetailsDtoList: [],
    paymentDto: {
      paymentId: 1,
      studentId: 1,
      receiptNo: "RECEIPT-1-0001",
      actualAmt: 2000.0,
      discountPercent: 5.0,
      finalAmt: 1900.0,
      createdBy: 1,
      createdOn: "2024-03-30T19:33:05.997",
      modifiedBy: null,
      modifiedOn: null,
      paymentLogDtoList: [
        {
          paymentLogId: "f7b309b8-1583-4bae-8fb5-6004b614c59b",
          paymentId: 1,
          paymentDate: "2024-03-30T00:00:00",
          paymentDateStr: "30/03/2024",
          amtPaid: 430.0,
          paymentModeId: 22,
          balanceAmt: 1020.0,
          isActive: true,
          createdBy: 1,
          createdOn: "2024-03-30T19:33:51.137",
          modifiedBy: null,
          modifiedOn: null,
          paymentModeDisplayName: "Google Pay",
        },
        {
          paymentLogId: "401c77b2-8831-44a1-885b-b4aaae1bd5e1",
          paymentId: 1,
          paymentDate: "2024-04-02T00:00:00",
          paymentDateStr: "02/04/2024",
          amtPaid: 420.0,
          paymentModeId: 23,
          balanceAmt: 600.0,
          isActive: true,
          createdBy: 1,
          createdOn: "2024-04-15T22:27:56.52",
          modifiedBy: null,
          modifiedOn: null,
          paymentModeDisplayName: "Phone Pe",
        },
        {
          paymentLogId: "bfe330fd-e0c4-4a5d-87ec-d2609127a175",
          paymentId: 1,
          paymentDate: "2024-03-29T00:00:00",
          paymentDateStr: "29/03/2024",
          amtPaid: 450.0,
          paymentModeId: 21,
          balanceAmt: 1450.0,
          isActive: true,
          createdBy: 1,
          createdOn: "2024-03-30T19:33:29.827",
          modifiedBy: null,
          modifiedOn: null,
          paymentModeDisplayName: "Cash",
        },
      ],
      studentRegistrationDto: {
        studentId: 0,
        titleId: 0,
        lastName: null,
        firstName: null,
        nickName: null,
        maidenName: null,
        addr1: null,
        addr2: null,
        districtId: 0,
        stateId: 0,
        zipcode: null,
        mobileNo: null,
        genderId: 0,
        dateOfBirth: "0001-01-01T00:00:00",
        dateOfBirthStr: "",
        emailId: null,
        fatherName: null,
        fatherMobileNo: null,
        fatherEmailId: null,
        motherName: null,
        motherMobileNo: null,
        motherEmailId: null,
        stuNum: null,
        isActive: false,
        comment: null,
        registrationDate: "0001-01-01T00:00:00",
        registrationDateStr: "",
        photoId: "00000000-0000-0000-0000-000000000000",
        createdOn: "0001-01-01T00:00:00",
        modifiedOn: null,
        isActiveId: 0,
        admissionTo: 0,
        courseDtoList: [],
        studentFullName: "",
        password: null,
        branchId: 0,
        studentCourseId: "00000000-0000-0000-0000-000000000000",
        stateName: null,
        districtName: null,
      },
    },
    lectureContentDtoList: [],
    assignmentDtoList: [],
  };

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

  return (
    <ScrollView style={styles.container}>
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
        keyExtractor={(item) => item.paymentLogId}
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
});

export default FeesScreen;
