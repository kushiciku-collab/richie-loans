const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();


// ============================================================
// ADMIN TEST ROUTE
// ============================================================

router.get(
  "/dashboard",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome to the RICHIE LOANS admin area.",
      user: req.user,
    });
  }
);


module.exports = router;