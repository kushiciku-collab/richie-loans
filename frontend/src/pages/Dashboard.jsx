import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAdminDashboard,
  getCustomerDashboard,
} from "../services/dashboardService";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const savedUser = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        if (!savedUser || !token) {
          navigate("/login");
          return;
        }

        const loggedUser = JSON.parse(savedUser);
        setUser(loggedUser);

        let result;

        if (loggedUser.role === "admin") {
          result = await getAdminDashboard();
        } else {
          result = await getCustomerDashboard();
        }

        setData(result);
      } catch (err) {
        console.error("Dashboard error:", err);

        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        setError(
          err.response && err.response.data
            ? err.response.data.message
            : "Unable to load dashboard."
        );
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <div className="empty-icon">
            <i className="bi bi-arrow-repeat"></i>
          </div>
          <h4>Loading RICHIE LOANS...</h4>
          <p>Please wait while your dashboard loads.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="empty-state">
          <div className="empty-icon">
            <i className="bi bi-exclamation-circle"></i>
          </div>
          <h4>Dashboard Error</h4>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  const stats = data && data.stats ? data.stats : {};
  const isAdmin = user && user.role === "admin";

  return (
    <div className="dashboard-page">

      <div className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">
            OVERVIEW
          </span>

          <h1>
            Welcome back, {user ? user.full_name : "User"}
          </h1>

          <p>
            Here is what's happening with your RICHIE LOANS account today.
          </p>
        </div>

        <button
          className="primary-action"
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          }}
        >
          <i className="bi bi-box-arrow-right"></i>
          Logout
        </button>
      </div>

      <div className="role-badge">
        <i className="bi bi-person-circle"></i>
        {isAdmin ? "Administrator" : "Customer"}
      </div>

      <div className="stats-grid">

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon loans-icon">
              <i className="bi bi-cash-stack"></i>
            </div>

            <span className="stat-label">
              LOANS
            </span>
          </div>

          <h2>
            KSh {Number(stats.total_loans || 0).toLocaleString("en-KE")}
          </h2>

          <p>
            Total loan portfolio
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon repayment-icon">
              <i className="bi bi-arrow-down-circle"></i>
            </div>

            <span className="stat-label">
              REPAYMENTS
            </span>
          </div>

          <h2>
            KSh {Number(stats.total_repayments || 0).toLocaleString("en-KE")}
          </h2>

          <p>
            Total repayments received
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon savings-icon">
              <i className="bi bi-piggy-bank"></i>
            </div>

            <span className="stat-label">
              SAVINGS
            </span>
          </div>

          <h2>
            KSh {Number(stats.total_savings || 0).toLocaleString("en-KE")}
          </h2>

          <p>
            Total customer savings
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <div className="stat-icon customers-icon">
              <i className="bi bi-people"></i>
            </div>

            <span className="stat-label">
              {isAdmin ? "CUSTOMERS" : "ACTIVE LOANS"}
            </span>
          </div>

          <h2>
            {isAdmin
              ? Number(stats.total_customers || 0)
              : Number(stats.active_loans || 0)}
          </h2>

          <p>
            {isAdmin
              ? "Registered customers"
              : "Currently active loans"}
          </p>
        </div>

      </div>

      <div className="mini-summary-grid">

        <div className="mini-summary">
          <div className="mini-icon">
            <i className="bi bi-hourglass-split"></i>
          </div>

          <div>
            <span>Pending Loans</span>

            <strong>
              {Number(stats.pending_loans || 0)}
            </strong>
          </div>
        </div>

        <div className="mini-summary">
          <div className="mini-icon">
            <i className="bi bi-graph-up-arrow"></i>
          </div>

          <div>
            <span>Active Loans</span>

            <strong>
              {Number(stats.active_loans || 0)}
            </strong>
          </div>
        </div>

      </div>

      <section className="dashboard-card">

        <div className="card-header">
          <div>
            <h3>Recent Loan Applications</h3>

            <p>
              Latest loan activity on RICHIE LOANS
            </p>
          </div>
        </div>

        {data &&
        data.recentLoans &&
        data.recentLoans.length > 0 ? (

          <div className="loan-list">

            {data.recentLoans.map((loan) => (
              <div
                className="loan-row"
                key={loan.loan_id}
              >

                <div className="loan-main">

                  <div className="loan-avatar">
                    <i className="bi bi-person"></i>
                  </div>

                  <div>
                    <strong>
                      {isAdmin
                        ? loan.full_name
                        : loan.product_name}
                    </strong>

                    <span>
                      {loan.product_name}
                    </span>
                  </div>

                </div>

                <div className="loan-amount">

                  <strong>
                    KSh {Number(loan.amount || 0).toLocaleString("en-KE")}
                  </strong>

                  <span>
                    {loan.status}
                  </span>

                </div>

              </div>
            ))}

          </div>

        ) : (

          <div className="empty-state">

            <div className="empty-icon">
              <i className="bi bi-file-earmark-text"></i>
            </div>

            <h4>
              No loan applications yet
            </h4>

            <p>
              Loan applications will appear here when customers start applying.
            </p>

          </div>

        )}

      </section>

      <section className="dashboard-card">

        <div className="card-header">
          <div>
            <h3>System Overview</h3>

            <p>
              Current RICHIE LOANS platform status
            </p>
          </div>
        </div>

        <div className="overview-items">

          <div className="overview-item">

            <span className="overview-icon">
              <i className="bi bi-database-check"></i>
            </span>

            <div>
              <strong>Database</strong>
              <span>MySQL database connected</span>
            </div>

            <b className="ready-text">
              Ready
            </b>

          </div>

          <div className="overview-item">

            <span className="overview-icon">
              <i className="bi bi-shield-check"></i>
            </span>

            <div>
              <strong>Security</strong>
              <span>JWT authentication enabled</span>
            </div>

            <b className="ready-text">
              Active
            </b>

          </div>

          <div className="overview-item">

            <span className="overview-icon">
              <i className="bi bi-cloud-check"></i>
            </span>

            <div>
              <strong>API</strong>
              <span>RICHIE LOANS backend services</span>
            </div>

            <b className="ready-text">
              Online
            </b>

          </div>

        </div>

      </section>

    </div>
  );
}

export default Dashboard;