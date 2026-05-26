import os

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import mysql.connector

app = FastAPI()

allowed_origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost",
    "http://127.0.0.1",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


db = mysql.connector.connect(
    host=os.getenv("DB_HOST", "localhost"),
    user=os.getenv("DB_USER", "root"),
    password=os.getenv("DB_PASSWORD", "(MySQL189.)"),
    database=os.getenv("DB_NAME", "smart_payroll"),
)

cursor = db.cursor(dictionary=True)

class Employee(BaseModel):
    name: str
    email: str
    salary: int
    position: str
    overtime_hours: int = 0
    bonus: int = 0
    paid_leaves: int = 0
    unpaid_leaves: int = 0
    holidays: int = 0

class LoginRequest(BaseModel):
    username: str
    password: str

@app.get("/")
def home():
    return {"message": "Smart Payroll Backend Running"}

@app.get("/employees")
def get_employees():

    cursor.execute("SELECT * FROM employees")

    employees = cursor.fetchall()

    return employees

@app.post("/login")
def login(request: LoginRequest):
    sql = "SELECT * FROM admin WHERE username = %s AND password = %s"
    values = (request.username, request.password)
    cursor.execute(sql, values)
    admin = cursor.fetchone()
    if not admin:
        raise HTTPException(status_code=401, detail="Invalid username or password")
    return {"message": "Login successful"}

@app.post("/employees")
def add_employee(employee: Employee):

    sql = """
      INSERT INTO employees (
        name,
        email,
        salary,
        position,
        overtime_hours,
        bonus,
        paid_leaves,
        unpaid_leaves,
        holidays
      )
      VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
      """

    values = (
        employee.name,
        employee.email,
        employee.salary,
        employee.position,
        employee.overtime_hours,
        employee.bonus,
        employee.paid_leaves,
        employee.unpaid_leaves,
        employee.holidays,
    )

    cursor.execute(sql, values)
    db.commit()

    return {
        "message": "Employee added successfully"
    }


@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int):

    sql = "DELETE FROM employees WHERE id = %s"

    values = (employee_id,)

    cursor.execute(sql, values)

    db.commit()

    return {
        "message": "Employee deleted successfully"
    }

@app.put("/employees/{id}")
def update_employee(id: int, employee: Employee):

    sql = """
    UPDATE employees
    SET name = %s,
        email = %s,
        salary = %s,
        position = %s,
        overtime_hours = %s,
        bonus = %s,
        paid_leaves = %s,
        unpaid_leaves = %s,
        holidays = %s
    WHERE id = %s
    """

    values = (
        employee.name,
        employee.email,
        employee.salary,
        employee.position,
        employee.overtime_hours,
        employee.bonus,
        employee.paid_leaves,
        employee.unpaid_leaves,
        employee.holidays,
        id,
    )

    cursor.execute(sql, values)

    db.commit()

    return {
        "message": "Employee updated successfully"
    }