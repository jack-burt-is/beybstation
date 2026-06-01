import { Navigate, Outlet } from "react-router";
import { isLoggedIn } from "../../lib/auth";

export default function AdminAuthGuard() {
  if (!isLoggedIn()) {
    return <Navigate to="/admin" replace />;
  }
  return <Outlet />;
}
