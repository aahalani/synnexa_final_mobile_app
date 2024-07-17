import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const height = Dimensions.get("window").height;

const AssignmentScreen = () => {
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
    attendanceOverviewDtoList: [],
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
    assignmentDtoList: [
      {
        assignmentId: 20,
        batchId: 1,
        courseId: 2,
        fromDate: "2024-07-03T00:00:00",
        toDate: "2024-07-03T00:00:00",
        outOff: 0,
        assignmentDetails: "hi",
        remark: "shj",
        createdBy: 2,
        createdOn: "2024-07-03T15:36:08.977",
        modifiedBy: 2,
        modifiedOn: "2024-07-03T15:36:13.983",
        batchName: "BAT-001",
        courseName: "Azure Development",
        assignmentDateFromToStr: "03/07/2024-03/07/2024",
        fromDateStr: "03 July, 2024",
        toDateStr: "03 July, 2024",
        assignmentCreatedDateStr: "03 July, 2024",
        assignmentCreatedTimeStr: "03:36 PM",
        isStudentAssignmetSubmitted: false,
        obtainedMarks: null,
        facultyRemark: null,
        status: null,
        facultyId: 1,
        assignmentUploadDtoList: [],
      },
      {
        assignmentId: 19,
        batchId: 1,
        courseId: 6,
        fromDate: "2024-05-07T00:00:00",
        toDate: "2024-05-10T00:00:00",
        outOff: 70,
        assignmentDetails: "Javascript Array Assignment",
        remark: "ABCD",
        createdBy: 4,
        createdOn: "2024-05-04T21:13:49.067",
        modifiedBy: 4,
        modifiedOn: "2024-05-04T21:13:49.067",
        batchName: "BAT-001",
        courseName: "Azure Key VAULT",
        assignmentDateFromToStr: "07/05/2024-10/05/2024",
        fromDateStr: "07 May, 2024",
        toDateStr: "10 May, 2024",
        assignmentCreatedDateStr: "04 May, 2024",
        assignmentCreatedTimeStr: "09:13 PM",
        isStudentAssignmetSubmitted: false,
        obtainedMarks: null,
        facultyRemark: null,
        status: null,
        facultyId: 4,
        assignmentUploadDtoList: [
          {
            assignmentUploadId: "aea659a0-67db-494f-b737-007668944e9b",
            assignmentId: 19,
            originalFileName: "1.jpg",
            fileExtension: ".jpg",
            fileSizeBytes: 22255,
            fileContentType: "image/jpeg",
            uploadedOn: "2024-05-04T15:44:15.32",
          },
          {
            assignmentUploadId: "2f3964ba-f9d2-45c4-8bae-62e47a6c25bf",
            assignmentId: 19,
            originalFileName: "2.jpg",
            fileExtension: ".jpg",
            fileSizeBytes: 67080,
            fileContentType: "image/jpeg",
            uploadedOn: "2024-05-04T15:44:17.837",
          },
          {
            assignmentUploadId: "3c85e876-cc43-47e8-8023-717b10b760a0",
            assignmentId: 19,
            originalFileName: "sign.jpg",
            fileExtension: ".jpg",
            fileSizeBytes: 6602,
            fileContentType: "image/jpeg",
            uploadedOn: "2024-05-04T15:44:19.12",
          },
          {
            assignmentUploadId: "e7af4a74-a7bc-4de2-915d-f8ad26a715a8",
            assignmentId: 19,
            originalFileName: "photo.jpg",
            fileExtension: ".jpg",
            fileSizeBytes: 19738,
            fileContentType: "image/jpeg",
            uploadedOn: "2024-05-04T15:44:18.087",
          },
          {
            assignmentUploadId: "af1ca9a1-4397-4c2d-8da5-f978636af0e3",
            assignmentId: 19,
            originalFileName: "1 - Copy.jpg",
            fileExtension: ".jpg",
            fileSizeBytes: 22255,
            fileContentType: "image/jpeg",
            uploadedOn: "2024-05-04T15:44:16.567",
          },
        ],
      },
      {
        assignmentId: 18,
        batchId: 2,
        courseId: 4,
        fromDate: "2024-04-27T00:00:00",
        toDate: "2024-04-27T00:00:00",
        outOff: 100,
        assignmentDetails: "enter for testing purpose 4",
        remark: "enter for testing purpose remark 4",
        createdBy: 4,
        createdOn: "2024-04-27T14:36:41.53",
        modifiedBy: 4,
        modifiedOn: "2024-04-27T14:36:41.53",
        batchName: "BAT-002",
        courseName: "Azure API Management",
        assignmentDateFromToStr: "27/04/2024-27/04/2024",
        fromDateStr: "27 April, 2024",
        toDateStr: "27 April, 2024",
        assignmentCreatedDateStr: "27 April, 2024",
        assignmentCreatedTimeStr: "02:36 PM",
        isStudentAssignmetSubmitted: false,
        obtainedMarks: null,
        facultyRemark: null,
        status: null,
        facultyId: 4,
        assignmentUploadDtoList: [],
      },
    ],
  };

  const renderAssignmentItem = ({ item }) => (
    <View style={styles.assignmentCard}>
      <View style={styles.assignmentHeader}>
        <Text style={styles.courseName}>{item.courseName}</Text>
        <Text style={styles.batchName}>{item.batchName}</Text>
      </View>
      <Text style={styles.assignmentDetails}>{item.assignmentDetails}</Text>
      <View style={styles.dateContainer}>
        <Ionicons name="calendar-outline" size={16} color="#666" />
        <Text style={styles.dateText}>
          {item.fromDateStr} - {item.toDateStr}
        </Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Out of:</Text>
        <Text style={styles.infoValue}>{item.outOff}</Text>
      </View>
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Status:</Text>
        <Text
          style={[
            styles.infoValue,
            { color: item.isStudentAssignmetSubmitted ? "#4CAF50" : "#F44336" },
          ]}
        >
          {item.isStudentAssignmetSubmitted ? "Submitted" : "Not Submitted"}
        </Text>
      </View>
      {item.assignmentUploadDtoList.length > 0 && (
        <View style={styles.attachmentsContainer}>
          <Text style={styles.attachmentsLabel}>Attachments:</Text>
          {item.assignmentUploadDtoList.map((attachment, index) => (
            <TouchableOpacity
              key={attachment.assignmentUploadId}
              style={styles.attachmentItem}
            >
              <Ionicons name="document-outline" size={20} color="#4c669f" />
              <Text style={styles.attachmentName}>
                {attachment.originalFileName}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Assignments</Text>
      <FlatList
        data={data.assignmentDtoList}
        renderItem={renderAssignmentItem}
        keyExtractor={(item) => item.assignmentId.toString()}
        scrollEnabled={false}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    padding: 16,
    marginBottom: height > 700 ? 100 : 80,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  assignmentCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  assignmentHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  courseName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  batchName: {
    fontSize: 14,
    color: "#666",
  },
  assignmentDetails: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  attachmentsContainer: {
    marginTop: 8,
  },
  attachmentsLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  attachmentName: {
    fontSize: 14,
    color: "#4c669f",
    marginLeft: 4,
  },
});

export default AssignmentScreen;
