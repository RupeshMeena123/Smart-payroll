CREATE DATABASE IF NOT EXISTS smart_payroll;
USE smart_payroll;

CREATE TABLE IF NOT EXISTS employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100),
  email VARCHAR(100),
  salary INT,
  position VARCHAR(100),
  overtime_hours INT DEFAULT 0,
  bonus INT DEFAULT 0,
  paid_leaves INT DEFAULT 0,
  unpaid_leaves INT DEFAULT 0,
  holidays INT DEFAULT 0
);
