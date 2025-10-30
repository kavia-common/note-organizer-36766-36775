import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import "./theme.css";
import AppShell from "./components/AppShell";

/**
 * PUBLIC_INTERFACE
 * App
 * Entry point wrapper providing routing for categories and notes.
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/c/1" replace />} />
        </Route>
        <Route path="/c/:categoryId" element={<AppShell />} />
        <Route path="/n/:noteId" element={<AppShell />} />
        <Route path="*" element={<Navigate to="/c/1" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
