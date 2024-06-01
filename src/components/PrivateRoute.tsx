import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../helpers/Store";

const PrivateRoute = ({ children }: { children: JSX.Element}) => {
    const isLoggedIn = useSelector((state:RootState) => state.auth.isLoggedIn);
    if (!isLoggedIn) {
        return <Navigate to="/login" />;
      }
    return children;
  }

export default PrivateRoute;
