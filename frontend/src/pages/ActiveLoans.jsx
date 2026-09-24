import { useEffect, useState } from "react";
import "./ActiveLoans.css";

const API_URL = "http://localhost:5000/api/loans";

function ActiveLoans() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activating, setActivating] = useState(null);

  const fetchLoans = async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/active`);
      const data = await response.json();

      if (data.success) {
        setLoans(data.loans);
      }
    } catch (error) {
      console.error("Error loading active loans:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  const handleActivate = async (loanId) => {
    try {
      setActivating(loanId);

      const response = await fetch(
        `${API_URL}/${loanId}/activate`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        alert("Loan activated successfully.");
        fetchLoans();
      } else {
        alert(data.message || "Unable to activate loan.");
      }
    } catch (error) {
      console.error("Activate loan error:", error);
      alert("Unable to activate loan.");
    } finally {
      setActivating(null);
    }
  };

  const filteredLoans = loans.filter((loan) => {
    const searchValue = search.toLowerCase();

    const matchesSearch =
      String(loan.loan_id).includes(searchValue) ||
      String(loan.customer_id).includes(searchValue) ||
      loan.product_name?.toLowerCase().includes(searchValue);

    const matchesStatus =
      statusFilter === "all" ||
      loan.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalLoans = loans.length;

  const approvedLoans = loans.filter(
    (loan) => loan.status === "approved"
  ).length;

  const activeLoans = loans.filter(
    (loan) => loan.status === "active"
  ).length;

  const totalBalance = loans.reduce(
    (total, loan) => total + Number(loan.balance || 0),
    0
  );

  const formatMoney = (amount) => {
    return `KSh ${Number(amount || 0).toLocaleString(
      "en-KE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-KE",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="active-loans-page">

      <div className="active-loans-header">
        <div>
          <span className="page-label">
            LOAN MANAGEMENT
          </span>

          <h1>Active Loans</h1>

          <p>
            Monitor approved and active customer loans,
            balances and repayment progress.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={fetchLoans}
        >
          <i className="bi bi-arrow-clockwise"></i>
          Refresh
        </button>
      </div>

      <div className="active-loan-stats">

        <div className="loan-stat-card">
          <div className="loan-stat-icon">
            <i className="bi bi-wallet2"></i>
          </div>

          <div>
            <span>Total Loans</span>
            <strong>{totalLoans}</strong>
          </div>
        </div>

        <div className="loan-stat-card">
          <div className="loan-stat-icon approved">
            <i className="bi bi-check-circle"></i>
          </div>

          <div>
            <span>Approved</span>
            <strong>{approvedLoans}</strong>
          </div>
        </div>

        <div className="loan-stat-card">
          <div className="loan-stat-icon active">
            <i className="bi bi-activity"></i>
          </div>

          <div>
            <span>Active</span>
            <strong>{activeLoans}</strong>
          </div>
        </div>

        <div className="loan-stat-card">
          <div className="loan-stat-icon balance">
            <i className="bi bi-cash-stack"></i>
          </div>

          <div>
            <span>Total Balance</span>
            <strong>{formatMoney(totalBalance)}</strong>
          </div>
        </div>

      </div>

      <div className="active-loans-panel">

        <div className="panel-toolbar">

          <div className="loan-search">
            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Search loan ID, customer ID or product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
          >
            <option value="all">All Statuses</option>
            <option value="approved">Approved</option>
            <option value="active">Active</option>
          </select>

        </div>

        {loading ? (
          <div className="empty-state">
            <div className="spinner"></div>
            <p>Loading active loans...</p>
          </div>
        ) : filteredLoans.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="bi bi-wallet2"></i>
            </div>

            <h3>No Active Loans</h3>

            <p>
              There are currently no approved or active
              loans to display.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">

            <table className="active-loans-table">

              <thead>
                <tr>
                  <th>Loan ID</th>
                  <th>Customer</th>
                  <th>Loan Product</th>
                  <th>Amount</th>
                  <th>Total Payable</th>
                  <th>Balance</th>
                  <th>Status</th>
                  <th>Approved</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredLoans.map((loan) => (
                  <tr key={loan.loan_id}>

                    <td>
                      <span className="loan-id">
                        #{loan.loan_id}
                      </span>
                    </td>

                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {loan.customer_id}
                        </div>

                        <div>
                          <strong>
                            Customer {loan.customer_id}
                          </strong>

                          <small>
                            ID: {loan.customer_id}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong>
                        {loan.product_name}
                      </strong>

                      <small className="table-subtext">
                        {loan.interest_rate}% interest
                      </small>
                    </td>

                    <td>
                      {formatMoney(loan.amount)}
                    </td>

                    <td>
                      {formatMoney(loan.total_amount)}
                    </td>

                    <td>
                      <strong className="balance-value">
                        {formatMoney(loan.balance)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${loan.status}`}
                      >
                        {loan.status}
                      </span>
                    </td>

                    <td>
                      {formatDate(loan.approval_date)}
                    </td>

                    <td>
                      {loan.status === "approved" ? (
                        <button
                          className="activate-button"
                          onClick={() =>
                            handleActivate(loan.loan_id)
                          }
                          disabled={
                            activating === loan.loan_id
                          }
                        >
                          {activating === loan.loan_id ? (
                            <>
                              <span className="button-spinner"></span>
                              Activating...
                            </>
                          ) : (
                            <>
                              <i className="bi bi-play-circle"></i>
                              Activate
                            </>
                          )}
                        </button>
                      ) : (
                        <span className="active-label">
                          <i className="bi bi-check-circle-fill"></i>
                          Active
                        </span>
                      )}
                    </td>

                  </tr>
                ))}

              </tbody>

            </table>

          </div>
        )}

      </div>

    </div>
  );
}

export default ActiveLoans;