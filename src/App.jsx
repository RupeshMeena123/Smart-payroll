import "./App.css";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaUsers,
  FaMoneyBillWave,
  FaTrophy,
  FaGift,
  FaClock,
  FaUserMinus,
  FaSearch,
  FaTable,
  FaIdCard,
} from "react-icons/fa";

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
  const totalEmployees = employees.length;

  const totalSalary = employees.reduce(
    (sum, employee) => sum + Number(employee.salary),
    0,
  );

  const highestSalaryEmployee =
    employees.length > 0
      ? employees.reduce((highest, employee) =>
          Number(employee.salary) > Number(highest.salary) ? employee : highest,
        )
      : null;

  const overtimePay = Number(overtimeHours || 0) * 250;
  const unpaidDeduction = Number(unpaidLeaves || 0) * 500;
  const estimatedPayroll =
    Number(salary || 0) + Number(bonus || 0) + overtimePay - unpaidDeduction;

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = () => {
    setLoading(true);

    axios
      .get("http://127.0.0.1:8000/employees")
      .then((response) => {
        setEmployees(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setLoading(false);
      });
  };

  const addEmployee = () => {
    if (employeeName.trim() === "") {
      alert("Employee name is required");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      alert("Please enter a valid email");
      return;
    }

    if (salary <= 0) {
      alert("Salary must be greater than 0");
      return;
    }

    if (position.trim() === "") {
      alert("Position is required");
      return;
    }

    const employeeData = {
      name: employeeName,
      email: email,
      salary: salary,
      position: position,
    };

    if (editingId === null) {
      axios
        .post("http://127.0.0.1:8000/employees", employeeData)
        .then(() => {
          fetchEmployees();
          clearForm();
          setSuccessMessage("Employee added successfully");
          setTimeout(() => setSuccessMessage(""), 3000);
          setActivePage("Employees");
        })
        .catch((error) => console.log(error));
    } else {
      axios
        .put(`http://127.0.0.1:8000/employees/${editingId}`, employeeData)
        .then(() => {
          fetchEmployees();
          clearForm();
          setSuccessMessage("Employee updated successfully");
          setTimeout(() => setSuccessMessage(""), 3000);
          setActivePage("Employees");
        })
        .catch((error) => console.log(error));
    }
  };

  const deleteEmployee = (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?")) {
      return;
    }

    axios
      .delete(`http://127.0.0.1:8000/employees/${id}`)
      .then(() => {
        fetchEmployees();
        setSuccessMessage("Employee deleted successfully");
        setTimeout(() => setSuccessMessage(""), 3000);
      })
      .catch((error) => console.log(error));
  };

  const editEmployee = (employee) => {
    setEmployeeName(employee.name);
    setEmail(employee.email);
    setSalary(employee.salary);
    setPosition(employee.position);
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

  const filteredEmployees = employees.filter(
    (employee) =>
      employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const menuItems = [
    "Dashboard",
    "Employees",
    "Payroll",
    "Reports",
    "Settings",
  ];

  return (
    <div className="app">
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
      </div>

      <div className="main-content">
        <div className="top-header">
          <div>
            <h1>{activePage}</h1>
            <p>
              Manage employees, salary, leaves, bonuses and payroll reports.
            </p>
          </div>
        </div>

        {successMessage && (
          <div className="status-message">{successMessage}</div>
        )}

        {activePage === "Dashboard" && (
          <>
            <section className="dashboard-section">
              <div className="dashboard-card blue-card">
                <div className="card-top">
                  <FaUsers className="card-icon" />
                  <h3>Total Employees</h3>
                </div>
                <div className="card-value">{totalEmployees}</div>
              </div>

              <div className="dashboard-card green-card">
                <div className="card-top">
                  <FaMoneyBillWave className="card-icon" />
                  <h3>Total Salary</h3>
                </div>
                <div className="card-value">₹{totalSalary}</div>
              </div>

              <div className="dashboard-card orange-card">
                <div className="card-top">
                  <FaTrophy className="card-icon" />
                  <h3>Highest Salary</h3>
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
          </>
        )}

        {activePage === "Employees" && (
          <div className="main-layout">
            <div className="form-section">
              <div className="form-card">
                <h2>
                  {editingId === null ? "Add Employee" : "Update Employee"}
                </h2>

                <label>Employee Name</label>
                <input
                  type="text"
                  placeholder="Enter employee name"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                />

                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="Enter employee email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <label>Base Salary</label>
                <input
                  type="number"
                  placeholder="Enter base salary"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                />

                <label>Position</label>
                <input
                  type="text"
                  placeholder="Enter employee position"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                />

                <button className="primary-btn" onClick={addEmployee}>
                  {editingId === null ? "Add Employee" : "Update Employee"}
                </button>

                {editingId !== null && (
                  <button className="cancel-btn" onClick={clearForm}>
                    Cancel Edit
                  </button>
                )}
              </div>
            </div>

            <div className="employee-section">
              <div className="employee-header">
                <h2>Employees</h2>

                <div>
                  <div style={{ position: "relative" }}>
                    <FaSearch
                      style={{
                        position: "absolute",
                        top: "16px",
                        left: "14px",
                        color: "#64748b",
                      }}
                    />
                    <input
                      type="text"
                      className="search-input"
                      style={{ paddingLeft: "42px" }}
                      placeholder="Search name, email or position..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                      <button
                        className="clear-search-btn"
                        onClick={() => setSearchTerm("")}
                      >
                        Clear Search
                      </button>
                    )}
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
                </div>
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
          <div className="form-card">
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

            <label>Paid Leaves</label>
            <input
              type="number"
              placeholder="Enter paid leaves"
              value={paidLeaves}
              onChange={(e) => setPaidLeaves(e.target.value)}
            />

            <label>Unpaid Leaves</label>
            <input
              type="number"
              placeholder="Enter unpaid leaves"
              value={unpaidLeaves}
              onChange={(e) => setUnpaidLeaves(e.target.value)}
            />

            <label>Holidays</label>
            <input
              type="number"
              placeholder="Enter holidays"
              value={holidays}
              onChange={(e) => setHolidays(e.target.value)}
            />

            <div className="status-message">
              Estimated Payroll: ₹{estimatedPayroll}
            </div>
          </div>
        )}

        {activePage === "Reports" && (
          <section className="dashboard-section">
            <div className="dashboard-card blue-card">
              <div className="card-top">
                <FaClock className="card-icon" />
                <h3>Overtime Pay</h3>
              </div>
              <div className="card-value">₹{overtimePay}</div>
            </div>

            <div className="dashboard-card green-card">
              <div className="card-top">
                <FaGift className="card-icon" />
                <h3>Bonus</h3>
              </div>
              <div className="card-value">₹{Number(bonus || 0)}</div>
            </div>

            <div className="dashboard-card orange-card">
              <div className="card-top">
                <FaUserMinus className="card-icon" />
                <h3>Unpaid Deduction</h3>
              </div>
              <div className="card-value">₹{unpaidDeduction}</div>
            </div>
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
  );
}

export default App;
