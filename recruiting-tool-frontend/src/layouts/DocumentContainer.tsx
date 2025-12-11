import { Box, Container } from "@mui/material";
import { Outlet } from "react-router";

const DocumentContainer = () => (
  <Box
    sx={{
      minHeight: "100vh",
      display: "flex",
      justifyContent: "center",
      backgroundColor: "#f5f5f5",
      py: 4,
    }}
  >
    <Container maxWidth="lg">
      <Outlet />
    </Container>
  </Box>
);

export default DocumentContainer;
