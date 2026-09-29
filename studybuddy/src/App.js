import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Quiz from "./components/Quiz";
import LandingPage from "./pages/LandingPage";
import UseLogin from "./components/UseLogin";
import Summarization from "./components/Summarization";
import Chatbot from "./components/Chatbot";
import ProtectedRoute from "./ProtectedRoute";
import ApiCode from "./components/Pronunciation";
import Dashboard from "./components/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<UseLogin />} />

        {/* Protected Routes */}
        <Route
          path="/Quiz"
          element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          }
        />
        <Route
          path="/Dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/summarization"
          element={
            <ProtectedRoute>
              <Summarization />
            </ProtectedRoute>
          }
        />
        <Route
          path="/chatbot"
          element={
            <ProtectedRoute>
              <Chatbot />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pronunciation"
          element={
            <ProtectedRoute>
              <ApiCode />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;