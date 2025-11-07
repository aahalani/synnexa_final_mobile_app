import { getToken, getUser } from './authService';
import logger from '../utils/logger';

const BASE_URL = 'http://34.203.42.115/SYN_TUT_API/';

export const ENDPOINTS = {
  LOGIN_USER: `${BASE_URL}api/Authenticate/ValidateUserInformation`,
  STUDENT_DASHBOARD: `${BASE_URL}api/student/StudentDashboard/NavigateToTab`,
  STUDENT_ASSIGNMENT_UPLOAD: `${BASE_URL}api/student/StudentAssignment/UploadStudentAssignmentAttachments`,
  STUDENT_ASSIGNMENT_UPDATE: `${BASE_URL}api/student/StudentAssignment/UpdateStudentAssignment`,
  // Faculty endpoints
  FACULTY_ATTENDANCE_MARK: `${BASE_URL}api/Faculty/Attendance/MarkAttendance`,
  FACULTY_ATTENDANCE_SEARCH: `${BASE_URL}api/faculty/Attendance/SearchAttendanceData`,
  FACULTY_ATTENDANCE_SUBMIT: `${BASE_URL}api/faculty/Attendance/SubmitAttendanceDetails`,
  FACULTY_ATTENDANCE_GET_COURSES: `${BASE_URL}api/faculty/Attendance/GetCoursesByBatchId`,
  FACULTY_CHECK_ASSIGNMENTS: `${BASE_URL}api/faculty/CheckAssignments/CheckAssignment`,
  FACULTY_SEARCH_ASSIGNMENTS: `${BASE_URL}api/faculty/CheckAssignments/SearchCompletedAssignments`,
  FACULTY_ASSIGNMENTS_GET_COURSES: `${BASE_URL}api/faculty/CheckAssignments/GetCoursesByBatchId`,
  FACULTY_LECTURE_CONTENT_UPLOAD: `${BASE_URL}api/Faculty/LectureContent/UploadLectureContent`,
  FACULTY_LECTURE_CONTENT_SEARCH: `${BASE_URL}api/faculty/LectureContent/SearchLectureContent`,
  FACULTY_LECTURE_CONTENT_SUBMIT: `${BASE_URL}api/faculty/LectureContent/SubmitLectureContentDetails`,
  FACULTY_LECTURE_GET_COURSES: `${BASE_URL}api/faculty/LectureContent/GetCoursesByBatchId`,
  // Payment endpoints (for faculty to view student payments)
  PAYMENT_SEARCH: `${BASE_URL}api/Payment/SearchPayments`,
};

export const apiFetch = async (endpoint, options = {}) => {
  const token = await getToken();
  const user = await getUser();

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    logger.debug('Authorization token present');
  } else {
    logger.debug('No token found');
  }
  
  if (user && user.userId) {
    headers.LOGGED_IN_USER = user.userId;
    logger.debug('User ID set in headers');
  } else {
    logger.debug('No user ID found');
  }
  
  logger.apiRequest(endpoint, options.method || 'GET', headers);

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    logger.apiResponse(endpoint, response.status, response.statusText);

    // Handle non-JSON responses gracefully
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (!response.ok) {
            // Use the server's error message if available
            const errorMessage = data.message || data.error || `Server error: ${response.status} ${response.statusText}`;
            logger.error('API Error Response', { endpoint, status: response.status });
            throw new Error(errorMessage);
        }
        logger.debug('API Response received', { endpoint });
        // Handle wrapped responses (wasSuccessful/data structure)
        if (data.wasSuccessful && data.data !== undefined) {
            return data.data;
        }
        return data;
    } else {
        if (!response.ok) {
            // Try to read the response as text for better error messages
            const text = await response.text();
            logger.error('API Error Response (Non-JSON)', { 
              endpoint, 
              status: response.status, 
              statusText: response.statusText
            });
            throw new Error(`Server error: ${response.status} ${response.statusText}${text ? ` - ${text.substring(0, 100)}` : ''}`);
        }
        // Handle non-json responses, e.g., file downloads
        logger.debug('API Response (Non-JSON)', { endpoint });
        return response; 
    }
  } catch (error) {
    logger.error('API Error', { endpoint, message: error.message });
    // Re-throw the error so the component can handle it
    throw error;
  }
};

// Form-data upload helper (do not set Content-Type so boundary is set automatically)
export const apiUploadFormData = async (endpoint, formData, options = {}) => {
  const token = await getToken();
  const user = await getUser();

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  if (user && user.userId) {
    headers.LOGGED_IN_USER = user.userId;
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      ...options,
      headers,
      body: formData,
    });

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.indexOf('application/json') !== -1) {
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }
      return data;
    }

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }
    return response;
  } catch (error) {
    logger.error('API Upload Error', { endpoint, message: error.message });
    throw error;
  }
};