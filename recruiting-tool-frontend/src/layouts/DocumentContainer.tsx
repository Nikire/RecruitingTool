import { Box } from "@mui/material";
import { Outlet } from "react-router";

/**
 * Thin wrapper for document-style detail pages.
 *
 * This layout is mounted INSIDE `MainLayout`, which already renders the navbar,
 * its toolbar spacer and the page `Container`. It therefore must not repeat
 * either: a nested `Container` would be clamped by the outer one (dead code),
 * and `minHeight: 100vh` would stack on top of ~100px of navbar chrome and push
 * every page past the viewport, guaranteeing a scrollbar and empty space below
 * the content.
 */
const DocumentContainer = () => (
  <Box sx={{ backgroundColor: "background.default", py: 2 }}>
    <Outlet />
  </Box>
);

export default DocumentContainer;
