import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * ScrollToTop
 *
 * Resets the window scroll position to the top whenever the route changes.
 * Must be rendered inside a Router context (e.g. BrowserRouter) so it can
 * access `useLocation`.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
