import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Turns any error into a readable message for the screen
export function getErrorMessage(error) {
  if (error.response && error.response.data) {
    const data = error.response.data;
    if (data.fieldErrors) {
      return Object.values(data.fieldErrors).join(". ");
    }
    if (data.message) {
      return data.message;
    }
  }
  if (error.request) {
    return "Cannot reach the server. Is the backend running on port 8080?";
  }
  return "Something went wrong. Please try again.";
}

export default api;