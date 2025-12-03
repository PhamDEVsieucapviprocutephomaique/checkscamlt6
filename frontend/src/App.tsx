import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Search from "./pages/Search";
import WarningDetail from "./pages/WarningDetail";
import Report from "./pages/Report";
import ReportSuccess from "./pages/ReportSuccess";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import MyWarnings from "./pages/MyWarnings";
import AdminsList from "./pages/AdminsList";
import AdminDetail from "./pages/AdminDetail";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/search" element={<Search />} />
              <Route path="/warning/:id" element={<WarningDetail />} />
              <Route path="/report" element={<Report />} />
              <Route path="/report/success" element={<ReportSuccess />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-warnings" element={<MyWarnings />} />
              <Route path="/admins" element={<AdminsList />} />
              <Route path="/admin/:id" element={<AdminDetail />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
