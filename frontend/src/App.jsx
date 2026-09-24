
import { useState } from "react";
import "./App.css";

function App() {
  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });

    setMenuOpen(false);
  };

  return (
    <div className="richie-app">

      {/* =====================================================
          NAVIGATION
      ===================================================== */}
      <header className="navbar">
        <div className="container nav-container">

          <button
            className="brand"
            onClick={() => scrollToSection("home")}
          >
            <span className="brand-icon">R</span>
            <span className="brand-text">RICHIE LOANS</span>
          </button>

          <button
            className="mobile-menu-button"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle navigation"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>

            <button onClick={() => scrollToSection("features")}>
              Features
            </button>

            <button onClick={() => scrollToSection("services")}>
              Services
            </button>

            <button onClick={() => scrollToSection("how-it-works")}>
              How It Works
            </button>

            <a href="/login">
              Login
            </a>

            <a href="/register" className="nav-register">
              Register
            </a>

          </nav>

        </div>
      </header>


      {/* =====================================================
          HERO
      ===================================================== */}
      <main>

        <section className="hero" id="home">

          <div className="container hero-container">

            <div className="hero-content">

              <div className="eyebrow">
                <span className="eyebrow-dot"></span>
                SMARTER FINANCIAL MANAGEMENT
              </div>

              <h1>
                Your money.
                <span>Your future.</span>
                <strong>Your RICHIE.</strong>
              </h1>

              <p className="hero-description">
                Save smarter, access flexible loans and manage
                your financial journey from one simple and secure
                RICHIE LOANS account.
              </p>

              <div className="hero-actions">

                <a
                  href="/register"
                  className="primary-button"
                >
                  Create Your Account
                  <span>→</span>
                </a>

                <a
                  href="/login"
                  className="secondary-button"
                >
                  Login
                </a>

              </div>

              <div className="hero-trust">

                <div className="trust-item">
                  <span className="trust-icon">✓</span>
                  Secure & Private
                </div>

                <div className="trust-item">
                  <span className="trust-icon">✓</span>
                  Easy to Use
                </div>

                <div className="trust-item">
                  <span className="trust-icon">✓</span>
                  Anytime Access
                </div>

              </div>

            </div>


            {/* =================================================
                FINANCIAL DASHBOARD PREVIEW
            ================================================= */}
            <div className="hero-visual">

              <div className="floating-card floating-top">

                <div className="mini-icon">
                  ↗
                </div>

                <div>
                  <small>Loan Growth</small>
                  <strong>+18.6%</strong>
                </div>

              </div>


              <div className="finance-card">

                <div className="finance-card-header">

                  <div>
                    <span>Total Savings</span>
                    <h3>KSh 45,000.00</h3>
                  </div>

                  <div className="card-menu">
                    •••
                  </div>

                </div>


                <div className="balance-chart">

                  <div className="chart-grid"></div>

                  <svg
                    viewBox="0 0 500 160"
                    preserveAspectRatio="none"
                  >

                    <defs>

                      <linearGradient
                        id="greenChart"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >

                        <stop
                          offset="0%"
                          stopColor="#10b981"
                          stopOpacity="0.35"
                        />

                        <stop
                          offset="100%"
                          stopColor="#10b981"
                          stopOpacity="0"
                        />

                      </linearGradient>

                    </defs>


                    <path
                      d="M0 125 C55 105, 65 115, 105 95 C145 75, 160 110, 205 78 C250 46, 280 95, 315 65 C350 35, 375 58, 410 38 C445 18, 465 35, 500 10 L500 160 L0 160 Z"
                      fill="url(#greenChart)"
                    />


                    <path
                      d="M0 125 C55 105, 65 115, 105 95 C145 75, 160 110, 205 78 C250 46, 280 95, 315 65 C350 35, 375 58, 410 38 C445 18, 465 35, 500 10"
                      fill="none"
                      stroke="#059669"
                      strokeWidth="4"
                      strokeLinecap="round"
                    />

                  </svg>

                </div>


                <div className="chart-labels">

                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>May</span>
                  <span>Jun</span>

                </div>


                <div className="financial-stats">

                  <div className="financial-stat">

                    <div className="stat-icon loan">
                      K
                    </div>

                    <div>
                      <small>Available Loan</small>
                      <strong>KSh 25,000</strong>
                    </div>

                  </div>


                  <div className="financial-stat">

                    <div className="stat-icon active">
                      ✓
                    </div>

                    <div>
                      <small>Active Loan</small>
                      <strong>KSh 10,500</strong>
                    </div>

                  </div>

                </div>

              </div>


              <div className="floating-card floating-bottom">

                <div className="success-icon">
                  ✓
                </div>

                <div>
                  <small>Payment received</small>
                  <strong>KSh 2,500</strong>
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            STATISTICS
        ===================================================== */}
        <section className="stats-section">

          <div className="container stats-grid">

            <div className="stat-box">
              <strong>24/7</strong>
              <span>Account Access</span>
            </div>

            <div className="stat-box">
              <strong>100%</strong>
              <span>Digital Management</span>
            </div>

            <div className="stat-box">
              <strong>4+</strong>
              <span>Core Services</span>
            </div>

            <div className="stat-box">
              <strong>Secure</strong>
              <span>Financial Platform</span>
            </div>

          </div>

        </section>


        {/* =====================================================
            FEATURES
        ===================================================== */}
        <section
          className="features-section"
          id="features"
        >

          <div className="container">

            <div className="section-heading">

              <span className="section-label">
                EVERYTHING YOU NEED
              </span>

              <h2>
                Your finances,
                <span>simplified.</span>
              </h2>

              <p>
                Powerful financial tools designed to help you
                save, borrow, repay and stay in control.
              </p>

            </div>


            <div className="features-grid">

              <div className="feature-card feature-savings">

                <div className="feature-icon">
                  ◆
                </div>

                <h3>Smart Savings</h3>

                <p>
                  Build your savings consistently and monitor
                  your progress from your personal account.
                </p>

                <div className="feature-link">
                  Start saving →
                </div>

              </div>


              <div className="feature-card feature-loans">

                <div className="feature-icon">
                  ↗
                </div>

                <h3>Flexible Loans</h3>

                <p>
                  Apply for suitable loan products and manage
                  your borrowing directly from your account.
                </p>

                <div className="feature-link">
                  Explore loans →
                </div>

              </div>


              <div className="feature-card feature-security">

                <div className="feature-icon">
                  ✓
                </div>

                <h3>Secure Transactions</h3>

                <p>
                  Keep your financial information protected
                  with secure account and transaction practices.
                </p>

                <div className="feature-link">
                  Your security →
                </div>

              </div>


              <div className="feature-card feature-repayments">

                <div className="feature-icon">
                  ↻
                </div>

                <h3>Easy Repayments</h3>

                <p>
                  Track your repayment progress, outstanding
                  balances and payment history with ease.
                </p>

                <div className="feature-link">
                  Manage payments →
                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            SERVICES
        ===================================================== */}
        <section
          className="services-section"
          id="services"
        >

          <div className="container services-layout">

            <div className="services-copy">

              <span className="section-label">
                ONE PLATFORM
              </span>

              <h2>
                Everything for your
                <span>financial journey.</span>
              </h2>

              <p>
                RICHIE LOANS brings the essential tools you need
                into one convenient platform, helping you manage
                your money without unnecessary complexity.
              </p>

            </div>


            <div className="services-list">

              <div className="service-item">

                <span className="service-number">
                  01
                </span>

                <h3>Loan Management</h3>

                <p>
                  View loan details, balances and repayment
                  progress from your account.
                </p>

              </div>


              <div className="service-item">

                <span className="service-number">
                  02
                </span>

                <h3>Savings Tracking</h3>

                <p>
                  Monitor your savings and understand how
                  your balance grows over time.
                </p>

              </div>


              <div className="service-item">

                <span className="service-number">
                  03
                </span>

                <h3>Payment History</h3>

                <p>
                  Keep a clear record of your financial
                  transactions and repayments.
                </p>

              </div>


              <div className="service-item">

                <span className="service-number">
                  04
                </span>

                <h3>Personal Dashboard</h3>

                <p>
                  Access your important financial information
                  from one organized dashboard.
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            HOW IT WORKS
        ===================================================== */}
        <section
          className="how-section"
          id="how-it-works"
        >

          <div className="container">

            <div className="section-heading">

              <span className="section-label">
                HOW IT WORKS
              </span>

              <h2>
                Your financial journey
                <span>starts here.</span>
              </h2>

              <p>
                Getting started with RICHIE LOANS is simple.
              </p>

            </div>


            <div className="steps">

              <div className="step">

                <div className="step-number">
                  01
                </div>

                <div className="step-content">

                  <h3>Create your account</h3>

                  <p>
                    Register your RICHIE LOANS account and
                    create your secure login credentials.
                  </p>

                </div>

              </div>


              <div className="step">

                <div className="step-number">
                  02
                </div>

                <div className="step-content">

                  <h3>Build your savings</h3>

                  <p>
                    Manage your savings and establish your
                    financial profile over time.
                  </p>

                </div>

              </div>


              <div className="step">

                <div className="step-number">
                  03
                </div>

                <div className="step-content">

                  <h3>Apply for a loan</h3>

                  <p>
                    Select a suitable loan product and
                    submit your application through your account.
                  </p>

                </div>

              </div>


              <div className="step">

                <div className="step-number">
                  04
                </div>

                <div className="step-content">

                  <h3>Manage your finances</h3>

                  <p>
                    Track savings, loans, repayments and
                    transactions from your dashboard.
                  </p>

                </div>

              </div>

            </div>

          </div>

        </section>


        {/* =====================================================
            CTA
        ===================================================== */}
        <section className="cta-section">

          <div className="container">

            <div className="cta-card">

              <div className="cta-glow"></div>

              <div className="cta-content">

                <span className="section-label">
                  RICHIE LOANS
                </span>

                <h2>
                  Ready to take control
                  <span>of your money?</span>
                </h2>

                <p>
                  Create your account and begin managing
                  your savings, loans and repayments from
                  one convenient platform.
                </p>

                <a
                  href="/register"
                  className="cta-button"
                >
                  Get Started
                  <span>→</span>
                </a>

              </div>

            </div>

          </div>

        </section>

      </main>


      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="footer">

        <div className="container footer-container">

          <div className="footer-brand">

            <div className="brand footer-logo">

              <span className="brand-icon">
                R
              </span>

              <span className="brand-text">
                RICHIE LOANS
              </span>

            </div>

            <p>
              Your money. Your future. Your RICHIE LOANS.
            </p>

          </div>


          <div className="footer-links">

            <div>

              <h4>Platform</h4>

              <button
                onClick={() => scrollToSection("features")}
              >
                Features
              </button>

              <button
                onClick={() => scrollToSection("services")}
              >
                Services
              </button>

              <button
                onClick={() => scrollToSection("how-it-works")}
              >
                How It Works
              </button>

            </div>


            <div>

              <h4>Account</h4>

              <a href="/login">
                Login
              </a>

              <a href="/register">
                Register
              </a>

            </div>


            <div>

              <h4>Support</h4>

              <a href="mailto:support@richieloans.com">
                Contact Us
              </a>

              <span>
                Help Centre
              </span>

            </div>

          </div>

        </div>


        <div className="footer-bottom">

          <div className="container">

            <p>
              © 2026 RICHIE LOANS. All rights reserved.
            </p>

            <div>
              <span>Privacy</span>
              <span>Terms</span>
              <span>Security</span>
            </div>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default App;
