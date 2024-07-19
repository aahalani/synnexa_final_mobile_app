import React, { useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const height = Dimensions.get("window").height;

const Details = () => {
  const courseData = {
    courseDto: {
      courseId: 2,
      code: "001",
      name: "Azure Development",
      description: "Azure Description",
      hours: 45,
      credits: 3,
      comments: "No Comments",
      isActive: true,
      isActiveId: 7,
      branchId: 10,
      createdOn: "2023-12-17T21:00:27.673",
      modifiedOn: "2024-04-17T15:16:25.467",
      createdBy: 1,
      modifiedBy: 1,
      isSelected: false,
      courseDisplayName: "001-Azure Development",
    },
    attendanceOverviewDtoList: [],
    attendanceDetailsDtoList: [
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-03-06T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-02-28T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-02-06T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-03-05T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: false,
        attendanceDate: "2024-02-29T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-02-12T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-02-08T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-02-26T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-02-07T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-02-14T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: false,
        attendanceDate: "2024-03-07T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-02-13T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-02-27T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-02-21T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-02-05T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-02-01T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-03-04T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-02-19T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-02-20T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: true,
        attendanceDate: "2024-02-15T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
      {
        studentId: 1,
        courseId: 2,
        batchId: 1,
        facultyId: 1,
        isPresent: false,
        attendanceDate: "2024-02-22T00:00:00",
        facultyCode: "F240201",
        facultyFirstName: "Chunilal",
        facultyLastName: "Malhotra",
        attendancePercentage: null,
      },
    ],
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

  const attendancePercentage = useMemo(() => {
    const totalClasses = courseData.attendanceDetailsDtoList.length;
    const presentClasses = courseData.attendanceDetailsDtoList.filter(
      (a) => a.isPresent
    ).length;
    return totalClasses > 0
      ? ((presentClasses / totalClasses) * 100).toFixed(1)
      : 0;
  }, [courseData.attendanceDetailsDtoList]);

  const renderAttendanceItem = ({ item }) => (
    <View style={styles.attendanceItem}>
      <Text style={styles.attendanceDate}>
        {new Date(item.attendanceDate).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}
      </Text>
      <View
        style={[
          styles.attendanceStatus,
          { backgroundColor: item.isPresent ? "#4CAF50" : "#F44336" },
        ]}
      >
        <Text style={styles.attendanceStatusText}>
          {item.isPresent ? "Present" : "Absent"}
        </Text>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.courseName}>{courseData.courseDto.name}</Text>
        <Text style={styles.courseCode}>{courseData.courseDto.code}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.infoItem}>
          <Ionicons name="time-outline" size={24} color="#4c669f" />
          <Text style={styles.infoText}>
            {courseData.courseDto.hours} hours
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons name="star-outline" size={24} color="#4c669f" />
          <Text style={styles.infoText}>
            {courseData.courseDto.credits} credits
          </Text>
        </View>
      </View>

      <View style={styles.descriptionContainer}>
        <Text style={styles.descriptionTitle}>Course Description</Text>
        <Text style={styles.descriptionText}>
          {courseData.courseDto.description}
        </Text>
      </View>

      <View style={styles.attendanceOverview}>
        <Text style={styles.attendanceOverviewLabel}>Overall Attendance</Text>
        <View style={styles.attendancePercentageContainer}>
          <Text style={styles.attendancePercentage}>
            {attendancePercentage}%
          </Text>
          <View style={styles.attendanceBarBackground}>
            <View
              style={[
                styles.attendanceBar,
                { width: `${attendancePercentage}%` },
              ]}
            />
          </View>
        </View>
      </View>

      <Text style={styles.attendanceListHeader}>Attendance Details</Text>
      <FlatList
        data={courseData.attendanceDetailsDtoList}
        renderItem={renderAttendanceItem}
        keyExtractor={(item) => item.attendanceDate}
        style={styles.attendanceList}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    marginBottom: height < 700 ? 60 : 90,
  },
  header: {
    padding: 20,
  },
  courseName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#000",
    marginBottom: 5,
  },
  courseCode: {
    fontSize: 18,
    color: "#000",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 20,
    backgroundColor: "#fff",
    marginTop: 20,
    marginHorizontal: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  descriptionContainer: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: "#666",
    lineHeight: 24,
  },
  attendanceOverview: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  attendanceOverviewLabel: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  attendancePercentageContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  attendancePercentage: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4CAF50",
    marginRight: 10,
    width: 70,
  },
  attendanceBarBackground: {
    flex: 1,
    height: 10,
    backgroundColor: "#e0e0e0",
    borderRadius: 5,
  },
  attendanceBar: {
    height: 10,
    backgroundColor: "#4CAF50",
    borderRadius: 5,
  },
  attendanceListHeader: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  attendanceList: {
    marginHorizontal: 20,
    borderRadius: 15,
  },
  attendanceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  attendanceDate: {
    fontSize: 16,
    color: "#333",
  },
  attendanceStatus: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  attendanceStatusText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default Details;
