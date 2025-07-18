import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Layout from "../layouts/Layout";
import ScrollToTop from "../components/ScrollToTop";
import { useAuth } from "../utils/idb";
import { useEffect } from "react";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Services from "../pages/Services";
import Packages from "../pages/Packages";
import Users from "../pages/Users";
import Subjectareas from "../pages/Subjectareas";
import Orders from "../pages/Orders";
import Companies from "../pages/Companies";
import Agreements from "../pages/Agreements";



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
            <Route path="/packages" element={<Packages />} />
            <Route path="/users" element={<Users />} />
            <Route path="/subjectareas" element={<Subjectareas />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:userId" element={<Orders />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/agreements" element={<Agreements />} />
          </Route>
        </Route>
        
      </Routes>
    </Router>
  );
}
