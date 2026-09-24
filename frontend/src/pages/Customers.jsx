import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCustomers } from "../services/customerService";
import "./Customers.css";

function Customers() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const token = localStorage.getItem("token");
        const savedUser = localStorage.getItem("user");

        if (!token || !savedUser) {
          navigate("/login");
          return;
        }

        const user = JSON.parse(savedUser);

        if (user.role !== "admin") {
          navigate("/dashboard");
          return;
        }

        const result = await getCustomers();

        setCustomers(result.customers || []);
      } catch (err) {
        console.error("Customers error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login");
          return;
        }

        setError(
          err.response?.data?.message ||
          "Unable to load customers."
        );
      } finally {
        setLoading(false);
      }
    };

    loadCustomers();
  }, [navigate]);

  const filteredCustomers = customers.filter((customer) => {
    const searchText = search.toLowerCase();

    return (
      customer.full_name?.toLowerCase().includes(searchText) ||
      customer.email?.toLowerCase().includes(searchText) ||
      customer.phone?.toLowerCase().includes(searchText) ||
      customer.national_id?.toLowerCase().includes(searchText)
    );
  });

  if (loading) {
    return (
      <div className="customers-page">
        <div className="customers-loading">
          <i className="bi bi-arrow-repeat"></i>
          <h2>Loading customers...</h2>
          <p>Please wait while customer records are retrieved.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customers-page">
        <div className="customers-error">
          <i className="bi bi-exclamation-circle"></i>
          <h2>Unable to load customers</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="customers-page">

      <div className="customers-header">

        <div>
          <span className="customers-eyebrow">
            CUSTOMER MANAGEMENT
          </span>

          <h1>Customers</h1>

          <p>
            View and manage registered RICHIE LOANS customers.
          </p>
        </div>

        <div className="customer-count">
          <i className="bi bi-people"></i>

          <div>
            <strong>{customers.length}</strong>
            <span>Total Customers</span>
          </div>
        </div>

      </div>

      <div className="customers-toolbar">

        <div className="customer-search">

          <i className="bi bi-search"></i>

          <input
            type="text"
            placeholder="Search by name, email, phone or National ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </div>

      <div className="customers-card">

        <div className="customers-card-header">

          <div>
            <h3>Registered Customers</h3>

            <p>
              {filteredCustomers.length} customer
              {filteredCustomers.length !== 1 ? "s" : ""} found
            </p>
          </div>

        </div>

        {filteredCustomers.length === 0 ? (

          <div className="customers-empty">

            <div className="customers-empty-icon">
              <i className="bi bi-people"></i>
            </div>

            <h3>
              {search
                ? "No customers found"
                : "No customers registered"}
            </h3>

            <p>
              {search
                ? "Try using a different search term."
                : "Registered customers will appear here."}
            </p>

          </div>

        ) : (

          <div className="customers-table-wrapper">

            <table className="customers-table">

              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Contact</th>
                  <th>National ID</th>
                  <th>Occupation</th>
                  <th>Monthly Income</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>

                {filteredCustomers.map((customer) => (

                  <tr key={customer.customer_id}>

                    <td>

                      <div className="customer-name">

                        <div className="customer-avatar">
                          {customer.full_name
                            ?.charAt(0)
                            ?.toUpperCase() || "C"}
                        </div>

                        <div>
                          <strong>
                            {customer.full_name}
                          </strong>

                          <span>
                            Customer #{customer.customer_id}
                          </span>
                        </div>

                      </div>

                    </td>

                    <td>

                      <div className="customer-contact">

                        <span>
                          <i className="bi bi-envelope"></i>
                          {customer.email}
                        </span>

                        <span>
                          <i className="bi bi-telephone"></i>
                          {customer.phone || "Not provided"}
                        </span>

                      </div>

                    </td>

                    <td>
                      {customer.national_id}
                    </td>

                    <td>
                      {customer.occupation || "Not provided"}
                    </td>

                    <td>
                      KSh{" "}
                      {Number(
                        customer.monthly_income || 0
                      ).toLocaleString()}
                    </td>

                    <td>

                      <span
                        className={`customer-status ${
                          customer.customer_status
                        }`}
                      >
                        {customer.customer_status}
                      </span>

                    </td>

                    <td>

                      <button
                        className="view-customer-btn"
                        onClick={() =>
                          navigate(
                            `/customers/${customer.customer_id}`
                          )
                        }
                      >
                        <i className="bi bi-eye"></i>
                        View
                      </button>

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

export default Customers;