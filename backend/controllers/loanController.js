const db = require("../config/db");

// GET ALL LOAN APPLICATIONS
const getLoans = async (req, res) => {
  try {
    const [loans] = await db.query(`
      SELECT
        l.loan_id,
        l.customer_id,
        l.product_id,
        l.amount,
        l.interest_amount,
        l.total_amount,
        l.balance,
        l.application_date,
        l.approval_date,
        l.due_date,
        l.status,
        lp.product_name,
        lp.interest_rate,
        lp.repayment_period
      FROM loans l
      INNER JOIN loan_products lp
        ON l.product_id = lp.product_id
      ORDER BY l.application_date DESC
    `);

    res.json({
      success: true,
      loans,
    });
  } catch (error) {
    console.error("Get loans error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load loan applications.",
    });
  }
};


// GET LOANS FOR ONE CUSTOMER
const getCustomerLoans = async (req, res) => {
  try {
    const { customerId } = req.params;

    const [loans] = await db.query(
      `
      SELECT
        l.loan_id,
        l.customer_id,
        l.product_id,
        l.amount,
        l.interest_amount,
        l.total_amount,
        l.balance,
        l.application_date,
        l.approval_date,
        l.due_date,
        l.status,
        lp.product_name,
        lp.interest_rate,
        lp.repayment_period
      FROM loans l
      INNER JOIN loan_products lp
        ON l.product_id = lp.product_id
      WHERE l.customer_id = ?
      ORDER BY l.application_date DESC
      `,
      [customerId]
    );

    res.json({
      success: true,
      loans,
    });
  } catch (error) {
    console.error("Get customer loans error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load customer loans.",
    });
  }
};


// CREATE LOAN APPLICATION
const createLoan = async (req, res) => {
  try {
    const {
      customer_id,
      product_id,
      amount,
    } = req.body;

    if (!customer_id || !product_id || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Customer, loan product and amount are required.",
      });
    }

    const loanAmount = Number(amount);

    if (!Number.isFinite(loanAmount) || loanAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Loan amount must be greater than zero.",
      });
    }

    // Check customer
    const [customers] = await db.query(
      `
      SELECT customer_id
      FROM customers
      WHERE customer_id = ?
      `,
      [customer_id]
    );

    if (customers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    // Check active loan product
    const [products] = await db.query(
      `
      SELECT
        product_id,
        product_name,
        min_amount,
        max_amount,
        interest_rate,
        repayment_period
      FROM loan_products
      WHERE product_id = ?
        AND status = 'active'
      `,
      [product_id]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Loan product not found or is inactive.",
      });
    }

    const product = products[0];

    // Check minimum amount
    if (loanAmount < Number(product.min_amount)) {
      return res.status(400).json({
        success: false,
        message: `Minimum loan amount is ${product.min_amount}.`,
      });
    }

    // Check maximum amount
    if (loanAmount > Number(product.max_amount)) {
      return res.status(400).json({
        success: false,
        message: `Maximum loan amount is ${product.max_amount}.`,
      });
    }

    // Prevent multiple pending applications
    const [pendingLoans] = await db.query(
      `
      SELECT loan_id
      FROM loans
      WHERE customer_id = ?
        AND status = 'pending'
      `,
      [customer_id]
    );

    if (pendingLoans.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You already have a pending loan application.",
      });
    }

    // Calculate interest
    const interestAmount =
      loanAmount * (Number(product.interest_rate) / 100);

    const totalAmount = loanAmount + interestAmount;

    // Insert application
    const [result] = await db.query(
      `
      INSERT INTO loans
      (
        customer_id,
        product_id,
        amount,
        interest_amount,
        total_amount,
        balance,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'pending')
      `,
      [
        customer_id,
        product_id,
        loanAmount,
        interestAmount,
        totalAmount,
        totalAmount,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Loan application submitted successfully.",
      loan_id: result.insertId,
    });
  } catch (error) {
    console.error("Create loan error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to submit loan application.",
    });
  }
};


// APPROVE LOAN
const approveLoan = async (req, res) => {
  try {
    const { id } = req.params;

    const [loans] = await db.query(
      `
      SELECT loan_id, status
      FROM loans
      WHERE loan_id = ?
      `,
      [id]
    );

    if (loans.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Loan application not found.",
      });
    }

    if (loans[0].status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending applications can be approved.",
      });
    }

    await db.query(
      `
      UPDATE loans
      SET
        status = 'approved',
        approval_date = NOW()
      WHERE loan_id = ?
      `,
      [id]
    );

    res.json({
      success: true,
      message: "Loan application approved successfully.",
    });
  } catch (error) {
    console.error("Approve loan error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to approve loan application.",
    });
  }
};


// REJECT LOAN
const rejectLoan = async (req, res) => {
  try {
    const { id } = req.params;

    const [loans] = await db.query(
      `
      SELECT loan_id, status
      FROM loans
      WHERE loan_id = ?
      `,
      [id]
    );

    if (loans.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Loan application not found.",
      });
    }

    if (loans[0].status !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Only pending applications can be rejected.",
      });
    }

    await db.query(
      `
      UPDATE loans
      SET status = 'rejected'
      WHERE loan_id = ?
      `,
      [id]
    );

    res.json({
      success: true,
      message: "Loan application rejected successfully.",
    });
  } catch (error) {
    console.error("Reject loan error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to reject loan application.",
    });
  }
};


// GET ACTIVE LOANS
const getActiveLoans = async (req, res) => {
  try {
    const [loans] = await db.query(`
      SELECT
        l.loan_id,
        l.customer_id,
        l.product_id,
        l.amount,
        l.interest_amount,
        l.total_amount,
        l.balance,
        l.application_date,
        l.approval_date,
        l.due_date,
        l.status,
        lp.product_name,
        lp.interest_rate,
        lp.repayment_period
      FROM loans l
      INNER JOIN loan_products lp
        ON l.product_id = lp.product_id
      WHERE l.status IN ('approved', 'active')
      ORDER BY l.approval_date DESC
    `);

    res.json({
      success: true,
      loans,
    });
  } catch (error) {
    console.error("Get active loans error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load active loans.",
    });
  }
};


// ACTIVATE APPROVED LOAN
const activateLoan = async (req, res) => {
  try {
    const { id } = req.params;

    const [loans] = await db.query(
      `
      SELECT
        loan_id,
        status,
        total_amount
      FROM loans
      WHERE loan_id = ?
      `,
      [id]
    );

    if (loans.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Loan not found.",
      });
    }

    if (loans[0].status !== "approved") {
      return res.status(400).json({
        success: false,
        message: "Only approved loans can be activated.",
      });
    }

    await db.query(
      `
      UPDATE loans
      SET
        status = 'active',
        balance = total_amount
      WHERE loan_id = ?
      `,
      [id]
    );

    res.json({
      success: true,
      message: "Loan activated successfully.",
    });
  } catch (error) {
    console.error("Activate loan error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to activate loan.",
    });
  }
};


// EXPORT CONTROLLERS
module.exports = {
  getLoans,
  getCustomerLoans,
  createLoan,
  approveLoan,
  rejectLoan,
  getActiveLoans,
  activateLoan,
};