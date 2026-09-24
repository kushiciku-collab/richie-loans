
const express = require("express");

const {
  getSavings,
  getCustomerSavings,
  createSaving,
} = require("../controllers/savingsController");

const router = express.Router();

router.get("/", getSavings);

router.get("/customer/:customerId", getCustomerSavings);

router.post("/", createSaving);

module.exports = router;

