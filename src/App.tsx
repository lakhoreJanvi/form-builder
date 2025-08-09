import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import { Container, AppBar, Toolbar, Button, Typography, Box } from "@mui/material";
import CreateForm from "./pages/CreateForm";
import PreviewForm from "./pages/PreviewForm";
import MyForms from "./pages/MyForms";

export default function App() {
  return (
    <>
      <AppBar position="sticky">
        <Toolbar>
          <Typography variant="h6" sx={{ flex: 1 }}>
            Upliance — Form Builder
          </Typography>
          <Button color="inherit" component={Link} to="/create">Create</Button>
          <Button color="inherit" component={Link} to="/preview">Preview</Button>
          <Button color="inherit" component={Link} to="/myforms">My Forms</Button>
        </Toolbar>
      </AppBar>

      <Container sx={{ mt: 4 }}>
        <Box>
          <Routes>
            <Route path="/" element={<CreateForm />} />
            <Route path="/create" element={<CreateForm />} />
            <Route path="/preview" element={<PreviewForm />} />
            <Route path="/preview/:id" element={<PreviewForm />} />
            <Route path="/myforms" element={<MyForms />} />
          </Routes>
        </Box>
      </Container>
    </>
  );
}
