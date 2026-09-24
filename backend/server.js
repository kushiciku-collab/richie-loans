
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const protectedRoutes = require("./routes/protectedRoutes");
const adminRoutes = require("./routes/adminRoutes");
const customerRoutes = require("./routes/customerRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const loanProductRoutes = require("./routes/loanProductRoutes");
const loanRoutes = require("./routes/loanRoutes");
const repaymentRoutes = require("./routes/repaymentRoutes");
const savingsRoutes = require("./routes/savingsRoutes");

const app = express();

const PORT = process.env.PORT || 5000;

/* =========================================================
   MIDDLEWARE
========================================================= */

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================================================
   API ROUTES
========================================================= */

app.use("/api/auth", authRoutes);

app.use("/api/protected", protectedRoutes);

app.use("/api/admin", adminRoutes);

app.use("/api/customer", customerRoutes);

app.use("/api/dashboard", dashboardRoutes);

app.use("/api/loan-products", loanProductRoutes);

app.use("/api/loans", loanRoutes);

app.use("/api/repayments", repaymentRoutes);

app.use("/api/savings", savingsRoutes);

/* =========================================================
   API HOME
========================================================= */

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RICHIE LOANS API is running successfully",
  });
});

/* =========================================================
   DATABASE TEST
========================================================= */

app.get("/api/test-db", async (req, res) => {
  try {
    const [result] = await db.query("SELECT 1 AS test");

    res.json({
      success: true,
      message: "MySQL database connected successfully",
      result,
    });
  } catch (error) {
    console.error("Database error:", error.message);

    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: error.message,
      code: error.code,
    });
  }
});

/* =========================================================
   404 HANDLER
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found.",
  });
});

/* =========================================================
   START SERVER
========================================================= */

const server = app.listen(PORT, () => {
  console.log("");
  console.log("==============================================");
  console.log("       RICHIE LOANS BACKEND SERVER");
  console.log("==============================================");
  console.log(`Server: http://localhost:${PORT}`);
  console.log("Status: ONLINE");
  console.log("==============================================");
  console.log("");
});

server.on("error", (error) => {
  console.error("SERVER ERROR:", error.message);
});

