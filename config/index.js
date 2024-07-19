import { useEffect } from "react";

const LOCALHOST = "https://bed7-223-230-104-82.ngrok-free.app/";
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
