import { createBrowserRouter, Navigate } from "react-router";
import LandingPage from "./pages/landing";
import LiveResultsPage from "./pages/live-results";
import OverlayPage from "./pages/overlay";
import AdminLogin from "./pages/admin/login";
import AdminAuthGuard from "./pages/admin/auth-guard";
import AdminHome from "./pages/admin/home";
import AdminCreate from "./pages/admin/create";
import AdminTournament from "./pages/admin/tournament";
import AdminMatch from "./pages/admin/match";

export const router = createBrowserRouter([
  { path: "/", element: <LandingPage /> },
  { path: "/results", element: <LiveResultsPage /> },
  { path: "/overlay", element: <OverlayPage /> },
  { path: "/admin", element: <AdminLogin /> },
  {
    path: "/admin",
    element: <AdminAuthGuard />,
    children: [
      { path: "home", element: <AdminHome /> },
      { path: "create", element: <AdminCreate /> },
      { path: "tournament/:id", element: <AdminTournament /> },
      { path: "tournament/:id/match/:roundIdx/:matchIdx", element: <AdminMatch /> },
    ],
  },
  { path: "*", element: <Navigate to="/" replace /> },
]);
