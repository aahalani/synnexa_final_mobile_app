export const loginApi = (username, password) => {
  const URL =
    "https://342b-2401-4900-1cb2-bfc3-b0bf-ec45-97f3-e02a.ngrok-free.app/api/Authenticate/ValidateUserInformation";
  // create a post request to the server
  return fetch(URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      username,
      password,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      return data;
    })
    .catch((error) => {
      console.error("Error:", error);
    });
};
