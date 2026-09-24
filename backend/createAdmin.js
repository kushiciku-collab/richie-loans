const bcrypt = require("bcryptjs");
const db = require("./config/db");
require("dotenv").config();

const createAdmin = async () => {
  try {
    const fullName = "RICHIE Administrator";
    const email = "admin@richieloans.com";
    const phone = "0700000000";
    const password = "Admin@12345";

    // Check whether the admin already exists
    const [existingUsers] = await db.query(
      "SELECT user_id FROM users WHERE email = ?",
      [email]
    );

    if (existingUsers.length > 0) {
      console.log("Admin account already exists.");
      process.exit(0);
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 12);

    // Create admin account
    const [result] = await db.query(
      `INSERT INTO users
      (full_name, email, phone, password_hash, role, status)
      VALUES (?, ?, ?, ?, 'admin', 'active')`,
      [
        fullName,
        email,
        phone,
        passwordHash,
      ]
    );

    console.log("==========================================");
    console.log("RICHIE LOANS ADMIN ACCOUNT CREATED");
    console.log("==========================================");
    console.log(`User ID: ${result.insertId}`);
    console.log(`Name: ${fullName}`);
    console.log(`Email: ${email}`);
    console.log(`Phone: ${phone}`);
    console.log(`Password: ${password}`);
    console.log("Role: admin");
    console.log("==========================================");

    process.exit(0);
  } catch (error) {
    console.error("Failed to create admin:", error.message);
    process.exit(1);
  }
};

createAdmin();