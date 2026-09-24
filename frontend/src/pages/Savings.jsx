
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import "./Savings.css";

const API_URL = "http://localhost:5000/api";

function Savings() {
  const [savings, setSavings] = useState([]);
  const [customers, setCustomers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const [formData, setFormData] = useState({
    customer_id: "",
    amount: "",
    transaction_type: "deposit",
    reference_number: "",
    description: "",
  });

  const [message, setMessage] = useState({
    type: "",
    text: "",
  });

  useEffect(() => {
    loadSavings();
  }, []);

  const loadSavings = async () => {
    try {
      setLoading(true);

      const response = await axios.get(`${API_URL}/savings`);

      if (response.data.success) {
        setSavings(response.data.savings);
      }
    } catch (error) {
      console.error("Error loading savings:", error);

      setMessage({
        type: "error",
        text: "Unable to load savings transactions.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.customer_id || !formData.amount) {
      setMessage({
        type: "error",
        text: "Please enter a customer ID and amount.",
      });
      return;
    }

    try {
      setSaving(true);
      setMessage({ type: "", text: "" });

      const response = await axios.post(
        `${API_URL}/savings`,
        {
          customer_id: Number(formData.customer_id),
          amount: Number(formData.amount),
          transaction_type: formData.transaction_type,
          reference_number:
            formData.reference_number.trim() || null,
          description:
            formData.description.trim() || null,
        }
      );

      if (response.data.success) {
        setMessage({
          type: "success",
          text: response.data.message,
        });

        setFormData({
          customer_id: "",
          amount: "",
          transaction_type: "deposit",
          reference_number: "",
          description: "",
        });

        setShowModal(false);

        await loadSavings();
      }
    } catch (error) {
      console.error("Record savings error:", error);

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to record savings transaction.",
      });
    } finally {
      setSaving(false);
    }
  };

  const getCustomerName = (customerId) => {
    const customer = customers.find(
      (item) =>
        Number(item.customer_id) === Number(customerId)
    );

    if (!customer) {
      return `Customer #${customerId}`;
    }

    return (
      customer.full_name ||
      customer.name ||
      `${customer.first_name || ""} ${
        customer.last_name || ""
      }`.trim() ||
      `Customer #${customerId}`
    );
  };

  const filteredSavings = useMemo(() => {
    return savings.filter((item) => {
      const customerName = getCustomerName(item.customer_id);

      const matchesSearch =
        customerName
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        String(item.customer_id).includes(search) ||
        String(item.reference_number || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesType =
        typeFilter === "all" ||
        item.transaction_type === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [savings, search, typeFilter, customers]);

  const totalDeposits = useMemo(() => {
    return savings
      .filter((item) => item.transaction_type === "deposit")
      .reduce((total, item) => total + Number(item.amount), 0);
  }, [savings]);

  const totalWithdrawals = useMemo(() => {
    return savings
      .filter((item) => item.transaction_type === "withdrawal")
      .reduce((total, item) => total + Number(item.amount), 0);
  }, [savings]);

  const totalBalance = totalDeposits - totalWithdrawals;

  const depositCount = savings.filter(
    (item) => item.transaction_type === "deposit"
  ).length;

  const withdrawalCount = savings.filter(
    (item) => item.transaction_type === "withdrawal"
  ).length;

  const formatCurrency = (amount) => {
    return `KSh ${Number(amount || 0).toLocaleString(
      "en-KE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    )}`;
  };

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-KE", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="savings-page">
      <div className="savings-header">
        <div>
          <span className="savings-eyebrow">
            FINANCIAL MANAGEMENT
          </span>

          <h1>Savings</h1>

          <p>
            Manage customer deposits, withdrawals and
            savings balances.
          </p>
        </div>

        <button
          className="add-savings-btn"
          onClick={() => {
            setMessage({ type: "", text: "" });
            setShowModal(true);
          }}
        >
          <i className="bi bi-plus-lg"></i>
          Record Transaction
        </button>
      </div>

      {message.text && (
        <div
          className={`savings-alert ${
            message.type === "success"
              ? "success"
              : "error"
          }`}
        >
          <i
            className={`bi ${
              message.type === "success"
                ? "bi-check-circle-fill"
                : "bi-exclamation-circle-fill"
            }`}
          ></i>

          <span>{message.text}</span>

          <button
            onClick={() =>
              setMessage({ type: "", text: "" })
            }
          >
            <i className="bi bi-x"></i>
          </button>
        </div>
      )}

      <div className="savings-stats">
        <div className="saving-stat-card balance-card">
          <div className="saving-stat-icon">
            <i className="bi bi-wallet2"></i>
          </div>

          <div>
            <span>Current Savings</span>
            <strong>{formatCurrency(totalBalance)}</strong>
            <small>Net savings balance</small>
          </div>
        </div>

        <div className="saving-stat-card">
          <div className="saving-stat-icon deposit-icon">
            <i className="bi bi-arrow-down-left"></i>
          </div>

          <div>
            <span>Total Deposits</span>
            <strong>{formatCurrency(totalDeposits)}</strong>
            <small>{depositCount} deposits</small>
          </div>
        </div>

        <div className="saving-stat-card">
          <div className="saving-stat-icon withdrawal-icon">
            <i className="bi bi-arrow-up-right"></i>
          </div>

          <div>
            <span>Total Withdrawals</span>
            <strong>{formatCurrency(totalWithdrawals)}</strong>
            <small>{withdrawalCount} withdrawals</small>
          </div>
        </div>

        <div className="saving-stat-card">
          <div className="saving-stat-icon transactions-icon">
            <i className="bi bi-arrow-left-right"></i>
          </div>

          <div>
            <span>Transactions</span>
            <strong>{savings.length}</strong>
            <small>All savings transactions</small>
          </div>
        </div>
      </div>

      <div className="savings-content-card">
        <div className="savings-toolbar">
          <div className="savings-search">
            <i className="bi bi-search"></i>

            <input
              type="text"
              placeholder="Search customer or reference..."
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
            />
          </div>

          <div className="savings-filter">
            <i className="bi bi-funnel"></i>

            <select
              value={typeFilter}
              onChange={(e) =>
                setTypeFilter(e.target.value)
              }
            >
              <option value="all">
                All Transactions
              </option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">
                Withdrawals
              </option>
            </select>
          </div>
        </div>

        <div className="savings-table-wrapper">
          <table className="savings-table">
            <thead>
              <tr>
                <th>TRANSACTION</th>
                <th>CUSTOMER</th>
                <th>AMOUNT</th>
                <th>TYPE</th>
                <th>REFERENCE</th>
                <th>DATE</th>
                <th>DESCRIPTION</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    className="savings-empty"
                  >
                    <div className="savings-loader">
                      <span></span>
                    </div>

                    Loading savings transactions...
                  </td>
                </tr>
              ) : filteredSavings.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    className="savings-empty"
                  >
                    <div className="empty-icon">
                      <i className="bi bi-piggy-bank"></i>
                    </div>

                    <strong>
                      No savings transactions found
                    </strong>

                    <span>
                      Record a deposit or withdrawal to
                      get started.
                    </span>
                  </td>
                </tr>
              ) : (
                filteredSavings.map((item) => (
                  <tr key={item.saving_id}>
                    <td>
                      <div className="transaction-id">
                        <span>
                          <i className="bi bi-receipt"></i>
                        </span>

                        <div>
                          <strong>
                            SAV-
                            {String(item.saving_id).padStart(
                              4,
                              "0"
                            )}
                          </strong>

                          <small>
                            #{item.saving_id}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <div className="customer-cell">
                        <div className="customer-avatar">
                          {getCustomerName(
                            item.customer_id
                          )
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>
                          <strong>
                            {getCustomerName(
                              item.customer_id
                            )}
                          </strong>

                          <small>
                            Customer #{item.customer_id}
                          </small>
                        </div>
                      </div>
                    </td>

                    <td>
                      <strong
                        className={`amount ${
                          item.transaction_type ===
                          "deposit"
                            ? "deposit-amount"
                            : "withdrawal-amount"
                        }`}
                      >
                        {item.transaction_type ===
                        "deposit"
                          ? "+"
                          : "-"}
                        {formatCurrency(item.amount)}
                      </strong>
                    </td>

                    <td>
                      <span
                        className={`transaction-badge ${
                          item.transaction_type
                        }`}
                      >
                        <i
                          className={`bi ${
                            item.transaction_type ===
                            "deposit"
                              ? "bi-arrow-down-left"
                              : "bi-arrow-up-right"
                          }`}
                        ></i>

                        {item.transaction_type}
                      </span>
                    </td>

                    <td>
                      <span className="reference">
                        {item.reference_number || "—"}
                      </span>
                    </td>

                    <td>
                      <span className="date">
                        {formatDate(item.transaction_date)}
                      </span>
                    </td>

                    <td>
                      <span className="description">
                        {item.description || "—"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && filteredSavings.length > 0 && (
          <div className="savings-table-footer">
            Showing{" "}
            <strong>{filteredSavings.length}</strong>{" "}
            of <strong>{savings.length}</strong>{" "}
            transactions
          </div>
        )}
      </div>

      {showModal && (
        <div
          className="savings-modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="savings-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="savings-modal-header">
              <div>
                <span className="modal-icon">
                  <i className="bi bi-piggy-bank"></i>
                </span>

                <div>
                  <h2>Record Savings</h2>

                  <p>
                    Add a customer deposit or withdrawal.
                  </p>
                </div>
              </div>

              <button
                className="modal-close"
                onClick={() =>
                  setShowModal(false)
                }
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <form
              className="savings-form"
              onSubmit={handleSubmit}
            >
              <div className="form-group">
                <label>
                  Customer ID <span>*</span>
                </label>

                <input
                  type="number"
                  name="customer_id"
                  min="1"
                  placeholder="Enter customer ID"
                  value={formData.customer_id}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    Amount (KSh) <span>*</span>
                  </label>

                  <div className="amount-input">
                    <span>KSh</span>

                    <input
                      type="number"
                      name="amount"
                      min="1"
                      step="0.01"
                      placeholder="0.00"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Transaction Type <span>*</span>
                  </label>

                  <select
                    name="transaction_type"
                    value={formData.transaction_type}
                    onChange={handleChange}
                    required
                  >
                    <option value="deposit">
                      Deposit
                    </option>

                    <option value="withdrawal">
                      Withdrawal
                    </option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Reference Number</label>

                <input
                  type="text"
                  name="reference_number"
                  placeholder="e.g. MPESA123456"
                  value={formData.reference_number}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Description</label>

                <textarea
                  name="description"
                  rows="3"
                  placeholder="Enter transaction description..."
                  value={formData.description}
                  onChange={handleChange}
                ></textarea>
              </div>

              <div className="savings-form-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="save-savings-btn"
                  disabled={saving}
                >
                  {saving ? (
                    <>
                      <span className="button-spinner"></span>
                      Saving...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg"></i>
                      Record Transaction
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Savings;

