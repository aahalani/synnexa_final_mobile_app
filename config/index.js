// Synnexa Login:

// admin admin
// F240201 12345
// S240201 Vikrant1234

// Needed:

// Uploading assignment API (Student) working but where is the file (ATTACHMENT API)
// Download Via Browser? Base 64 string
// Loading GIF: HTML and CSS 
// Student Profile Details (Login is not enough): studentRegistrationDto is null (LOGIN API)
// Notifications DONE

import { useEffect } from "react";

const LOCALHOST = "http://34.203.42.115/SYN_TUT_API/";
const DOMAIN = "";

export const BASE_URL = LOCALHOST;

export const LOGIN_USER = `${BASE_URL}api/Authenticate/ValidateUserInformation`;
export const GET_ATTENDANCE = `${BASE_URL}api/student/StudentDashboard/NavigateToTab`;

export const getConfig = (authorizationToken, user) => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (authorizationToken) {
    headers.Authorization = "Bearer " + authorizationToken;
  }

  if (user) {
    // convert to integer
    headers.LOGGED_IN_USER = parseInt(user);
  }
  console.log("from config", headers);

  return { headers };
};

export const ENDPOINTS = {
  BASE_URL,
  LOGIN_USER,
  GET_ATTENDANCE,
};
