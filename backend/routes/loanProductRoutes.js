const express = require("express");

const {
  getLoanProducts,
  createLoanProduct,
  updateLoanProduct,
  deleteLoanProduct,
} = require("../controllers/loanProductController");

const router = express.Router();

router.get("/", getLoanProducts);

router.post("/", createLoanProduct);

router.put("/:id", updateLoanProduct);

router.delete("/:id", deleteLoanProduct);

module.exports = router;