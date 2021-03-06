import React from 'react'

const apiBaseUrl = 'http://localhost:8000'

export const AuthContext = React.createContext();


export const initialState = {
  isAuthenticated: false,
  user: null,
  token: localStorage.getItem('token'),
  apiBaseUrl: apiBaseUrl,
  darkMode: JSON.parse(localStorage.getItem('dark-mode'))
};

export const reducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", JSON.stringify(action.payload.access_token));
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.access_token
      };
    case "LOGOUT":
      localStorage.clear();
      return {
        ...state,
        isAuthenticated: false,
        user: null
      };

    default:
      return state;
  }
};
