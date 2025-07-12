import { Outlet, Navigate } from "react-router-dom";


const ProtectedRoutes = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  return isAuthenticated ? <Outlet path="/" /> : <Navigate to="/login" />;
}


export default ProtectedRoutes;