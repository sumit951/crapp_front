import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Layout from "../layouts/Layout";
import ScrollToTop from "../components/ScrollToTop";
import { useAuth } from "../utils/idb";
import { useEffect } from "react";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Services from "../pages/Services";
import Users from "../pages/Users";




export default function AppRouter() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Restaurant Routes (NO layout) */}
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/services" element={<Services />} />
            <Route path="/users" element={<Users />} />
          </Route>
        </Route>
        
      </Routes>
    </Router>
  );
}
