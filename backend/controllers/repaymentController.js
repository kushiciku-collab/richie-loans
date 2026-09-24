const db = require("../config/db");

// GET ALL REPAYMENTS
const getRepayments = async (req, res) => {
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
        r.notes,
        l.total_amount,
        l.balance,
        l.status,
        lp.product_name
      FROM repayments r
      INNER JOIN loans l
        ON r.loan_id = l.loan_id
      INNER JOIN loan_products lp
        ON l.product_id = lp.product_id
      ORDER BY r.repayment_date DESC
    `);

    res.json({
      success: true,
      repayments,
    });
  } catch (error) {
    console.error("Get repayments error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load repayments.",
    });
  }
};


// GET REPAYMENTS FOR ONE LOAN
const getLoanRepayments = async (req, res) => {
  try {
    const { loanId } = req.params;

    const [repayments] = await db.query(
      `
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
      WHERE r.loan_id = ?
      ORDER BY r.repayment_date DESC
      `,
      [loanId]
    );

    res.json({
      success: true,
      repayments,
    });
  } catch (error) {
    console.error("Get loan repayments error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load loan repayments.",
    });
  }
};


// RECORD REPAYMENT
const createRepayment = async (req, res) => {
  const connection = await db.getConnection();

  try {
    const {
      loan_id,
      amount,
      payment_method,
      reference_number,
      notes,
    } = req.body;

    if (!loan_id || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Loan and repayment amount are required.",
      });
    }

    const repaymentAmount = Number(amount);

    if (
      !Number.isFinite(repaymentAmount) ||
      repaymentAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Repayment amount must be greater than zero.",
      });
    }

    await connection.beginTransaction();

    // Get loan
    const [loans] = await connection.query(
      `
      SELECT
        loan_id,
        customer_id,
        balance,
        status
      FROM loans
      WHERE loan_id = ?
      FOR UPDATE
      `,
      [loan_id]
    );

    if (loans.length === 0) {
      await connection.rollback();

      return res.status(404).json({
        success: false,
        message: "Loan not found.",
      });
    }

    const loan = loans[0];

    // Only active loans can receive repayments
    if (loan.status !== "active") {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: "Only active loans can receive repayments.",
      });
    }

    const currentBalance = Number(loan.balance);

    // Prevent overpayment
    if (repaymentAmount > currentBalance) {
      await connection.rollback();

      return res.status(400).json({
        success: false,
        message: `Repayment cannot exceed the current balance of ${currentBalance.toFixed(
          2
        )}.`,
      });
    }

    const newBalance = currentBalance - repaymentAmount;

    // Record repayment
    const [result] = await connection.query(
      `
      INSERT INTO repayments
      (
        loan_id,
        customer_id,
        amount,
        payment_method,
        reference_number,
        notes
      )
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        loan.loan_id,
        loan.customer_id,
        repaymentAmount,
        payment_method || "cash",
        reference_number || null,
        notes || null,
      ]
    );

    // Complete loan when balance reaches zero
    const newStatus =
      newBalance === 0 ? "completed" : "active";

    await connection.query(
      `
      UPDATE loans
      SET
        balance = ?,
        status = ?
      WHERE loan_id = ?
      `,
      [
        newBalance,
        newStatus,
        loan.loan_id,
      ]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      message:
        newStatus === "completed"
          ? "Repayment recorded. Loan completed successfully."
          : "Repayment recorded successfully.",
      repayment_id: result.insertId,
      loan_id: loan.loan_id,
      amount_paid: repaymentAmount,
      remaining_balance: newBalance,
      loan_status: newStatus,
    });
  } catch (error) {
    await connection.rollback();

    console.error("Create repayment error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to record repayment.",
    });
  } finally {
    connection.release();
  }
};


module.exports = {
  getRepayments,
  getLoanRepayments,
  createRepayment,
};