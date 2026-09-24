
import { useEffect, useState } from "react";
import axios from "axios";
import "./Repayments.css";

const API_URL = "http://localhost:5000/api";

function Repayments() {
  const [repayments, setRepayments] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");
  const [methodFilter, setMethodFilter] = useState("all");

  const [form, setForm] = useState({
    loan_id: "",
    amount: "",
    payment_method: "M-Pesa",
    reference_number: "",
    notes: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadRepayments = async () => {
    try {
      const response = await axios.get(`${API_URL}/repayments`);

      if (response.data.success) {
        setRepayments(response.data.repayments);
      }
    } catch (err) {
      console.error("Load repayments error:", err);
      setError("Unable to load repayments.");
    }
  };

  const loadActiveLoans = async () => {
    try {
      const response = await axios.get(`${API_URL}/loans/active`);

      if (response.data.success) {
        setActiveLoans(response.data.loans);
      }
    } catch (err) {
      console.error("Load active loans error:", err);
    }
  };

  const loadData = async () => {
    setLoading(true);

    await Promise.all([
      loadRepayments(),
      loadActiveLoans(),
    ]);

    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!form.loan_id || !form.amount) {
      setError("Please select a loan and enter the repayment amount.");
      return;
    }

    try {
      const response = await axios.post(
        `${API_URL}/repayments`,
        {
          loan_id: Number(form.loan_id),
          amount: Number(form.amount),
          payment_method: form.payment_method,
          reference_number:
            form.reference_number.trim() || null,
          notes: form.notes.trim() || null,
        }
      );

      if (response.data.success) {
        setMessage(response.data.message);

        setForm({
          loan_id: "",
          amount: "",
          payment_method: "M-Pesa",
          reference_number: "",
          notes: "",
        });

        setShowModal(false);

        await loadData();
      }
    } catch (err) {
      console.error("Record repayment error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to record repayment."
      );
    }
  };

  const filteredRepayments = repayments.filter((repayment) => {
    const searchText = search.toLowerCase();

    const matchesSearch =
      String(repayment.repayment_id)
        .toLowerCase()
        .includes(searchText) ||
      String(repayment.loan_id)
        .toLowerCase()
        .includes(searchText) ||
      String(repayment.customer_id)
        .toLowerCase()
        .includes(searchText) ||
      String(repayment.product_name || "")
        .toLowerCase()
        .includes(searchText) ||
      String(repayment.reference_number || "")
        .toLowerCase()
        .includes(searchText);

    const matchesMethod =
      methodFilter === "all" ||
      String(repayment.payment_method || "").toLowerCase() ===
        methodFilter.toLowerCase();

    return matchesSearch && matchesMethod;
  });

  const totalCollected = repayments.reduce(
    (total, repayment) =>
      total + Number(repayment.amount || 0),
    0
  );

  const averagePayment =
    repayments.length > 0
      ? totalCollected / repayments.length
      : 0;

  const formatCurrency = (value) => {
    return `KSh ${Number(value || 0).toLocaleString(
      "en-KE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatDate = (value) => {
    if (!value) return "-";

    return new Date(value).toLocaleDateString(
      "en-KE",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatMethod = (method) => {
    if (!method) return "-";

    return method
      .replace(/[-_]/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

  return (
    <div className="repayments-page">

      {/* PAGE HEADER */}
      <div className="repayments-header">
        <div>
          <span className="repayments-eyebrow">
            LOAN MANAGEMENT
          </span>

          <h1>Repayments</h1>

          <p>
            Track customer payments and manage outstanding
            loan balances.
          </p>
        </div>

        <button
          className="record-repayment-btn"
          onClick={() => {
            setError("");
            setMessage("");
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-lg"></i>
          Record Repayment
        </button>
      </div>

      {/* ALERTS */}
      {message && (
        <div className="repayment-alert success">
          <i className="bi bi-check-circle-fill"></i>
          <span>{message}</span>

          <button onClick={() => setMessage("")}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {error && (
        <div className="repayment-alert error">
          <i className="bi bi-exclamation-circle-fill"></i>
          <span>{error}</span>

          <button onClick={() => setError("")}>
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      {/* STATISTICS */}
      <div className="repayment-stats">

        <div className="repayment-stat-card">
          <div className="stat-icon green">
            <i className="bi bi-cash-stack"></i>
          </div>

          <div>
            <span>Total Collected</span>
            <strong>{formatCurrency(totalCollected)}</strong>
          </div>
        </div>

        <div className="repayment-stat-card">
          <div className="stat-icon light-green">
            <i className="bi bi-receipt"></i>
          </div>

          <div>
            <span>Total Payments</span>
            <strong>{repayments.length}</strong>
          </div>
        </div>

        <div className="repayment-stat-card">
          <div className="stat-icon mint">
            <i className="bi bi-graph-up-arrow"></i>
          </div>

          <div>
            <span>Average Payment</span>
            <strong>{formatCurrency(averagePayment)}</strong>
          </div>
        </div>

        <div className="repayment-stat-card">
          <div className="stat-icon dark-green">
            <i className="bi bi-wallet2"></i>
          </div>

          <div>
            <span>Active Loans</span>
            <strong>{activeLoans.length}</strong>
          </div>
        </div>

      </div>

      {/* CONTENT CARD */}
      <div className="repayments-card">

        <div className="repayments-toolbar">

          <div className="repayment-search">
            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Search repayments..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
            />
          </div>

          <div className="repayment-filter">
            <i className="bi bi-funnel"></i>

            <select
              value={methodFilter}
              onChange={(event) =>
                setMethodFilter(event.target.value)
              }
            >
              <option value="all">
                All Payment Methods
              </option>
              <option value="M-Pesa">
                M-Pesa
              </option>
              <option value="cash">
                Cash
              </option>
              <option value="bank">
                Bank
              </option>
            </select>
          </div>

        </div>

        {/* TABLE */}
        {loading ? (
          <div className="repayments-loading">
            <div className="loading-spinner"></div>
            <p>Loading repayments...</p>
          </div>
        ) : filteredRepayments.length === 0 ? (
          <div className="repayments-empty">
            <div className="empty-icon">
              <i className="bi bi-receipt"></i>
            </div>

            <h3>No repayments found</h3>

            <p>
              {repayments.length === 0
                ? "There are no repayment records yet."
                : "No repayments match your search or filter."}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="repayments-table">

              <thead>
                <tr>
                  <th>REPAYMENT</th>
                  <th>LOAN</th>
                  <th>PRODUCT</th>
                  <th>AMOUNT PAID</th>
                  <th>REMAINING BALANCE</th>
                  <th>METHOD</th>
                  <th>DATE</th>
                  <th>REFERENCE</th>
                </tr>
              </thead>

              <tbody>
                {filteredRepayments.map((repayment) => (
                  <tr key={repayment.repayment_id}>

                    <td>
                      <div className="repayment-id">
                        <span className="payment-avatar">
                          <i className="bi bi-check-lg"></i>
                        </span>

                        <div>
                          <strong>
                            #{repayment.repayment_id}
                          </strong>

                          <small>
                            Customer #{repayment.customer_id}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="loan-number">
                        Loan #{repayment.loan_id}
                      </span>
                    </td>

                    <td>
                      <span className="product-name">
                        {repayment.product_name ||
                          "Loan Product"}
                      </span>
                    </td>

                    <td>
                      <strong className="amount-paid">
                        {formatCurrency(repayment.amount)}
                      </strong>
                    </td>

                    <td>
                      <strong className="remaining-balance">
                        {formatCurrency(repayment.balance)}
                      </strong>
                    </td>

                    <td>
                      <span className="method-badge">
                        {formatMethod(
                          repayment.payment_method
                        )}
                      </span>
                    </td>

                    <td>
                      <span className="repayment-date">
                        {formatDate(
                          repayment.repayment_date
                        )}
                      </span>
                    </td>

                    <td>
                      <span className="reference-number">
                        {repayment.reference_number || "-"}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>

            </table>
          </div>
        )}

      </div>

      {/* RECORD REPAYMENT MODAL */}
      {showModal && (
        <div
          className="repayment-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="repayment-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            <div className="modal-header">
              <div>
                <span>PAYMENT MANAGEMENT</span>
                <h2>Record Repayment</h2>
              </div>

              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label>
                  Select Active Loan
                </label>

                <select
                  name="loan_id"
                  value={form.loan_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Choose an active loan
                  </option>

                  {activeLoans.map((loan) => (
                    <option
                      key={loan.loan_id}
                      value={loan.loan_id}
                    >
                      Loan #{loan.loan_id} —{" "}
                      {formatCurrency(loan.balance)} balance
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">

                <div className="form-group">
                  <label>
                    Repayment Amount
                  </label>

                  <div className="input-with-prefix">
                    <span>KSh</span>

                    <input
                      type="number"
                      name="amount"
                      value={form.amount}
                      onChange={handleChange}
                      min="1"
                      step="0.01"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Payment Method
                  </label>

                  <select
                    name="payment_method"
                    value={form.payment_method}
                    onChange={handleChange}
                  >
                    <option value="M-Pesa">
                      M-Pesa
                    </option>
                    <option value="cash">
                      Cash
                    </option>
                    <option value="bank">
                      Bank Transfer
                    </option>
                  </select>
                </div>

              </div>

              <div className="form-group">
                <label>
                  Reference Number
                </label>

                <input
                  type="text"
                  name="reference_number"
                  value={form.reference_number}
                  onChange={handleChange}
                  placeholder="e.g. MPESA001"
                />
              </div>

              <div className="form-group">
                <label>
                  Notes
                </label>

                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  placeholder="Optional payment notes..."
                  rows="3"
                ></textarea>
              </div>

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-repayment-btn"
                >
                  <i className="bi bi-check2-circle"></i>
                  Record Payment
                </button>

              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}

export default Repayments;
