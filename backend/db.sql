CREATE DATABASE smart_payroll;

USE smart_payroll;

CREATE TABLE employee (
id INT PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(50)
);

SELECT * FROM employee;

USE smart_payroll;

SHOW TABLES;

RENAME TABLE employee TO employees;

SELECT * FROM employees;

ALTER TABLE employees
MODIFY name VARCHAR(100);

ALTER TABLE employees
ADD email VARCHAR(100),
ADD salary INT,
ADD position VARCHAR(100);