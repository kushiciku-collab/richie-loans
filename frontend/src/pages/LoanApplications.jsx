import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./LoanApplications.css";

const API_URL = "http://localhost:5000/api";

function LoanApplications() {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const loadLoans = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/loans`);

      if (response.data.success) {
        setLoans(response.data.loans || []);
      }
    } catch (error) {
      console.error("Load loans error:", error);

      setMessage("Unable to load loan applications.");
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, []);

  const handleApprove = async (loanId) => {
    if (!window.confirm("Are you sure you want to approve this loan application?")) {
      return;
    }

    try {
      setActionLoading(loanId);

      const response = await axios.put(
        `${API_URL}/loans/${loanId}/approve`
      );

      if (response.data.success) {
        setMessage("Loan application approved successfully.");
        setMessageType("success");

        await loadLoans();
      }
    } catch (error) {
      console.error("Approve loan error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to approve loan application."
      );

      setMessageType("error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (loanId) => {
    if (!window.confirm("Are you sure you want to reject this loan application?")) {
      return;
    }

    try {
      setActionLoading(loanId);

      const response = await axios.put(
        `${API_URL}/loans/${loanId}/reject`
      );

      if (response.data.success) {
        setMessage("Loan application rejected successfully.");
        setMessageType("success");

        await loadLoans();
      }
    } catch (error) {
      console.error("Reject loan error:", error);

      setMessage(
        error.response?.data?.message ||
          "Unable to reject loan application."
      );

      setMessageType("error");
    } finally {
      setActionLoading(null);
    }
  };

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const searchValue = search.toLowerCase().trim();

      const matchesSearch =
        !searchValue ||
        String(loan.loan_id).includes(searchValue) ||
        String(loan.customer_id).includes(searchValue) ||
        loan.product_name?.toLowerCase().includes(searchValue);

      const matchesStatus =
        statusFilter === "all" ||
        loan.status?.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [loans, search, statusFilter]);

  const statistics = useMemo(() => {
    return {
      total: loans.length,
      pending: loans.filter((loan) => loan.status === "pending").length,
      approved: loans.filter((loan) => loan.status === "approved").length,
      rejected: loans.filter((loan) => loan.status === "rejected").length,
    };
  }, [loans]);

  const formatCurrency = (amount) => {
    return `KSh ${Number(amount || 0).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";

      case "approved":
        return "status-approved";

      case "rejected":
        return "status-rejected";

      case "active":
        return "status-active";

      case "completed":
        return "status-completed";

      case "defaulted":
        return "status-defaulted";

      default:
        return "";
    }
  };

  return (
    <div className="loan-applications-page">

      {/* HEADER */}
      <div className="applications-header">

        <div>
          <span className="page-label">LOAN MANAGEMENT</span>

          <h1>Loan Applications</h1>

          <p>
            Review, approve and manage customer loan applications.
          </p>
        </div>

        <button
          className="refresh-button"
          onClick={loadLoans}
          disabled={loading}
        >
          <span>↻</span>
          {loading ? "Refreshing..." : "Refresh"}
        </button>

      </div>


      {/* MESSAGE */}
      {message && (
        <div className={`application-message ${messageType}`}>
          <span>
            {messageType === "success" ? "✓" : "!"}
          </span>

          {message}

          <button
            onClick={() => {
              setMessage("");
              setMessageType("");
            }}
          >
            ×
          </button>
        </div>
      )}


      {/* STATISTICS */}
      <div className="application-stats">

        <div className="application-stat-card">

          <div className="application-stat-icon total">
            ▦
          </div>

          <div>
            <span>Total Applications</span>
            <strong>{statistics.total}</strong>
          </div>

        </div>


        <div className="application-stat-card">

          <div className="application-stat-icon pending">
            ◷
          </div>

          <div>
            <span>Pending</span>
            <strong>{statistics.pending}</strong>
          </div>

        </div>


        <div className="application-stat-card">

          <div className="application-stat-icon approved">
            ✓
          </div>

          <div>
            <span>Approved</span>
            <strong>{statistics.approved}</strong>
          </div>

        </div>


        <div className="application-stat-card">

          <div className="application-stat-icon rejected">
            ×
          </div>

          <div>
            <span>Rejected</span>
            <strong>{statistics.rejected}</strong>
          </div>

        </div>

      </div>


      {/* APPLICATIONS CARD */}
      <div className="applications-card">

        <div className="applications-card-header">

          <div>
            <h2>Applications</h2>

            <p>
              {filteredLoans.length} application
              {filteredLoans.length !== 1 ? "s" : ""} found
            </p>
          </div>


          <div className="application-filters">

            <div className="application-search">

              <span>⌕</span>

              <input
                type="text"
                placeholder="Search loan ID, customer ID or product..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />

            </div>


            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="defaulted">Defaulted</option>
            </select>

          </div>

        </div>


        {/* TABLE */}
        <div className="applications-table-wrapper">

          {loading ? (

            <div className="applications-loading">

              <div className="loading-spinner"></div>

              <p>Loading loan applications...</p>

            </div>

          ) : filteredLoans.length === 0 ? (

            <div className="applications-empty">

              <div className="empty-icon">
                $
              </div>

              <h3>No loan applications found</h3>

              <p>
                There are no applications matching your current filters.
              </p>

            </div>

          ) : (

            <table className="applications-table">

              <thead>

                <tr>
                  <th>Loan ID</th>
                  <th>Customer</th>
                  <th>Loan Product</th>
                  <th>Amount</th>
                  <th>Interest</th>
                  <th>Total</th>
                  <th>Applied</th>
                  <th>Status</th>
                  <th>Actions</th>
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
                          C{loan.customer_id}
                        </div>

                        <div>
                          <strong>
                            Customer #{loan.customer_id}
                          </strong>

                          <small>
                            ID {loan.customer_id}
                          </small>
                        </div>

                      </div>

                    </td>


                    <td>

                      <div className="product-cell">

                        <strong>
                          {loan.product_name}
                        </strong>

                        <small>
                          {loan.repayment_period} months
                        </small>

                      </div>

                    </td>


                    <td>
                      <strong>
                        {formatCurrency(loan.amount)}
                      </strong>
                    </td>


                    <td>
                      <span className="interest-value">
                        {formatCurrency(loan.interest_amount)}
                      </span>

                      <small className="interest-rate">
                        {loan.interest_rate}%
                      </small>
                    </td>


                    <td>
                      <strong className="total-value">
                        {formatCurrency(loan.total_amount)}
                      </strong>
                    </td>


                    <td>
                      <span className="date-value">
                        {formatDate(loan.application_date)}
                      </span>
                    </td>


                    <td>

                      <span
                        className={`status-badge ${getStatusClass(
                          loan.status
                        )}`}
                      >
                        <span className="status-dot"></span>

                        {loan.status}
                      </span>

                    </td>


                    <td>

                      {loan.status === "pending" ? (

                        <div className="action-buttons">

                          <button
                            className="approve-button"
                            onClick={() =>
                              handleApprove(loan.loan_id)
                            }
                            disabled={actionLoading === loan.loan_id}
                          >
                            ✓ Approve
                          </button>


                          <button
                            className="reject-button"
                            onClick={() =>
                              handleReject(loan.loan_id)
                            }
                            disabled={actionLoading === loan.loan_id}
                          >
                            × Reject
                          </button>

                        </div>

                      ) : (

                        <span className="no-action">
                          —
                        </span>

                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </div>
  );
}

export default LoanApplications;