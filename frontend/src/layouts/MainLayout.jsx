
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import "./MainLayout.css";

function MainLayout() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const savedUser = localStorage.getItem("user");

  if (!token || !savedUser) {
    navigate("/login");
    return null;
  }

  const user = JSON.parse(savedUser);
  const isAdmin = user?.role === "admin";

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div className="main-layout">

      <aside className="main-sidebar">

        <div className="sidebar-brand">
          <div className="sidebar-logo">R</div>

          <div>
            <strong>RICHIE</strong>
            <span>LOANS</span>
          </div>
        </div>

        <div className="sidebar-user">
          <div className="user-avatar">
            {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>

          <div>
            <strong>{user?.full_name || "User"}</strong>
            <span>
              {isAdmin ? "Administrator" : "Customer"}
            </span>
          </div>
        </div>

        <nav className="sidebar-navigation">

          <div className="navigation-label">
            MAIN MENU
          </div>

          <NavLink
            to="/dashboard"
            className="sidebar-link"
          >
            <i className="bi bi-grid-1x2"></i>
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/loan-products"
            className="sidebar-link"
          >
            <i className="bi bi-credit-card"></i>
            <span>Loan Products</span>
          </NavLink>

          {isAdmin && (
            <>
              <NavLink to="/customers" className="sidebar-link">
                <i className="bi bi-people"></i>
                <span>Customers</span>
              </NavLink>

              <NavLink to="/applications" className="sidebar-link">
                <i className="bi bi-file-earmark-text"></i>
                <span>Applications</span>
              </NavLink>

              <NavLink to="/active-loans" className="sidebar-link">
                <i className="bi bi-cash-stack"></i>
                <span>Active Loans</span>
              </NavLink>

              <NavLink to="/repayments" className="sidebar-link">
                <i className="bi bi-arrow-repeat"></i>
                <span>Repayments</span>
              </NavLink>

              <NavLink to="/savings" className="sidebar-link">
                <i className="bi bi-piggy-bank"></i>
                <span>Savings</span>
              </NavLink>

              <NavLink to="/reports" className="sidebar-link">
                <i className="bi bi-bar-chart"></i>
                <span>Reports</span>
              </NavLink>
            </>
          )}

          {!isAdmin && (
            <>
              <NavLink to="/my-applications" className="sidebar-link">
                <i className="bi bi-file-earmark-text"></i>
                <span>My Applications</span>
              </NavLink>

              <NavLink to="/my-loans" className="sidebar-link">
                <i className="bi bi-cash-stack"></i>
                <span>My Loans</span>
              </NavLink>

              <NavLink to="/repayments" className="sidebar-link">
                <i className="bi bi-arrow-repeat"></i>
                <span>Repayments</span>
              </NavLink>

              <NavLink to="/savings" className="sidebar-link">
                <i className="bi bi-piggy-bank"></i>
                <span>Savings</span>
              </NavLink>
            </>
          )}

        </nav>

        <div className="sidebar-bottom">

          <NavLink to="/settings" className="sidebar-link">
            <i className="bi bi-gear"></i>
            <span>Settings</span>
          </NavLink>

          <button
            className="sidebar-logout"
            onClick={logout}
          >
            <i className="bi bi-box-arrow-left"></i>
            <span>Logout</span>
          </button>

        </div>

      </aside>

      <div className="main-content">

        <header className="topbar">

          <div>
            <span>RICHIE LOANS</span>
            <strong>Financial Management Platform</strong>
          </div>

          <div className="topbar-user">

            <div className="topbar-avatar">
              {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
            </div>

            <div>
              <strong>{user?.full_name || "User"}</strong>
              <span>
                {isAdmin ? "Administrator" : "Customer"}
              </span>
            </div>

          </div>

        </header>

        <main className="page-content">
          <Outlet />
        </main>

      </div>

    </div>
  );
}

export default MainLayout;