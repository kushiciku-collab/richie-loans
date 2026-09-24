const db = require("../config/db");

// GET REPORT SUMMARY
const getReportSummary = async (req, res) => {
  try {
    // Customers
    const [[customerStats]] = await db.query(`
      SELECT COUNT(*) AS total_customers
      FROM customers
    `);

    // Loans
    const [[loanStats]] = await db.query(`
      SELECT
        COUNT(*) AS total_loans,
        COALESCE(SUM(amount), 0) AS total_loan_amount,
        COALESCE(SUM(balance), 0) AS outstanding_balance
      FROM loans
      WHERE status IN ('approved', 'active', 'completed', 'defaulted')
    `);

    // Active loans
    const [[activeLoanStats]] = await db.query(`
      SELECT
        COUNT(*) AS active_loans,
        COALESCE(SUM(balance), 0) AS active_balance
      FROM loans
      WHERE status = 'active'
    `);

    // Repayments
    const [[repaymentStats]] = await db.query(`
      SELECT
        COUNT(*) AS total_repayments,
        COALESCE(SUM(amount), 0) AS total_repaid
      FROM repayments
    `);

    // Savings
    const [[savingsStats]] = await db.query(`
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN transaction_type = 'deposit'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS total_deposits,

        COALESCE(
          SUM(
            CASE
              WHEN transaction_type = 'withdrawal'
              THEN amount
              ELSE 0
            END
          ),
          0
        ) AS total_withdrawals
      FROM savings
    `);

    const savingsBalance =
      Number(savingsStats.total_deposits) -
      Number(savingsStats.total_withdrawals);

    res.json({
      success: true,
      summary: {
        customers: {
          total: Number(customerStats.total_customers),
        },

        loans: {
          total: Number(loanStats.total_loans),
          total_amount: Number(loanStats.total_loan_amount),
          outstanding_balance: Number(
            loanStats.outstanding_balance
          ),
        },

        active_loans: {
          total: Number(activeLoanStats.active_loans),
          balance: Number(activeLoanStats.active_balance),
        },

        repayments: {
          total: Number(repaymentStats.total_repayments),
          amount: Number(repaymentStats.total_repaid),
        },

        savings: {
          deposits: Number(savingsStats.total_deposits),
          withdrawals: Number(
            savingsStats.total_withdrawals
          ),
          balance: savingsBalance,
        },
      },
    });
  } catch (error) {
    console.error("Report summary error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate report summary.",
    });
  }
};


// GET LOAN REPORT
const getLoanReport = async (req, res) => {
  try {
    const [loans] = await db.query(`
      SELECT
        l.loan_id,
        l.customer_id,
        l.product_id,
        lp.product_name,
        l.amount,
        l.interest_amount,
        l.total_amount,
        l.balance,
        l.application_date,
        l.approval_date,
        l.due_date,
        l.status
      FROM loans l
      LEFT JOIN loan_products lp
        ON l.product_id = lp.product_id
      ORDER BY l.created_at DESC
    `);

    res.json({
      success: true,
      loans,
    });
  } catch (error) {
    console.error("Loan report error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate loan report.",
    });
  }
};


// GET REPAYMENT REPORT
const getRepaymentReport = async (req, res) => {
  try {
    const [repayments] = await db.query(`
      SELECT
        r.repayment_id,
        r.loan_id,
        r.customer_id,
        r.amount,
        r.repayment_date,
        r.payment_method,
        r.reference_number,
        r.notes
      FROM repayments r
      ORDER BY r.repayment_date DESC
    `);

    res.json({
      success: true,
      repayments,
    });
  } catch (error) {
    console.error("Repayment report error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate repayment report.",
    });
  }
};


// GET SAVINGS REPORT
const getSavingsReport = async (req, res) => {
  try {
    const [savings] = await db.query(`
      SELECT
        saving_id,
        customer_id,
        amount,
        transaction_type,
        transaction_date,
        reference_number,
        description
      FROM savings
      ORDER BY transaction_date DESC
    `);

    res.json({
      success: true,
      savings,
    });
  } catch (error) {
    console.error("Savings report error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to generate savings report.",
    });
  }
};


module.exports = {
  getReportSummary,
  getLoanReport,
  getRepaymentReport,
  getSavingsReport,
};