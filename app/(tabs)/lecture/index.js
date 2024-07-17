import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const LectureScreen = () => {
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
    lectureContentDtoList: [
      {
        lectureContentId: "7dd6ed88-d9c2-4eda-9938-1b3af62e782f",
        batchId: 1,
        courseId: 2,
        lectureDate: "2024-02-15T00:00:00",
        lectureDateStr: "15/02/2024",
        lectureTitle: "C++ Notes and Other Documents",
        createdBy: 2,
        createdOn: "2024-04-09T13:55:17.89",
        modifiedBy: 2,
        modifiedOn: "2024-04-15T22:16:01.59",
        facultyId: 1,
        lectureContentUploadDtoList: [
          {
            lectureContentUploadId: "978f056d-4a05-4729-ad97-011956270ab0",
            lectureContentId: "7dd6ed88-d9c2-4eda-9938-1b3af62e782f",
            originalFileName: "photo.jpg",
            fileExtension: ".jpg",
            fileSizeBytes: 19738,
            fileContentType: "image/jpeg",
          },
          {
            lectureContentUploadId: "43850d71-f279-4f64-a26c-1ebd9fb99367",
            lectureContentId: "7dd6ed88-d9c2-4eda-9938-1b3af62e782f",
            originalFileName: "2.jpg",
            fileExtension: ".jpg",
            fileSizeBytes: 67080,
            fileContentType: "image/jpeg",
          },
          {
            lectureContentUploadId: "95234e8d-4eff-4413-af32-28048edb2d30",
            lectureContentId: "7dd6ed88-d9c2-4eda-9938-1b3af62e782f",
            originalFileName: "sign.jpg",
            fileExtension: ".jpg",
            fileSizeBytes: 6602,
            fileContentType: "image/jpeg",
          },
          {
            lectureContentUploadId: "81222fe6-3f03-432f-a15a-2f66d5dcc508",
            lectureContentId: "7dd6ed88-d9c2-4eda-9938-1b3af62e782f",
            originalFileName: "1.jpg",
            fileExtension: ".jpg",
            fileSizeBytes: 22255,
            fileContentType: "image/jpeg",
          },
          {
            lectureContentUploadId: "8ba2d6ff-ec65-4ec4-b2c8-a1b535cf13dd",
            lectureContentId: "7dd6ed88-d9c2-4eda-9938-1b3af62e782f",
            originalFileName: "1.jpg",
            fileExtension: ".jpg",
            fileSizeBytes: 22255,
            fileContentType: "image/jpeg",
          },
        ],
      },
      {
        lectureContentId: "6b6cce77-4351-4c1d-8567-1692b4de166a",
        batchId: 1,
        courseId: 2,
        lectureDate: "2024-03-05T00:00:00",
        lectureDateStr: "05/03/2024",
        lectureTitle: "Javascript Arrays",
        createdBy: 2,
        createdOn: "2024-04-15T22:17:51.163",
        modifiedBy: 2,
        modifiedOn: "2024-05-04T14:42:34.003",
        facultyId: 1,
        lectureContentUploadDtoList: [
          {
            lectureContentUploadId: "7f02e956-9200-4f47-8a0c-6bd50d3c2023",
            lectureContentId: "6b6cce77-4351-4c1d-8567-1692b4de166a",
            originalFileName: "1.jpg",
            fileExtension: ".jpg",
            fileSizeBytes: 22255,
            fileContentType: "image/jpeg",
          },
          {
            lectureContentUploadId: "efd1c462-775a-45f4-9fd6-90cc993bc1fd",
            lectureContentId: "6b6cce77-4351-4c1d-8567-1692b4de166a",
            originalFileName: "2.jpg",
            fileExtension: ".jpg",
            fileSizeBytes: 67080,
            fileContentType: "image/jpeg",
          },
          {
            lectureContentUploadId: "02f3bd80-430d-476b-a78a-b8f3e47864d5",
            lectureContentId: "6b6cce77-4351-4c1d-8567-1692b4de166a",
            originalFileName: "photo.jpg",
            fileExtension: ".jpg",
            fileSizeBytes: 19738,
            fileContentType: "image/jpeg",
          },
          {
            lectureContentUploadId: "d8afbe06-11e9-4e6d-8747-d7b6d4a27848",
            lectureContentId: "6b6cce77-4351-4c1d-8567-1692b4de166a",
            originalFileName: "1 - Copy.jpg",
            fileExtension: ".jpg",
            fileSizeBytes: 22255,
            fileContentType: "image/jpeg",
          },
        ],
      },
    ],
    assignmentDtoList: [],
  };
  const renderAttachmentItem = ({ item }) => (
    <TouchableOpacity style={styles.attachmentItem}>
      <Ionicons
        name={
          item.fileContentType.startsWith("image")
            ? "image-outline"
            : "document-outline"
        }
        size={24}
        color="#4c669f"
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
      <View style={styles.attachmentsContainer}>
        <Text style={styles.attachmentsLabel}>Attachments:</Text>
        <FlatList
          data={item.lectureContentUploadDtoList}
          renderItem={renderAttachmentItem}
          keyExtractor={(attachment) => attachment.lectureContentUploadId}
          horizontal={true}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Lecture Content</Text>
      <FlatList
        data={data.lectureContentDtoList}
        renderItem={renderLectureItem}
        keyExtractor={(item) => item.lectureContentId}
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
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  lectureCard: {
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
  lectureHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  lectureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  lectureDate: {
    fontSize: 14,
    color: "#666",
  },
  attachmentsContainer: {
    marginTop: 8,
  },
  attachmentsLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  attachmentItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 8,
    marginRight: 8,
  },
  attachmentName: {
    fontSize: 14,
    color: "#333",
    marginLeft: 8,
  },
});

export default LectureScreen;
