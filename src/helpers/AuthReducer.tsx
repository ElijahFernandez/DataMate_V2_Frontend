
const initialState = {
    isLoggedIn: false,
    userId: null,
    error: null,
  };

// const savedUserData = localStorage.getItem('userData');
// const initialState = {
//   isLoggedIn: !!savedUserData,
//   user: savedUserData ? JSON.parse(savedUserData) : null,
//   error: null,
// };
  
const AuthReducer = (state = initialState, action:any) => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isLoggedIn: true,
        userId: action.payload,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isLoggedIn: false,
        userId: null,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isLoggedIn: false,
        userId: null,
        error: null,
      };
    default:
      return state;
  }
};

export default AuthReducer;