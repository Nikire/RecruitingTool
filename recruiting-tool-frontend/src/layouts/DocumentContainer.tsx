import { Box, Container } from "@mui/material";
import { Outlet } from "react-router";

const DocumentContainer = () => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      backgroundColor: "background.default",
      py: 4,
    }}
  >
    <Container maxWidth="lg">
      <Outlet />
    </Container>
  </Box>
);

export default DocumentContainer;
