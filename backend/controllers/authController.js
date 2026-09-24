const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

// ============================================================
// REGISTER USER
// ============================================================

const registerUser = async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      password,
      national_id,
    } = req.body;

    // Basic validation
    if (!full_name || !email || !password || !national_id) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, password and national ID are required.",
      });
    }

    // Check if email already exists
    const [existingEmail] = await db.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existingEmail.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Check if national ID already exists
    const [existingId] = await db.query(
      "SELECT customer_id FROM customers WHERE national_id = ?",
      [national_id]
    );

    if (existingId.length > 0) {
      return res.status(409).json({
        success: false,
        message: "This national ID is already registered.",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create user
    const [userResult] = await db.query(
      `INSERT INTO users
      (full_name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, 'customer')`,
      [full_name, email, phone || null, passwordHash]
    );

    const userId = userResult.insertId;

    // Create customer profile
    await db.query(
      `INSERT INTO customers
      (user_id, national_id)
      VALUES (?, ?)`,
      [userId, national_id]
    );

    res.status(201).json({
      success: true,
      message: "Account created successfully.",
      user: {
        user_id: userId,
        full_name,
        email,
        role: "customer",
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to create account.",
    });
  }
};


// ============================================================
// LOGIN USER
// ============================================================

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user
    const [users] = await db.query(
      `SELECT
        user_id,
        full_name,
        email,
        phone,
        password_hash,
        role,
        status
       FROM users
       WHERE email = ?`,
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = users[0];

    // Check account status
    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "This account is not active.",
      });
    }

    // Compare password
    const passwordMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT
    const token = jwt.sign(
      {
        user_id: user.user_id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1d",
      }
    );

    // Update last login
    await db.query(
      "UPDATE users SET last_login = NOW() WHERE user_id = ?",
      [user.user_id]
    );

    res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to process login.",
    });
  }
};


module.exports = {
  registerUser,
  loginUser,
};