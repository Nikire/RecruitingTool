import { Container, Toolbar } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import AddEmailBanner from "../components/navbar/AddEmailBanner";
import { useAuthMe } from "../hooks/api/useAuth";
import { useNotificationSSE } from "../hooks/useNotificationSSE";
import { isProtectedRoute } from "../api/axios";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Validate user session on every page
  const { isError } = useAuthMe();

  // Establish SSE connection for real-time notifications (only when authenticated)
  useNotificationSSE();

  // Redirect to login if session is invalid or user is not authenticated
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const currentPath = window.location.pathname;

    // If there's a token but the auth query failed (401, 403, etc.), session is invalid.
    // Only redirect to login on protected routes; public and token-based pages
    // (/careers, /book-interview, /book-demo, /submit, /unsubscribe, ...) must keep
    // working for visitors holding a stale token. Same denylist as the axios interceptor.
    if (token && isError && isProtectedRoute(currentPath)) {
      localStorage.removeItem("authToken");
      navigate("/login", { replace: true });
    }
  }, [isError, navigate]);

  // Use wider container for pages with tables or rich content
  const widePages = [
    "/",
    "/companies",
    "/candidates",
    "/careers",
    "/onboarding",
    "/profile/subscription",
  ];
  const isWidePage = widePages.includes(location.pathname);
  const maxWidth = isWidePage ? "xl" : "md";

  return (
    <>
      <Navbar />
      {/* Offset spacer - must match the Navbar toolbar height */}
      <Toolbar sx={{ minHeight: { xs: 64, sm: 70 } }} />
      <AddEmailBanner />
      <Container sx={{ py: 2 }} maxWidth={maxWidth}>
        <Outlet />
      </Container>
    </>
  );
};

export default MainLayout;
