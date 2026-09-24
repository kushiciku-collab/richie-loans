import { useEffect, useState } from "react";
import axios from "axios";
import "./LoanProducts.css";

const API_URL = "http://localhost:5000/api/loan-products";

const emptyForm = {
  product_name: "",
  description: "",
  min_amount: "",
  max_amount: "",
  interest_rate: "",
  repayment_period: "",
  status: "active",
};

function LoanProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [success, setSuccess] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);

  const [form, setForm] = useState(emptyForm);

  const loadProducts = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API_URL);

      setProducts(response.data.products || []);
      setError("");
    } catch (err) {
      console.error("Loan products error:", err);
      setError("Unable to load loan products.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEditForm = (product) => {
    setEditingProduct(product);

    setForm({
      product_name: product.product_name || "",
      description: product.description || "",
      min_amount: product.min_amount || "",
      max_amount: product.max_amount || "",
      interest_rate: product.interest_rate || "",
      repayment_period: product.repayment_period || "",
      status: product.status || "active",
    });

    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (
      !form.product_name ||
      !form.min_amount ||
      !form.max_amount ||
      !form.interest_rate ||
      !form.repayment_period
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    if (Number(form.min_amount) <= 0) {
      setError("Minimum amount must be greater than zero.");
      return;
    }

    if (Number(form.max_amount) <= 0) {
      setError("Maximum amount must be greater than zero.");
      return;
    }

    if (Number(form.max_amount) < Number(form.min_amount)) {
      setError("Maximum amount cannot be less than minimum amount.");
      return;
    }

    if (Number(form.interest_rate) < 0) {
      setError("Interest rate cannot be negative.");
      return;
    }

    if (Number(form.repayment_period) <= 0) {
      setError("Repayment period must be greater than zero.");
      return;
    }

    try {
      setSaving(true);

      const token = localStorage.getItem("token");

      const payload = {
        product_name: form.product_name,
        description: form.description,
        min_amount: Number(form.min_amount),
        max_amount: Number(form.max_amount),
        interest_rate: Number(form.interest_rate),
        repayment_period: Number(form.repayment_period),
        status: form.status,
      };

      if (editingProduct) {
        await axios.put(
          `${API_URL}/${editingProduct.product_id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSuccess("Loan product updated successfully.");
      } else {
        await axios.post(
          API_URL,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setSuccess("Loan product created successfully.");
      }

      closeForm();

      await loadProducts();

      setSuccess(
        editingProduct
          ? "Loan product updated successfully."
          : "Loan product created successfully."
      );
    } catch (err) {
      console.error("Save loan product error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to save loan product."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${product.product_name}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");
      setSuccess("");

      const token = localStorage.getItem("token");

      await axios.delete(
        `${API_URL}/${product.product_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Loan product deleted successfully.");

      await loadProducts();
    } catch (err) {
      console.error("Delete loan product error:", err);

      setError(
        err.response?.data?.message ||
          "Unable to delete loan product."
      );
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="loan-products-page">

      <div className="loan-products-header">

        <div>
          <span className="products-eyebrow">
            RICHIE LOANS
          </span>

          <h1>Loan Products</h1>

          <p>
            Manage the loan products available to RICHIE LOANS customers.
          </p>
        </div>

        <button
          className="add-product-button"
          onClick={openAddForm}
        >
          <i className="bi bi-plus-lg"></i>
          Add Loan Product
        </button>

      </div>

      {success && (
        <div className="products-success">
          <i className="bi bi-check-circle"></i>
          {success}
        </div>
      )}

      {error && (
        <div className="products-error">
          <i className="bi bi-exclamation-circle"></i>
          {error}
        </div>
      )}

      {loading && (
        <div className="products-message">
          <i className="bi bi-arrow-repeat"></i>
          Loading loan products...
        </div>
      )}

      {!loading && !showForm && products.length === 0 && (
        <div className="products-empty">

          <div className="products-empty-icon">
            <i className="bi bi-cash-stack"></i>
          </div>

          <h2>No Loan Products Yet</h2>

          <p>
            Create your first loan product to make it available
            to customers.
          </p>

          <button
            className="add-product-button"
            onClick={openAddForm}
          >
            <i className="bi bi-plus-lg"></i>
            Create First Product
          </button>

        </div>
      )}

      {showForm && (
        <div className="product-form-card">

          <div className="product-form-header">

            <div>
              <span className="products-eyebrow">
                {editingProduct
                  ? "EDIT PRODUCT"
                  : "NEW PRODUCT"}
              </span>

              <h2>
                {editingProduct
                  ? "Edit Loan Product"
                  : "Create Loan Product"}
              </h2>

              <p>
                {editingProduct
                  ? "Update the details of this loan product."
                  : "Enter the details for the new loan product."}
              </p>
            </div>

            <button
              type="button"
              className="close-form-button"
              onClick={closeForm}
            >
              <i className="bi bi-x-lg"></i>
            </button>

          </div>

          <form onSubmit={handleSubmit}>

            <div className="form-grid">

              <div className="form-group full-width">
                <label>
                  Product Name *
                </label>

                <input
                  type="text"
                  name="product_name"
                  value={form.product_name}
                  onChange={handleChange}
                  placeholder="e.g. Emergency Loan"
                />
              </div>

              <div className="form-group full-width">
                <label>
                  Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe this loan product..."
                  rows="4"
                ></textarea>
              </div>

              <div className="form-group">
                <label>
                  Minimum Amount (KSh) *
                </label>

                <input
                  type="number"
                  name="min_amount"
                  value={form.min_amount}
                  onChange={handleChange}
                  placeholder="5000"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>
                  Maximum Amount (KSh) *
                </label>

                <input
                  type="number"
                  name="max_amount"
                  value={form.max_amount}
                  onChange={handleChange}
                  placeholder="50000"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>
                  Interest Rate (%) *
                </label>

                <input
                  type="number"
                  name="interest_rate"
                  value={form.interest_rate}
                  onChange={handleChange}
                  placeholder="10"
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="form-group">
                <label>
                  Repayment Period (Months) *
                </label>

                <input
                  type="number"
                  name="repayment_period"
                  value={form.repayment_period}
                  onChange={handleChange}
                  placeholder="6"
                  min="1"
                />
              </div>

              <div className="form-group">
                <label>
                  Status *
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>

            </div>

            <div className="form-actions">

              <button
                type="button"
                className="cancel-product"
                onClick={closeForm}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="save-product"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <i className="bi bi-arrow-repeat"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-lg"></i>
                    {editingProduct
                      ? "Update Loan Product"
                      : "Save Loan Product"}
                  </>
                )}
              </button>

            </div>

          </form>

        </div>
      )}

      {!loading && products.length > 0 && !showForm && (
        <div className="products-grid">

          {products.map((product) => (
            <div
              className="product-card"
              key={product.product_id}
            >

              <div className="product-card-top">

                <div className="product-icon">
                  <i className="bi bi-wallet2"></i>
                </div>

                <span
                  className={
                    product.status === "active"
                      ? "product-status active"
                      : "product-status inactive"
                  }
                >
                  {product.status}
                </span>

              </div>

              <h2>
                {product.product_name}
              </h2>

              <p className="product-description">
                {product.description ||
                  "No description provided."}
              </p>

              <div className="product-details">

                <div>
                  <span>Minimum</span>

                  <strong>
                    KSh{" "}
                    {Number(
                      product.min_amount
                    ).toLocaleString("en-KE")}
                  </strong>
                </div>

                <div>
                  <span>Maximum</span>

                  <strong>
                    KSh{" "}
                    {Number(
                      product.max_amount
                    ).toLocaleString("en-KE")}
                  </strong>
                </div>

                <div>
                  <span>Interest</span>

                  <strong>
                    {product.interest_rate}%
                  </strong>
                </div>

                <div>
                  <span>Period</span>

                  <strong>
                    {product.repayment_period} months
                  </strong>
                </div>

              </div>

              <div className="product-actions">

                <button
                  className="edit-product"
                  onClick={() =>
                    openEditForm(product)
                  }
                  disabled={deleting}
                >
                  <i className="bi bi-pencil"></i>
                  Edit
                </button>

                <button
                  className="delete-product"
                  onClick={() =>
                    handleDelete(product)
                  }
                  disabled={deleting}
                >
                  <i className="bi bi-trash"></i>

                  {deleting
                    ? "Deleting..."
                    : "Delete"}
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default LoanProducts;