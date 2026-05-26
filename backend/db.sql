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

CREATE TABLE IF NOT EXISTS admins (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(100)
);

INSERT INTO admins (username, password)
SELECT 'admin', 'admin123'
FROM DUAL
WHERE NOT EXISTS (
  SELECT 1 FROM admins WHERE username = 'admin'
);
