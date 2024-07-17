import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";

const AttendanceScreen = () => {
  const data = {
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
    attendanceOverviewDtoList: [
      {
        studentId: 1,
        courseId: 2,
        courseCode: "001",
        courseName: "Azure Development",
        batchId: 1,
        batchCode: "BAT-001",
        batchName: "Batch for 10th Class Students",
        startDate: "2024-02-01T00:00:00",
        endDate: "2024-05-15T00:00:00",
        presentCount: 18,
        absentCount: 3,
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 4,
        courseCode: "002",
        courseName: "Azure API Management",
        batchId: 2,
        batchCode: "BAT-002",
        batchName: "10th Afternoon Batch",
        startDate: "2024-03-05T00:00:00",
        endDate: "2024-04-03T00:00:00",
        presentCount: 0,
        absentCount: 0,
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 6,
        courseCode: "003",
        courseName: "Azure Key VAULT",
        batchId: 1,
        batchCode: "BAT-001",
        batchName: "Batch for 10th Class Students",
        startDate: "2024-02-04T00:00:00",
        endDate: "2024-02-29T00:00:00",
        presentCount: 2,
        absentCount: 14,
        attendancePercentage: null,
      },
    ],
    attendanceDetailsDtoList: [],
    paymentDto: {
      paymentId: 0,
      studentId: 0,
      receiptNo: null,
      actualAmt: 0,
      discountPercent: 0,
      finalAmt: 0,
      createdBy: 0,
      createdOn: "0001-01-01T00:00:00",
      modifiedBy: null,
      modifiedOn: null,
      paymentLogDtoList: [],
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
  const calculateAttendancePercentage = (present, absent) => {
    const total = present + absent;
    return total > 0 ? ((present / total) * 100).toFixed(1) : 0;
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Attendance Overview</Text>
      {data.attendanceOverviewDtoList.map((course, index) => (
        <TouchableOpacity
          key={index}
          style={styles.courseCard}
          onPress={() => {
            router.push("(tabs)/attendance/Details");
          }}
        >
          <Text style={styles.courseName}>{course.courseName}</Text>
          <Text style={styles.batchName}>{course.batchName}</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{course.presentCount}</Text>
              <Text style={styles.statLabel}>Present</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{course.absentCount}</Text>
              <Text style={styles.statLabel}>Absent</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {calculateAttendancePercentage(
                  course.presentCount,
                  course.absentCount
                )}
                %
              </Text>
              <Text style={styles.statLabel}>Attendance</Text>
            </View>
          </View>
          <Text style={styles.dateRange}>
            {new Date(course.startDate).toLocaleDateString()} -{" "}
            {new Date(course.endDate).toLocaleDateString()}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 16,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  courseCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  courseName: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 4,
    color: "#333",
  },
  batchName: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
  dateRange: {
    fontSize: 14,
    color: "#999",
  },
});

export default AttendanceScreen;
