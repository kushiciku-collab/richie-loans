const db = require("../config/db");

/*
=========================================================
ADMIN DASHBOARD
=========================================================
*/
const getAdminDashboard = async (req, res) => {
  try {
    // TOTAL CUSTOMERS
    const [customerResult] = await db.query(`
      SELECT COUNT(*) AS total_customers
      FROM customers
    `);

    // TOTAL LOANS
    const [loanResult] = await db.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_loans
      FROM loans
      WHERE status IN (
        'approved',
        'active',
        'completed',
        'defaulted'
      )
    `);

    // TOTAL REPAYMENTS
    const [repaymentResult] = await db.query(`
      SELECT COALESCE(SUM(amount), 0) AS total_repayments
      FROM loan_repayments
    `);

    // TOTAL SAVINGS
    const [savingsResult] = await db.query(`
      SELECT COALESCE(
        SUM(
          CASE
            WHEN transaction_type = 'deposit' THEN amount
            WHEN transaction_type = 'withdrawal' THEN -amount
            ELSE 0
          END
        ),
        0
      ) AS total_savings
      FROM savings
    `);

    // PENDING LOANS
    const [pendingResult] = await db.query(`
      SELECT COUNT(*) AS pending_loans
      FROM loans
      WHERE status = 'pending'
    `);

    // ACTIVE LOANS
    const [activeResult] = await db.query(`
      SELECT COUNT(*) AS active_loans
      FROM loans
      WHERE status = 'active'
    `);

    // RECENT LOANS
    const [recentLoans] = await db.query(`
      SELECT
        l.loan_id,
        l.amount,
        l.interest_amount,
        l.total_amount,
        l.balance,
        l.status,
        l.application_date,
        c.customer_id,
        u.full_name,
        u.email,
        lp.product_name
      FROM loans l
      INNER JOIN customers c
        ON l.customer_id = c.customer_id
      INNER JOIN users u
        ON c.user_id = u.user_id
      INNER JOIN loan_products lp
        ON l.product_id = lp.product_id
      ORDER BY l.application_date DESC
      LIMIT 6
    `);

    res.json({
      success: true,

      stats: {
        total_customers: Number(
          customerResult[0].total_customers
        ),

        total_loans: Number(
          loanResult[0].total_loans
        ),

        total_repayments: Number(
          repaymentResult[0].total_repayments
        ),

        total_savings: Number(
          savingsResult[0].total_savings
        ),

        pending_loans: Number(
          pendingResult[0].pending_loans
        ),

        active_loans: Number(
          activeResult[0].active_loans
        ),
      },

      recentLoans,
    });

  } catch (error) {
    console.error("Admin dashboard error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load admin dashboard.",
    });
  }
};


/*
=========================================================
CUSTOMER DASHBOARD
=========================================================
*/
const getCustomerDashboard = async (req, res) => {
  try {
    const userId = req.user.user_id;

    const [customerResult] = await db.query(
      `
      SELECT
        customer_id,
        national_id,
        status
      FROM customers
      WHERE user_id = ?
      LIMIT 1
      `,
      [userId]
    );

    if (customerResult.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer profile not found.",
      });
    }

    const customer = customerResult[0];
    const customerId = customer.customer_id;

    // CUSTOMER LOANS
    const [loanResult] = await db.query(
      `
      SELECT COALESCE(SUM(amount), 0) AS total_loans
      FROM loans
      WHERE customer_id = ?
      AND status IN (
        'approved',
        'active',
        'completed',
        'defaulted'
      )
      `,
      [customerId]
    );

    // CUSTOMER REPAYMENTS
    const [repaymentResult] = await db.query(
      `
      SELECT COALESCE(SUM(lr.amount), 0) AS total_repayments
      FROM loan_repayments lr
      INNER JOIN loans l
        ON lr.loan_id = l.loan_id
      WHERE l.customer_id = ?
      `,
      [customerId]
    );

    // CUSTOMER SAVINGS
    const [savingsResult] = await db.query(
      `
      SELECT COALESCE(
        SUM(
          CASE
            WHEN transaction_type = 'deposit' THEN amount
            WHEN transaction_type = 'withdrawal' THEN -amount
            ELSE 0
          END
        ),
        0
      ) AS total_savings
      FROM savings
      WHERE customer_id = ?
      `,
      [customerId]
    );

    // NUMBER OF LOANS
    const [loanCountResult] = await db.query(
      `
      SELECT COUNT(*) AS loan_count
      FROM loans
      WHERE customer_id = ?
      `,
      [customerId]
    );

    // ACTIVE LOANS
    const [activeLoanResult] = await db.query(
      `
      SELECT COUNT(*) AS active_loans
      FROM loans
      WHERE customer_id = ?
      AND status = 'active'
      `,
      [customerId]
    );

    // RECENT LOANS
    const [recentLoans] = await db.query(
      `
      SELECT
        l.loan_id,
        l.amount,
        l.interest_amount,
        l.total_amount,
        l.balance,
        l.status,
        l.application_date,
        l.due_date,
        lp.product_name
      FROM loans l
      INNER JOIN loan_products lp
        ON l.product_id = lp.product_id
      WHERE l.customer_id = ?
      ORDER BY l.application_date DESC
      LIMIT 6
      `,
      [customerId]
    );

    res.json({
      success: true,

      customer: {
        customer_id: customer.customer_id,
        national_id: customer.national_id,
        status: customer.status,
      },

      stats: {
        total_loans: Number(
          loanResult[0].total_loans
        ),

        total_repayments: Number(
          repaymentResult[0].total_repayments
        ),

        total_savings: Number(
          savingsResult[0].total_savings
        ),

        loan_count: Number(
          loanCountResult[0].loan_count
        ),

        active_loans: Number(
          activeLoanResult[0].active_loans
        ),
      },

      recentLoans,
    });

  } catch (error) {
    console.error(
      "Customer dashboard error:",
      error
    );

    res.status(500).json({
      success: false,
      message: "Unable to load customer dashboard.",
    });
  }
};


module.exports = {
  getAdminDashboard,
  getCustomerDashboard,
};