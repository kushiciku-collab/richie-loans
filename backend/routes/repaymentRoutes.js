const express = require("express");

const {
  getRepayments,
  getLoanRepayments,
  createRepayment,
} = require("../controllers/repaymentController");

const router = express.Router();

router.get("/", getRepayments);

router.get("/loan/:loanId", getLoanRepayments);

router.post("/", createRepayment);

module.exports = router;