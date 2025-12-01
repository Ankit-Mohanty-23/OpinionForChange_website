import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import OpinaraLanding from "./pages/LandingPage";
import OpinaraAuth from "./pages/LoginSignupPage";
import TermsAndPolicy from "./components/Terms&Policy";
import AuthSuccess from "./components/AuthSuccess";
import HomePage from "./pages/HomePage";

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <main>
          <Routes>
            <Route path="/" element={<OpinaraLanding />} />
            <Route path="/login" element={<OpinaraAuth />} />
            <Route path="/terms" element={<TermsAndPolicy />} />
            <Route path="/auth/success" element={<AuthSuccess />} />
            <Route 
              path="/home" 
              element={
                <ProtectedRoute>
                  <HomePage />
                </ProtectedRoute>
              } />
          </Routes>
        </main>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
