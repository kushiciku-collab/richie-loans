
const db = require("../config/db");

// GET ALL SAVINGS TRANSACTIONS
const getSavings = async (req, res) => {
  try {
    const [savings] = await db.query(`
      SELECT
        s.saving_id,
        s.customer_id,
        s.amount,
        s.transaction_type,
        s.transaction_date,
        s.reference_number,
        s.description
      FROM savings s
      ORDER BY s.transaction_date DESC
    `);

    res.json({
      success: true,
      savings,
    });
  } catch (error) {
    console.error("Get savings error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load savings.",
    });
  }
};


// GET SAVINGS FOR ONE CUSTOMER
const getCustomerSavings = async (req, res) => {
  try {
    const { customerId } = req.params;

    const [savings] = await db.query(
      `
      SELECT
        saving_id,
        customer_id,
        amount,
        transaction_type,
        transaction_date,
        reference_number,
        description
      FROM savings
      WHERE customer_id = ?
      ORDER BY transaction_date DESC
      `,
      [customerId]
    );

    res.json({
      success: true,
      savings,
    });
  } catch (error) {
    console.error("Get customer savings error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load customer savings.",
    });
  }
};


// RECORD SAVINGS TRANSACTION
const createSaving = async (req, res) => {
  try {
    const {
      customer_id,
      amount,
      transaction_type,
      reference_number,
      description,
    } = req.body;

    if (
      !customer_id ||
      amount === undefined ||
      !transaction_type
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Customer, amount and transaction type are required.",
      });
    }

    const savingAmount = Number(amount);

    if (
      !Number.isFinite(savingAmount) ||
      savingAmount <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Savings amount must be greater than zero.",
      });
    }

    if (
      transaction_type !== "deposit" &&
      transaction_type !== "withdrawal"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Transaction type must be deposit or withdrawal.",
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

    // Calculate current customer savings
    const [totals] = await db.query(
      `
      SELECT
        COALESCE(
          SUM(
            CASE
              WHEN transaction_type = 'deposit'
              THEN amount
              ELSE -amount
            END
          ),
          0
        ) AS balance
      FROM savings
      WHERE customer_id = ?
      `,
      [customer_id]
    );

    const currentBalance = Number(totals[0].balance || 0);

    // Prevent withdrawal beyond savings balance
    if (
      transaction_type === "withdrawal" &&
      savingAmount > currentBalance
    ) {
      return res.status(400).json({
        success: false,
        message: `Withdrawal cannot exceed the current savings balance of ${currentBalance.toFixed(
          2
        )}.`,
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO savings
      (
        customer_id,
        amount,
        transaction_type,
        reference_number,
        description
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        customer_id,
        savingAmount,
        transaction_type,
        reference_number || null,
        description || null,
      ]
    );

    const newBalance =
      transaction_type === "deposit"
        ? currentBalance + savingAmount
        : currentBalance - savingAmount;

    res.status(201).json({
      success: true,
      message:
        transaction_type === "deposit"
          ? "Savings deposit recorded successfully."
          : "Savings withdrawal recorded successfully.",
      saving_id: result.insertId,
      customer_id,
      amount: savingAmount,
      transaction_type,
      balance: newBalance,
    });
  } catch (error) {
    console.error("Create saving error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to record savings transaction.",
    });
  }
};


module.exports = {
  getSavings,
  getCustomerSavings,
  createSaving,
};
