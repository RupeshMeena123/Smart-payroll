from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import mysql.connector

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="(MySQL189.)",
    database="smart_payroll"
)

cursor = db.cursor(dictionary=True)

@app.get("/")
def home():
    return {"message": "Smart Payroll Backend Running"}

@app.get("/employees")
def get_employees():

    cursor.execute("SELECT * FROM employees")

    employees = cursor.fetchall()

    return employees

@app.post("/employees")
def add_employee(employee: dict):

    sql = """
      INSERT INTO employees (name, email, salary, position)
      VALUES (%s, %s, %s, %s)
      """

    values = (
     employee["name"],
     employee["email"],
     employee["salary"],
     employee["position"]
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
def update_employee(id: int, employee: dict):

    sql = """
    UPDATE employees
    SET name = %s,
        email = %s,
        salary = %s,
        position = %s
    WHERE id = %s
    """

    values = (
        employee["name"],
        employee["email"],
        employee["salary"],
        employee["position"],
        id
    )

    cursor.execute(sql, values)

    db.commit()

    return {
        "message": "Employee updated successfully"
    }