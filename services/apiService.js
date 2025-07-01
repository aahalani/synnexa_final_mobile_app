import { getToken, getUser } from './authService';

const BASE_URL = 'http://34.203.42.115/SYN_TUT_API/';

export const ENDPOINTS = {
  LOGIN_USER: `${BASE_URL}api/Authenticate/ValidateUserInformation`,
  STUDENT_DASHBOARD: `${BASE_URL}api/student/StudentDashboard/NavigateToTab`,
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
  }
  
  if (user && user.userId) {
    headers.LOGGED_IN_USER = user.userId;
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
    });

    // Handle non-JSON responses gracefully
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        const data = await response.json();
        if (!response.ok) {
            // Use the server's error message if available
            throw new Error(data.message || 'Something went wrong');
        }
        console.log('[API Response]', { endpoint, data });
        return data;
    } else {
        if (!response.ok) {
            throw new Error(`Server error: ${response.statusText}`);
        }
        // Handle non-json responses, e.g., file downloads
        console.log('[API Response - Non-JSON]', { endpoint, response });
        return response; 
    }
  } catch (error) {
    console.error('[API Error]', { endpoint, error });
    // Re-throw the error so the component can handle it
    throw error;
  }
};