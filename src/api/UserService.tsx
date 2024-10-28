import axios from "axios";
import { User } from "./dataTypes";

// const USER_BASE_URL = "https://datamate-api.onrender.com/user";
const USER_BASE_URL = process.env.REACT_APP_API_URL 
  ? process.env.REACT_APP_API_URL + `/user` 
  : "http://localhost:8080/user";

  
const config = { 
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

class UserService {
  postUser(data: FormData, userImage?: File) {
    return axios.post(USER_BASE_URL + "/postUser", data, config);
  }

  getUserByUsername(username: string) {
    return axios.get(USER_BASE_URL + "/getByUsername?username=" + username);
  }

  getUserByUsernameDetails(username: string) {
    return axios.get(
      USER_BASE_URL + "/getByUsernameDetails?username=" + username
    );
  }

  getUserById(id: string) {
    return axios.get(USER_BASE_URL + "/getUserById/" + id);
  }

  putUser = (id: string, data: User) => {
    return axios.put(USER_BASE_URL + "/putUser?userId" + id, data);
  };

  verifyPassword = async (id: string, password: string) => {
    return axios.post(`${USER_BASE_URL}/verifyPassword`, { id, password });
  };

  deleteUser = (userId: string) => {
    return axios.delete(`${USER_BASE_URL}/deleteUser/${userId}`);
  };

  //   deleteUser = async (userId: number) => {
  //     try {
  //       await axios.delete(`http://localhost:8080/user/deleteUser/${userId}`);
  //     } catch (error) {
  //       throw new Error(`Error deleting user: ${error}`);
  //     }
  //   };

  forgotPassword = (email: string) => {
    return axios.post(`${USER_BASE_URL}/forgot-password`, null, {
      params: { email }, // Send email as a query parameter
    });
  };

  verifyCode = (email: string, code: string) => {
    return axios.post(
      `${USER_BASE_URL}/verify-code?email=${email}&code=${code}`
    );
  };

  resetPassword = (email: string, newPassword: string) => {
    return axios.post(
      `${USER_BASE_URL}/reset-password?email=${email}&newPassword=${newPassword}`
    );
  };
}

export default new UserService();
