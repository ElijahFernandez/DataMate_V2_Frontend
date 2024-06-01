import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || 'DefaultKey';

export const loginSuccess = (userId: string) => {
  // encrypt userId before dispatch
  const encryptedUserId = CryptoJS.AES.encrypt(JSON.stringify(userId), ENCRYPTION_KEY).toString();
  return {
    type: 'LOGIN_SUCCESS',
    payload: encryptedUserId,
  };
};

export const loginFailure = (error:any) => {
  return {
    type: 'LOGIN_FAILURE',
    payload: error,
  };
};

export const logout = () => {
  localStorage.removeItem('userData');
  return {
    type: 'LOGOUT',
  };
};

// export const UPDATE_USER_PROFILE = 'UPDATE_USER_PROFILE';

// export const updateUserProfile = (updatedUserData:any) => {
//   return {
//     type: UPDATE_USER_PROFILE,
//     payload: updatedUserData,
//   };
// };
