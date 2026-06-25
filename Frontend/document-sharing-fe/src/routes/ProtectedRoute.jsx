import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { authed, loading } = useContext(AuthContext);

  if (loading) return <div>Loading...</div>;; 
  
  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  return children;
}