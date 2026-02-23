import { Container, Toolbar } from "@mui/material";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "../components/navbar/Navbar";
import { useAuthMe } from "../hooks/api/useAuth";
import { useNotificationSSE } from "../hooks/useNotificationSSE";

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

    // Don't redirect on public routes
    const publicRoutes = [
      "/careers",
      "/book-interview",
      "/booking-confirmed",
    ];
    const isPublicRoute = publicRoutes.some((route) =>
      currentPath.startsWith(route),
    );

    // If there's a token but the auth query failed (401, 403, etc.), session is invalid
    // Only redirect to login if we're NOT on a public route
    if (token && isError && !isPublicRoute) {
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
      <Toolbar /> {/* Offset spacer for fixed AppBar */}
      <Container sx={{ py: 2 }} maxWidth={maxWidth}>
        <Outlet />
      </Container>
    </>
  );
};

export default MainLayout;
