import { getToken, getUser } from './authService';
import logger from '../utils/logger';

const BASE_URL = 'http://34.203.42.115/SYN_TUT_API/';

export const ENDPOINTS = {
  LOGIN_USER: `${BASE_URL}api/Authenticate/ValidateUserInformation`,
  STUDENT_DASHBOARD: `${BASE_URL}api/student/StudentDashboard/NavigateToTab`,
  STUDENT_ATTENDANCE_OVERVIEW: `${BASE_URL}api/Student/StudentDashboard/ShowAttendanceOverViewPopup`,
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
  FACULTY_LECTURE_CONTENT_UPLOAD_DOCUMENTS: `${BASE_URL}api/Faculty/LectureContent/UploadLectureContentDocuments`,
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

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (!response.ok) {
            const errorMessage = data.message || data.error || `Server error: ${response.status} ${response.statusText}`;
            logger.error('API Error Response', { endpoint, status: response.status });
            throw new Error(errorMessage);
        }
        logger.debug('API Response received', { endpoint });
        if (data.wasSuccessful && data.data !== undefined) {
            return data.data;
        }
        return data;
    } else {
        if (!response.ok) {
            const text = await response.text();
            logger.error('API Error Response (Non-JSON)', { 
              endpoint, 
              status: response.status, 
              statusText: response.statusText
            });
            throw new Error(`Server error: ${response.status} ${response.statusText}${text ? ` - ${text.substring(0, 100)}` : ''}`);
        }
        logger.debug('API Response (Non-JSON)', { endpoint });
        return response; 
    }
  } catch (error) {
    logger.error('API Error', { endpoint, message: error.message });
    throw error;
  }
};

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

  logger.apiRequest(endpoint, 'POST', headers);

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
        const errorMsg = data.message || data.title || data.error || `Upload failed: ${response.status} ${response.statusText}`;
        const fullErrorMsg = data.errors ? `${errorMsg}\n\nValidation errors: ${JSON.stringify(data.errors)}` : errorMsg;
        logger.error('API Upload Error', { endpoint, status: response.status, message: errorMsg, data });
        throw new Error(fullErrorMsg);
      }
      return data;
    }

    if (!response.ok) {
      const text = await response.text();
      let errorData = null;
      try {
        errorData = JSON.parse(text);
      } catch (e) {
      }
      
      const errorMsg = errorData 
        ? (errorData.message || errorData.title || errorData.error || `Server error: ${response.status}`)
        : `Server error: ${response.status} ${response.statusText}${text ? ` - ${text.substring(0, 500)}` : ''}`;
      
      const fullErrorMsg = errorData && errorData.errors
        ? `${errorMsg}\n\nValidation errors: ${JSON.stringify(errorData.errors)}`
        : errorMsg;
      
      logger.error('API Upload Error', { endpoint, status: response.status, statusText: response.statusText, responseText: text, errorData });
      throw new Error(fullErrorMsg);
    }
    return response;
  } catch (error) {
    logger.error('API Upload Error', { endpoint, message: error.message, stack: error.stack });
    throw error;
  }
};