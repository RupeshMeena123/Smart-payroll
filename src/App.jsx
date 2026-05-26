import "./App.css";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaMoneyBillWave,
  FaTrophy,
  FaGift,
  FaClock,
  FaSearch,
  FaTable,
  FaIdCard,
  FaPlus,
  FaCalculator,
  FaChartLine,
  FaArrowRight,
} from "react-icons/fa";

const API_BASE_URL = "smart-payroll-production.up.railway.app";

function App() {
  const [activePage, setActivePage] = useState("Dashboard");

  const [employees, setEmployees] = useState([]);
  const [employeeName, setEmployeeName] = useState("");
  const [email, setEmail] = useState("");
  const [salary, setSalary] = useState("");
  const [position, setPosition] = useState("");

  const [overtimeHours, setOvertimeHours] = useState("");
  const [bonus, setBonus] = useState("");
  const [paidLeaves, setPaidLeaves] = useState("");
  const [unpaidLeaves, setUnpaidLeaves] = useState("");
  const [holidays, setHolidays] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("cards");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [statusType, setStatusType] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("isLoggedIn"),
  );
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const searchInputRef = useRef(null);
  const formRef = useRef(null);
  const notificationTimeoutRef = useRef(null);
  const employeeNameRef = useRef(null);
  const emailRef = useRef(null);
  const salaryRef = useRef(null);
  const positionRef = useRef(null);
  const overtimeHoursRef = useRef(null);
  const bonusRef = useRef(null);
  const paidLeavesRef = useRef(null);
  const unpaidLeavesRef = useRef(null);
  const holidaysRef = useRef(null);

  const employeeInputRefs = [
    employeeNameRef,
    emailRef,
    salaryRef,
    positionRef,
    overtimeHoursRef,
    bonusRef,
    paidLeavesRef,
    unpaidLeavesRef,
    holidaysRef,
  ];

  const totalEmployees = employees.length;

  const totalSalary = employees.reduce(
    (sum, employee) => sum + Number(employee.salary || 0),
    0,
  );

  const averageSalary =
    totalEmployees > 0 ? Math.round(totalSalary / totalEmployees) : 0;

  const highestSalaryEmployee =
    employees.length > 0
      ? employees.reduce((highest, employee) =>
          Number(employee.salary) > Number(highest.salary) ? employee : highest,
        )
      : null;

  const overtimePay = Number(overtimeHours || 0) * 250;
  const holidayAllowance = Number(holidays || 0) * 150;
  const unpaidDeduction = Number(unpaidLeaves || 0) * 500;
  const estimatedPayroll =
    Number(salary || 0) +
    Number(bonus || 0) +
    overtimePay +
    holidayAllowance -
    unpaidDeduction;

  useEffect(() => {
    if (isLoggedIn) {
      fetchEmployees();
    }
  }, [isLoggedIn]);

  const showNotification = (message, type = "success", duration = 3000) => {
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    if (type === "success") {
      setSuccessMessage(message);
      setErrorMessage("");
    } else {
      setErrorMessage(message);
      setSuccessMessage("");
    }
    setStatusType(type);

    notificationTimeoutRef.current = setTimeout(() => {
      setSuccessMessage("");
      setErrorMessage("");
      setStatusType("");
      notificationTimeoutRef.current = null;
    }, duration);
  };

  const fetchEmployees = () => {
    setLoading(true);

    axios
      .get(`${API_BASE_URL}/employees`)
      .then((response) => {
        setEmployees(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
        showNotification(
          "Unable to load employees. Please check the backend.",
          "error",
        );
      });
  };

  const addEmployee = () => {
    if (employeeName.trim() === "") {
      showNotification("Employee name is required.", "error");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      showNotification("Please enter a valid email address.", "error");
      return;
    }

    if (Number(salary) <= 0) {
      showNotification("Salary must be greater than 0.", "error");
      return;
    }

    if (position.trim() === "") {
      showNotification("Position is required.", "error");
      return;
    }

    const employeeData = {
      name: employeeName,
      email: email,
      salary: Number(salary),
      position: position,
      overtime_hours: Number(overtimeHours) || 0,
      bonus: Number(bonus) || 0,
      paid_leaves: Number(paidLeaves) || 0,
      unpaid_leaves: Number(unpaidLeaves) || 0,
      holidays: Number(holidays) || 0,
    };

    const request =
      editingId === null
        ? axios.post(`${API_BASE_URL}/employees`, employeeData)
        : axios.put(`${API_BASE_URL}/employees/${editingId}`, employeeData);

    request
      .then(() => {
        fetchEmployees();
        clearForm();
        showNotification(
          editingId === null
            ? "Employee added successfully."
            : "Employee updated successfully.",
          "success",
        );
        setActivePage("Employees");
      })
      .catch((error) => {
        console.error(error);
        showNotification("Unable to save employee. Please try again.", "error");
      });
  };

  const deleteEmployee = (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    axios
      .delete(`${API_BASE_URL}/employees/${id}`)
      .then(() => {
        fetchEmployees();
        showNotification("Employee deleted successfully.", "success");
      })
      .catch((error) => {
        console.error(error);
        showNotification(
          "Unable to delete employee. Please try again.",
          "error",
        );
      });
  };

  const editEmployee = (employee) => {
    setEmployeeName(employee.name);
    setEmail(employee.email);
    setSalary(employee.salary);
    setPosition(employee.position);
    setOvertimeHours(employee.overtime_hours ?? employee.overtimeHours ?? "");
    setBonus(employee.bonus ?? "");
    setPaidLeaves(employee.paid_leaves ?? employee.paidLeaves ?? "");
    setUnpaidLeaves(employee.unpaid_leaves ?? employee.unpaidLeaves ?? "");
    setHolidays(employee.holidays ?? "");
    setEditingId(employee.id);
    setActivePage("Employees");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const clearForm = () => {
    setEmployeeName("");
    setEmail("");
    setSalary("");
    setPosition("");
    setOvertimeHours("");
    setBonus("");
    setPaidLeaves("");
    setUnpaidLeaves("");
    setHolidays("");
    setEditingId(null);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    try {
      await axios.post(`${API_BASE_URL}/login`, {
        username: loginUsername,
        password: loginPassword,
      });
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("username", loginUsername);
      setIsLoggedIn(true);
      showNotification("Login successful.", "success", 2000);
      setActivePage("Dashboard");
      setLoginPassword("");
    } catch (error) {
      console.error(error);
      setErrorMessage(
        error.response?.data?.detail || "Invalid username or password.",
      );
      setStatusType("error");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    setIsLoggedIn(false);
    setActivePage("Dashboard");
    setSuccessMessage("Logged out successfully.");
    setErrorMessage("");
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
    addEmployee();
  };

  const handleEmployeeFormKeyDown = (event, currentIndex) => {
    const key = event.key;
    if (!["Enter", "ArrowDown", "ArrowUp"].includes(key)) {
      return;
    }

    event.preventDefault();

    const lastIndex = employeeInputRefs.length - 1;

    if (key === "ArrowDown" || key === "Enter") {
      if (currentIndex < lastIndex) {
        employeeInputRefs[currentIndex + 1]?.current?.focus();
        return;
      }
      if (currentIndex === lastIndex && key === "Enter") {
        addEmployee();
      }
      return;
    }

    if (key === "ArrowUp" && currentIndex > 0) {
      employeeInputRefs[currentIndex - 1]?.current?.focus();
    }
  };

  const handleKeyboardShortcuts = (event) => {
    if (event.defaultPrevented) {
      return;
    }

    const activeElement = document.activeElement;
    const tagName = activeElement?.tagName;
    const isTyping =
      tagName === "INPUT" || tagName === "TEXTAREA" || tagName === "SELECT";

    if (event.key === "Escape") {
      clearForm();
      clearSearch();
      event.preventDefault();
      return;
    }

    if (event.shiftKey && event.key === "Enter") {
      setActivePage("Payroll");
      event.preventDefault();
      return;
    }

    if ((event.ctrlKey || event.metaKey) && event.key === "/") {
      setActivePage("Employees");
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
      event.preventDefault();
      return;
    }

    if ((event.key === "ArrowDown" || event.key === "ArrowUp") && !isTyping) {
      const currentIndex = menuItems.indexOf(activePage);
      if (currentIndex !== -1) {
        const nextIndex =
          event.key === "ArrowDown"
            ? (currentIndex + 1) % menuItems.length
            : (currentIndex - 1 + menuItems.length) % menuItems.length;
        setActivePage(menuItems[nextIndex]);
        event.preventDefault();
      }
    }
  };

  const menuItems = [
    "Dashboard",
    "Employees",
    "Payroll",
    "Reports",
    "Settings",
  ];

  useEffect(() => {
    window.addEventListener("keydown", handleKeyboardShortcuts);
    return () => {
      window.removeEventListener("keydown", handleKeyboardShortcuts);
    };
  }, [activePage]);

  const positionSummary = employees.reduce((summary, employee) => {
    const role = employee.position || "Unknown";
    summary[role] = (summary[role] || 0) + 1;
    return summary;
  }, {});

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (!isLoggedIn) {
    return (
      <div className="app">
        <div className="login-screen">
          <div className="login-card">
            <h2>Admin Login</h2>
            {errorMessage && (
              <div className="status-message error">{errorMessage}</div>
            )}
            {successMessage && (
              <div className="status-message success">{successMessage}</div>
            )}
            <form className="login-form" onSubmit={handleLogin}>
              <label>Username</label>
              <input
                type="text"
                placeholder="Enter admin username"
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
              />
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              <button className="primary-btn" type="submit">
                Login
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app-layout">
        <div className="sidebar">
          <div className="sidebar-logo">
            <h1>Smart Payroll</h1>
            <p>Employee Management System</p>
          </div>

          <div className="sidebar-menu">
            {menuItems.map((item) => (
              <div
                key={item}
                className={
                  activePage === item ? "menu-item active-menu" : "menu-item"
                }
                onClick={() => setActivePage(item)}
              >
                {item}
              </div>
            ))}
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div className="main-content">
          <section className="page-header">
            <div className="page-header-info">
              <h1>{activePage}</h1>
              <p>
                Manage payroll, employee records, leave calculations, and
                reports from a modern dashboard.
              </p>
            </div>
          </section>

          {(successMessage || errorMessage) && (
            <div className={`status-message ${statusType}`}>
              {successMessage || errorMessage}
            </div>
          )}

          {activePage === "Dashboard" && (
            <>
              <section className="dashboard-cards">
                <div className="dashboard-card blue-card">
                  <div className="card-top">
                    <div className="icon-bubble blue-bubble">
                      <FaUsers className="card-icon" />
                    </div>
                    <div>
                      <h3>Total Employees</h3>
                      <p className="card-subtext">Active members</p>
                    </div>
                  </div>
                  <div className="card-value">{totalEmployees}</div>
                </div>

                <div className="dashboard-card green-card">
                  <div className="card-top">
                    <div className="icon-bubble green-bubble">
                      <FaMoneyBillWave className="card-icon" />
                    </div>
                    <div>
                      <h3>Total Salary</h3>
                      <p className="card-subtext">Payroll fund</p>
                    </div>
                  </div>
                  <div className="card-value">₹{totalSalary}</div>
                </div>

                <div className="dashboard-card orange-card">
                  <div className="card-top">
                    <div className="icon-bubble orange-bubble">
                      <FaTrophy className="card-icon" />
                    </div>
                    <div>
                      <h3>Highest Salary</h3>
                      <p className="card-subtext">Top earner</p>
                    </div>
                  </div>
                  <div className="card-value">
                    {highestSalaryEmployee
                      ? `₹${highestSalaryEmployee.salary}`
                      : "₹0"}
                  </div>
                  <span className="card-subtext">
                    {highestSalaryEmployee
                      ? highestSalaryEmployee.name
                      : "No Employee"}
                  </span>
                </div>
              </section>

              <section className="quick-actions-section">
                <div className="section-heading">
                  <h2>Quick Actions</h2>
                </div>
                <div className="quick-actions">
                  <button
                    className="action-card action-card-blue"
                    onClick={() => setActivePage("Employees")}
                  >
                    <div className="action-card-left">
                      <div className="action-card-icon action-card-icon-blue">
                        <FaPlus />
                      </div>
                      <div>
                        <div className="action-card-title">Add Employee</div>
                        <div className="action-card-label">
                          Create a new record
                        </div>
                      </div>
                    </div>
                    <FaArrowRight className="action-card-arrow" />
                  </button>
                  <button
                    className="action-card action-card-green"
                    onClick={() => setActivePage("Payroll")}
                  >
                    <div className="action-card-left">
                      <div className="action-card-icon action-card-icon-green">
                        <FaCalculator />
                      </div>
                      <div>
                        <div className="action-card-title">View Payroll</div>
                        <div className="action-card-label">
                          Calculate payouts
                        </div>
                      </div>
                    </div>
                    <FaArrowRight className="action-card-arrow" />
                  </button>
                  <button
                    className="action-card action-card-purple"
                    onClick={() => setActivePage("Reports")}
                  >
                    <div className="action-card-left">
                      <div className="action-card-icon action-card-icon-purple">
                        <FaChartLine />
                      </div>
                      <div>
                        <div className="action-card-title">View Reports</div>
                        <div className="action-card-label">Track metrics</div>
                      </div>
                    </div>
                    <FaArrowRight className="action-card-arrow" />
                  </button>
                </div>

                <div className="recent-card">
                  <div className="section-heading">
                    <h3>Recent Employees</h3>
                  </div>
                  <div className="recent-list">
                    {employees
                      .slice(-3)
                      .reverse()
                      .map((employee) => (
                        <div className="recent-item" key={employee.id}>
                          <div>
                            <strong>{employee.name}</strong>
                            <p>{employee.position || "No role assigned"}</p>
                          </div>
                          <span>₹{employee.salary}</span>
                        </div>
                      ))}
                    {employees.length === 0 && (
                      <p className="empty-state">No recent employees yet.</p>
                    )}
                  </div>
                </div>

                <div className="report-card payroll-overview-card">
                  <div className="section-heading">
                    <h3>Payroll Overview</h3>
                  </div>
                  <div className="overview-grid">
                    <div className="overview-card">
                      <h4>Average Salary</h4>
                      <p>₹{averageSalary}</p>
                    </div>
                    <div className="overview-card">
                      <h4>Total Employees</h4>
                      <p>{totalEmployees}</p>
                    </div>
                    <div className="overview-card">
                      <h4>Highest Paid</h4>
                      <p>
                        {highestSalaryEmployee
                          ? highestSalaryEmployee.name
                          : "No Employee"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {activePage === "Employees" && (
            <div className="main-layout">
              <div className="form-section">
                <form
                  className="form-card"
                  onSubmit={handleFormSubmit}
                  ref={formRef}
                  noValidate
                >
                  <h2>
                    {editingId === null ? "Add Employee" : "Update Employee"}
                  </h2>

                  <label>Employee Name</label>
                  <input
                    ref={employeeNameRef}
                    type="text"
                    placeholder="Enter employee name"
                    value={employeeName}
                    onChange={(e) => setEmployeeName(e.target.value)}
                    onKeyDown={(e) => handleEmployeeFormKeyDown(e, 0)}
                  />

                  <label>Email Address</label>
                  <input
                    ref={emailRef}
                    type="email"
                    placeholder="Enter employee email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => handleEmployeeFormKeyDown(e, 1)}
                  />

                  <label>Base Salary</label>
                  <input
                    ref={salaryRef}
                    type="number"
                    placeholder="Enter base salary"
                    value={salary}
                    onChange={(e) => setSalary(e.target.value)}
                    onKeyDown={(e) => handleEmployeeFormKeyDown(e, 2)}
                  />

                  <label>Position</label>
                  <input
                    ref={positionRef}
                    type="text"
                    placeholder="Enter employee position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    onKeyDown={(e) => handleEmployeeFormKeyDown(e, 3)}
                  />

                  <label>Overtime Hours</label>
                  <input
                    ref={overtimeHoursRef}
                    type="number"
                    placeholder="Enter overtime hours"
                    value={overtimeHours}
                    onChange={(e) => setOvertimeHours(e.target.value)}
                    onKeyDown={(e) => handleEmployeeFormKeyDown(e, 4)}
                  />

                  <label>Bonus</label>
                  <input
                    ref={bonusRef}
                    type="number"
                    placeholder="Enter bonus"
                    value={bonus}
                    onChange={(e) => setBonus(e.target.value)}
                    onKeyDown={(e) => handleEmployeeFormKeyDown(e, 5)}
                  />

                  <label>Paid Leaves</label>
                  <input
                    ref={paidLeavesRef}
                    type="number"
                    placeholder="Enter paid leaves"
                    value={paidLeaves}
                    onChange={(e) => setPaidLeaves(e.target.value)}
                    onKeyDown={(e) => handleEmployeeFormKeyDown(e, 6)}
                  />

                  <label>Unpaid Leaves</label>
                  <input
                    ref={unpaidLeavesRef}
                    type="number"
                    placeholder="Enter unpaid leaves"
                    value={unpaidLeaves}
                    onChange={(e) => setUnpaidLeaves(e.target.value)}
                    onKeyDown={(e) => handleEmployeeFormKeyDown(e, 7)}
                  />

                  <label>Holidays</label>
                  <input
                    ref={holidaysRef}
                    type="number"
                    placeholder="Enter holidays"
                    value={holidays}
                    onChange={(e) => setHolidays(e.target.value)}
                    onKeyDown={(e) => handleEmployeeFormKeyDown(e, 8)}
                  />

                  <button className="primary-btn" type="submit">
                    {editingId === null ? "Add Employee" : "Update Employee"}
                  </button>

                  {editingId !== null && (
                    <button
                      className="cancel-btn"
                      type="button"
                      onClick={clearForm}
                    >
                      Cancel Edit
                    </button>
                  )}
                </form>
              </div>

              <div className="employee-section">
                <div className="employee-header">
                  <h2>Employees</h2>
                  <div className="search-bar">
                    <div className="search-field">
                      <FaSearch className="search-icon" />
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Search name, email or position..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        ref={searchInputRef}
                      />
                    </div>
                    {searchTerm && (
                      <button
                        className="clear-search-btn"
                        onClick={clearSearch}
                      >
                        Clear Search
                      </button>
                    )}
                  </div>
                </div>

                <div className="employee-metrics">
                  <div className="summary-pill">
                    <strong>Matching</strong>
                    <span>
                      {filteredEmployees.length} of {totalEmployees}
                    </span>
                  </div>
                  <div className="summary-pill">
                    <strong>Total Payroll</strong>
                    <span>
                      ₹
                      {filteredEmployees.reduce(
                        (sum, emp) => sum + Number(emp.salary || 0),
                        0,
                      )}
                    </span>
                  </div>
                  <div className="summary-pill">
                    <strong>Unique Roles</strong>
                    <span>{Object.keys(positionSummary).length}</span>
                  </div>
                </div>

                <div className="view-toggle">
                  <button
                    className={
                      viewMode === "cards"
                        ? "toggle-btn active-toggle"
                        : "toggle-btn"
                    }
                    onClick={() => setViewMode("cards")}
                  >
                    <FaIdCard /> Cards
                  </button>

                  <button
                    className={
                      viewMode === "table"
                        ? "toggle-btn active-toggle"
                        : "toggle-btn"
                    }
                    onClick={() => setViewMode("table")}
                  >
                    <FaTable /> Table
                  </button>
                </div>

                {loading ? (
                  <div className="status-message">Loading employees...</div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="status-message">No employees found</div>
                ) : viewMode === "cards" ? (
                  <div className="employee-grid">
                    {filteredEmployees.map((employee) => (
                      <div className="employee-card" key={employee.id}>
                        <div>
                          <h3>{employee.name}</h3>
                          <p>
                            <strong>Email:</strong> {employee.email}
                          </p>
                          <p>
                            <strong>Salary:</strong> ₹{employee.salary}
                          </p>
                          <p>
                            <strong>Position:</strong> {employee.position}
                          </p>
                          <p>
                            <strong>Status:</strong> Active
                          </p>
                        </div>

                        <div className="action-buttons">
                          <button
                            className="edit-btn"
                            onClick={() => editEmployee(employee)}
                          >
                            Edit
                          </button>

                          <button
                            className="delete-btn"
                            onClick={() => deleteEmployee(employee.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="employee-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Salary</th>
                          <th>Position</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredEmployees.map((employee) => (
                          <tr key={employee.id}>
                            <td>{employee.name}</td>
                            <td>{employee.email}</td>
                            <td>₹{employee.salary}</td>
                            <td>{employee.position}</td>
                            <td>Active</td>
                            <td>
                              <div className="table-actions">
                                <button
                                  className="edit-btn"
                                  onClick={() => editEmployee(employee)}
                                >
                                  Edit
                                </button>

                                <button
                                  className="delete-btn"
                                  onClick={() => deleteEmployee(employee.id)}
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {activePage === "Payroll" && (
            <section className="form-card">
              <h2>Payroll Calculator</h2>

              <label>Base Salary</label>
              <input
                type="number"
                placeholder="Enter salary"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
              />

              <label>Overtime Hours</label>
              <input
                type="number"
                placeholder="Enter overtime hours"
                value={overtimeHours}
                onChange={(e) => setOvertimeHours(e.target.value)}
              />

              <label>Bonus</label>
              <input
                type="number"
                placeholder="Enter bonus"
                value={bonus}
                onChange={(e) => setBonus(e.target.value)}
              />

              <div className="field-row">
                <div>
                  <label>Paid Leaves</label>
                  <input
                    type="number"
                    placeholder="Enter paid leaves"
                    value={paidLeaves}
                    onChange={(e) => setPaidLeaves(e.target.value)}
                  />
                </div>
                <div>
                  <label>Unpaid Leaves</label>
                  <input
                    type="number"
                    placeholder="Enter unpaid leaves"
                    value={unpaidLeaves}
                    onChange={(e) => setUnpaidLeaves(e.target.value)}
                  />
                </div>
              </div>

              <label>Holidays</label>
              <input
                type="number"
                placeholder="Enter holidays"
                value={holidays}
                onChange={(e) => setHolidays(e.target.value)}
              />

              <div className="payroll-summary">
                <div className="payroll-value">
                  <strong>Overtime Pay</strong>
                  <span>₹{overtimePay}</span>
                </div>
                <div className="payroll-value">
                  <strong>Holiday Allowance</strong>
                  <span>₹{holidayAllowance}</span>
                </div>
                <div className="payroll-value">
                  <strong>Unpaid Deduction</strong>
                  <span>₹{unpaidDeduction}</span>
                </div>
                <div className="payroll-value">
                  <strong>Estimated Payroll</strong>
                  <span>₹{estimatedPayroll}</span>
                </div>
              </div>
            </section>
          )}

          {activePage === "Reports" && (
            <section className="reports-page">
              <div className="reports-summary-cards">
                <article className="report-card report-summary-card report-summary-blue">
                  <div className="report-card-left">
                    <div className="report-card-icon total-employees">
                      <FaUsers />
                    </div>
                    <div>
                      <h3 className="report-card-title">Total Employees</h3>
                      <p className="report-card-meta">Total active employees</p>
                    </div>
                  </div>
                  <div className="report-card-value">{totalEmployees}</div>
                </article>

                <article className="report-card report-summary-card report-summary-green">
                  <div className="report-card-left">
                    <div className="report-card-icon total-payroll">
                      <FaMoneyBillWave />
                    </div>
                    <div>
                      <h3 className="report-card-title">Total Payroll</h3>
                      <p className="report-card-meta">Total payroll amount</p>
                    </div>
                  </div>
                  <div className="report-card-value">₹{totalSalary}</div>
                </article>

                <article className="report-card report-summary-card report-summary-purple">
                  <div className="report-card-left">
                    <div className="report-card-icon average-salary">
                      <FaGift />
                    </div>
                    <div>
                      <h3 className="report-card-title">Average Salary</h3>
                      <p className="report-card-meta">
                        Average salary across all employees
                      </p>
                    </div>
                  </div>
                  <div className="report-card-value">₹{averageSalary}</div>
                </article>

                <article className="report-card report-summary-card report-summary-orange">
                  <div className="report-card-left">
                    <div className="report-card-icon active-roles">
                      <FaClock />
                    </div>
                    <div>
                      <h3 className="report-card-title">Active Roles</h3>
                      <p className="report-card-meta">
                        Total active roles in system
                      </p>
                    </div>
                  </div>
                  <div className="report-card-value">
                    {Object.keys(positionSummary).length}
                  </div>
                </article>
              </div>

              <section className="top-positions-card">
                <div className="top-positions-header">
                  <div>
                    <h3>Top Positions</h3>
                    <p>Most common roles by headcount</p>
                  </div>
                </div>
                <div className="positions-table">
                  <div className="positions-table-row positions-table-heading">
                    <span>Rank</span>
                    <span>Position</span>
                    <span>No. of Employees</span>
                  </div>
                  {Object.entries(positionSummary)
                    .sort((a, b) => b[1] - a[1])
                    .map(([role, count], index) => (
                      <div className="positions-table-row" key={role}>
                        <span className="position-rank">{index + 1}</span>
                        <span>{role}</span>
                        <strong>{count}</strong>
                      </div>
                    ))}
                </div>
                <div className="top-positions-action">
                  <button
                    className="view-all-btn"
                    onClick={() => setActivePage("Employees")}
                  >
                    View all employees
                  </button>
                </div>
              </section>
            </section>
          )}

          {activePage === "Settings" && (
            <div className="form-card">
              <h2>System Settings</h2>
              <p className="status-message">
                Smart Payroll is connected with React, FastAPI and MySQL.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
