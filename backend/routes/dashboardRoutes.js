
const express = require("express");
const jwt = require("jsonwebtoken");

const {
  getAdminDashboard,
  getCustomerDashboard,
} = require("../controllers/dashboardController");

const router = express.Router();


/*
=========================================================
AUTHENTICATION MIDDLEWARE
=========================================================
*/
const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication format.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required.",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    console.error(
      "Authentication error:",
      error.message
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token.",
    });
  }
};


/*
=========================================================
ADMIN AUTHORIZATION
=========================================================
*/
const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Administrator access required.",
    });
  }

  next();
};


/*
=========================================================
CUSTOMER AUTHORIZATION
=========================================================
*/
const requireCustomer = (req, res, next) => {
  if (req.user.role !== "customer") {
    return res.status(403).json({
      success: false,
      message: "Customer access required.",
    });
  }

  next();
};


/*
=========================================================
ADMIN DASHBOARD
=========================================================
*/
router.get(
  "/admin",
  authenticateToken,
  requireAdmin,
  getAdminDashboard
);


/*
=========================================================
CUSTOMER DASHBOARD
=========================================================
*/
router.get(
  "/customer",
  authenticateToken,
  requireCustomer,
  getCustomerDashboard
);


module.exports = router;