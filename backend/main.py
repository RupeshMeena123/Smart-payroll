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
    "https://smart-payroll-rho.vercel.app",
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    allowed_origins.append(frontend_url)

# Production-safe: allow the main Vercel production domain plus all Vercel preview deployments.
allowed_origins_regex = r"https://.*\.vercel\.app"

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=allowed_origins_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def log_cors_origin(request, call_next):
    origin = request.headers.get("origin")
    if origin:
        print(f"[CORS] Origin: {origin}")
        print(f"[CORS] Allowed origins: {allowed_origins}")
        print(f"[CORS] Allowed regex: {allowed_origins_regex}")
    return await call_next(request)


from urllib.parse import urlparse

mysql_url = os.getenv("MYSQL_URL")
if mysql_url:
    parsed_url = urlparse(mysql_url)
    db_host = parsed_url.hostname or "localhost"
    db_port = parsed_url.port or 3306
    db_user = parsed_url.username or os.getenv("DB_USER", "root")
    db_password = parsed_url.password or os.getenv("DB_PASSWORD", "(MySQL189.)")
    db_name = parsed_url.path.lstrip("/") or os.getenv("DB_NAME", "smart_payroll")
else:
    db_host = os.getenv("DB_HOST", "localhost")
    db_port = int(os.getenv("DB_PORT", 3306))
    db_user = os.getenv("DB_USER", "root")
    db_password = os.getenv("DB_PASSWORD", "(MySQL189.)")
    db_name = os.getenv("DB_NAME", "smart_payroll")

print(f"[DEBUG] Connecting to database host={db_host} port={db_port} user={db_user} db={db_name}")

db = mysql.connector.connect(
    host=db_host,
    port=db_port,
    user=db_user,
    password=db_password,
    database=db_name,
)

cursor = db.cursor(dictionary=True)

# Ensure the employees table exists in the deployed database.
# This is a minimal safe startup fix for missing schema on Render/Clever Cloud.
cursor.execute(
    """
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
    )
    """
)
db.commit()

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
    print(f"[DEBUG] Received login request: username={request.username}, password={request.password}")
    sql = "SELECT * FROM admin WHERE username = %s AND password = %s"
    values = (request.username, request.password)
    cursor.execute(sql, values)
    admin = cursor.fetchone()
    print(f"[DEBUG] Login query result: {admin}")

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