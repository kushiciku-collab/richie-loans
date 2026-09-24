
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

import App from "./App.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import LoanProducts from "./pages/LoanProducts.jsx";
import Customers from "./pages/Customers.jsx";
import LoanApplications from "./pages/LoanApplications.jsx";
import ActiveLoans from "./pages/ActiveLoans.jsx";
import Repayments from "./pages/Repayments.jsx";
import Savings from "./pages/Savings.jsx";
import MainLayout from "./layouts/MainLayout.jsx";

function ProtectedRoute() {
  const token = localStorage.getItem("token");
  const user = localStorage.getItem("user");

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  return <MainLayout />;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>

        {/* PUBLIC PAGES */}

        <Route
          path="/"
          element={<App />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* PROTECTED ADMIN PAGES */}

        <Route element={<ProtectedRoute />}>

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/loan-products"
            element={<LoanProducts />}
          />

          <Route
            path="/customers"
            element={<Customers />}
          />

          <Route
            path="/applications"
            element={<LoanApplications />}
          />

          <Route
            path="/active-loans"
            element={<ActiveLoans />}
          />

          <Route
            path="/repayments"
            element={<Repayments />}
          />

          <Route
            path="/savings"
            element={<Savings />}
          />

        </Route>

        {/* UNKNOWN URL */}

        <Route
          path="*"
          element={<Navigate to="/" replace />}
        />

      </Routes>
    </BrowserRouter>
  </StrictMode>
);
