const express = require("express");

const authenticateToken = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const db = require("../config/db");

const router = express.Router();

/* =========================================================
   GET ALL CUSTOMERS
   ADMIN ONLY
========================================================= */

router.get(
  "/",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const [customers] = await db.query(`
        SELECT
          c.customer_id,
          c.user_id,
          u.full_name,
          u.email,
          u.phone,
          u.status AS user_status,
          c.national_id,
          c.date_of_birth,
          c.gender,
          c.address,
          c.occupation,
          c.monthly_income,
          c.next_of_kin_name,
          c.next_of_kin_phone,
          c.status AS customer_status,
          c.created_at
        FROM customers c
        INNER JOIN users u
          ON c.user_id = u.user_id
        WHERE u.role = 'customer'
        ORDER BY c.created_at DESC
      `);

      res.json({
        success: true,
        customers,
      });
    } catch (error) {
      console.error("Get customers error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to retrieve customers.",
      });
    }
  }
);

/* =========================================================
   GET SINGLE CUSTOMER
   ADMIN ONLY
========================================================= */

router.get(
  "/:id",
  authenticateToken,
  authorizeRoles("admin"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const [customers] = await db.query(
        `
        SELECT
          c.customer_id,
          c.user_id,
          u.full_name,
          u.email,
          u.phone,
          u.status AS user_status,
          c.national_id,
          c.date_of_birth,
          c.gender,
          c.address,
          c.occupation,
          c.monthly_income,
          c.next_of_kin_name,
          c.next_of_kin_phone,
          c.status AS customer_status,
          c.created_at,
          c.updated_at
        FROM customers c
        INNER JOIN users u
          ON c.user_id = u.user_id
        WHERE c.customer_id = ?
          AND u.role = 'customer'
        LIMIT 1
        `,
        [id]
      );

      if (customers.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Customer not found.",
        });
      }

      res.json({
        success: true,
        customer: customers[0],
      });
    } catch (error) {
      console.error("Get customer error:", error);

      res.status(500).json({
        success: false,
        message: "Unable to retrieve customer.",
      });
    }
  }
);

module.exports = router;