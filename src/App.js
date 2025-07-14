import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AddItem from "./pages/AddItem";
import UpdateStock from "./pages/UpdateStock";
import ViewInventory from "./pages/ViewInventory";
import Reports from "./pages/Reports";
import Alerts from "./pages/Alerts";
import IssueItem from "./pages/IssueItem";

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

// Public Route component (redirect to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/dashboard" />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
        
        {/* Protected Routes inside Layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout><Dashboard /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/add-item" element={
          <ProtectedRoute>
            <Layout><AddItem /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/update-stock" element={
          <ProtectedRoute>
            <Layout><UpdateStock /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/view-inventory" element={
          <ProtectedRoute>
            <Layout><ViewInventory /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <Layout><Reports /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/alerts" element={
          <ProtectedRoute>
            <Layout><Alerts /></Layout>
          </ProtectedRoute>
        } />
        <Route path="/issue-item" element={
          <ProtectedRoute>
            <Layout><IssueItem /></Layout>
          </ProtectedRoute>
        } />

        {/* Redirect root to login if not authenticated, dashboard if authenticated */}
        <Route path="/" element={
          <PublicRoute>
            <Navigate to="/login" />
          </PublicRoute>
        } />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
