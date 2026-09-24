const express = require("express");

const {
  getLoans,
  getCustomerLoans,
  createLoan,
  approveLoan,
  rejectLoan,
  getActiveLoans,
  activateLoan,
} = require("../controllers/loanController");

const router = express.Router();

// Loan Applications
router.get("/", getLoans);
router.get("/customer/:customerId", getCustomerLoans);
router.post("/", createLoan);
router.put("/:id/approve", approveLoan);
router.put("/:id/reject", rejectLoan);

// Active Loans
router.get("/active", getActiveLoans);
router.put("/:id/activate", activateLoan);

module.exports = router;