const db = require("../config/db");

const getLoanProducts = async (req, res) => {
  try {
    const [products] = await db.query(`
      SELECT
        product_id,
        product_name,
        description,
        min_amount,
        max_amount,
        interest_rate,
        repayment_period,
        status,
        created_at,
        updated_at
      FROM loan_products
      ORDER BY created_at DESC
    `);

    res.json({
      success: true,
      products,
    });
  } catch (error) {
    console.error("Get loan products error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load loan products.",
    });
  }
};

const createLoanProduct = async (req, res) => {
  try {
    const {
      product_name,
      description,
      min_amount,
      max_amount,
      interest_rate,
      repayment_period,
    } = req.body;

    if (
      !product_name ||
      min_amount === undefined ||
      max_amount === undefined ||
      interest_rate === undefined ||
      !repayment_period
    ) {
      return res.status(400).json({
        success: false,
        message: "All required loan product fields must be provided.",
      });
    }

    if (Number(min_amount) <= 0 || Number(max_amount) <= 0) {
      return res.status(400).json({
        success: false,
        message: "Loan amounts must be greater than zero.",
      });
    }

    if (Number(min_amount) > Number(max_amount)) {
      return res.status(400).json({
        success: false,
        message: "Minimum amount cannot exceed maximum amount.",
      });
    }

    const [result] = await db.query(
      `
      INSERT INTO loan_products
      (
        product_name,
        description,
        min_amount,
        max_amount,
        interest_rate,
        repayment_period,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, 'active')
      `,
      [
        product_name,
        description || null,
        min_amount,
        max_amount,
        interest_rate,
        repayment_period,
      ]
    );

    res.status(201).json({
      success: true,
      message: "Loan product created successfully.",
      product_id: result.insertId,
    });
  } catch (error) {
    console.error("Create loan product error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create loan product.",
    });
  }
};

const updateLoanProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      product_name,
      description,
      min_amount,
      max_amount,
      interest_rate,
      repayment_period,
      status,
    } = req.body;

    if (
      !product_name ||
      min_amount === undefined ||
      max_amount === undefined ||
      interest_rate === undefined ||
      !repayment_period ||
      !status
    ) {
      return res.status(400).json({
        success: false,
        message: "All required loan product fields must be provided.",
      });
    }

    if (Number(min_amount) > Number(max_amount)) {
      return res.status(400).json({
        success: false,
        message: "Minimum amount cannot exceed maximum amount.",
      });
    }

    const [result] = await db.query(
      `
      UPDATE loan_products
      SET
        product_name = ?,
        description = ?,
        min_amount = ?,
        max_amount = ?,
        interest_rate = ?,
        repayment_period = ?,
        status = ?
      WHERE product_id = ?
      `,
      [
        product_name,
        description || null,
        min_amount,
        max_amount,
        interest_rate,
        repayment_period,
        status,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Loan product not found.",
      });
    }

    res.json({
      success: true,
      message: "Loan product updated successfully.",
    });
  } catch (error) {
    console.error("Update loan product error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update loan product.",
    });
  }
};

const deleteLoanProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      "DELETE FROM loan_products WHERE product_id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Loan product not found.",
      });
    }

    res.json({
      success: true,
      message: "Loan product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete loan product error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to delete loan product.",
    });
  }
};

module.exports = {
  getLoanProducts,
  createLoanProduct,
  updateLoanProduct,
  deleteLoanProduct,
};