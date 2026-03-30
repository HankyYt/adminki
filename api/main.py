import os
from contextlib import asynccontextmanager
from decimal import Decimal
from typing import Any

import psycopg2
from psycopg2 import IntegrityError
from bson import ObjectId
from fastapi import FastAPI, HTTPException, Response, status
from pydantic import BaseModel, ConfigDict, Field
from pymongo import MongoClient


postgres_connection = None
mongo_client = None
mongo_db = None


def get_postgres_dsn() -> str:
    return (
        f"host={os.getenv('POSTGRES_HOST', 'postgres')} "
        f"port={os.getenv('POSTGRES_PORT', '5432')} "
        f"dbname={os.getenv('POSTGRES_DB', 'shop')} "
        f"user={os.getenv('POSTGRES_APP_USER', os.getenv('POSTGRES_USER', 'app_user'))} "
        f"password={os.getenv('POSTGRES_APP_PASSWORD', os.getenv('POSTGRES_PASSWORD', 'app_password'))}"
    )


def get_mongo_uri() -> str:
    username = os.getenv("MONGO_APP_USERNAME", os.getenv("MONGO_INITDB_ROOT_USERNAME", "braga"))
    password = os.getenv("MONGO_APP_PASSWORD", os.getenv("MONGO_INITDB_ROOT_PASSWORD", "012"))
    host = os.getenv("MONGO_HOST", "mongo")
    port = os.getenv("MONGO_PORT", "27017")
    database = os.getenv("MONGO_DB", "buterbro")
    return f"mongodb://{username}:{password}@{host}:{port}/{database}?authSource={database}"


def decimal_to_float(value: Any) -> Any:
    if isinstance(value, Decimal):
        return float(value)
    return value


def serialize_mongo_document(document: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(document["_id"]),
        "name": document["name"],
        "description": document["description"],
        "price": float(document["price"]),
        "is_available": document["is_available"],
        "calories": document["calories"],
        "category_id": str(document["category_id"]),
    }


class ProductCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    description: str
    price: float = Field(ge=0)
    is_available: bool = True
    calories: int = Field(ge=0)
    category_id: str


class ProductRead(BaseModel):
    id: str
    name: str
    description: str
    price: float
    is_available: bool
    calories: int
    category_id: str


class EmployeeCreate(BaseModel):
    full_name: str
    position: str | None = None
    contacts: str | None = None
    experience: int | None = Field(default=None, ge=0)
    salary: float | None = Field(default=None, ge=0)
    info: str | None = None
    workplace: str | None = None
    age: int | None = Field(default=None, ge=0)


class EmployeeRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    employee_id: int
    full_name: str
    position: str | None
    contacts: str | None
    experience: int | None
    salary: float | None
    info: str | None
    workplace: str | None
    age: int | None


class BranchRead(BaseModel):
    establishment_id: int
    city_id: int
    type_id: int
    address: str
    postal_code: str | None
    phone: str | None
    employees_count: int | None
    income: float | None
    free_seats: int | None
    info: str | None


@asynccontextmanager
async def lifespan(_: FastAPI):
    global postgres_connection, mongo_client, mongo_db

    postgres_connection = psycopg2.connect(get_postgres_dsn())
    postgres_connection.autocommit = True

    mongo_client = MongoClient(get_mongo_uri())
    mongo_db = mongo_client[os.getenv("MONGO_DB", "buterbro")]

    try:
        yield
    finally:
        if postgres_connection is not None:
            postgres_connection.close()
        if mongo_client is not None:
            mongo_client.close()


app = FastAPI(
    title="ButerBro API",
    description="API for products in MongoDB and employees/branches in PostgreSQL.",
    version="1.0.0",
    lifespan=lifespan,
)


@app.get("/")
async def root():
    return {
        "message": "ButerBro API",
        "endpoints": {
            "products": ["/products", "/products/{product_id}"],
            "employees": ["/employees", "/employees/{employee_id}"],
            "branches": ["/branches"],
        },
    }


@app.get("/health")
async def healthcheck():
    if postgres_connection is None or mongo_db is None:
        raise HTTPException(status_code=503, detail="Database connections are not ready")

    with postgres_connection.cursor() as cursor:
        cursor.execute("SELECT 1")
        cursor.fetchone()

    mongo_db.command("ping")
    return {"status": "ok"}


@app.get("/products", response_model=list[ProductRead])
async def get_products():
    products = mongo_db.dishes.find().sort("name", 1)
    return [serialize_mongo_document(product) for product in products]


@app.post("/products", response_model=ProductRead, status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate):
    try:
        category_id = ObjectId(product.category_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid category_id") from exc

    if mongo_db.categories.find_one({"_id": category_id}) is None:
        raise HTTPException(status_code=404, detail="Category not found")

    payload = {
        "category_id": category_id,
        "name": product.name,
        "description": product.description,
        "price": float(product.price),
        "is_available": product.is_available,
        "calories": product.calories,
    }
    result = mongo_db.dishes.insert_one(payload)
    created = mongo_db.dishes.find_one({"_id": result.inserted_id})
    return serialize_mongo_document(created)


@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(product_id: str):
    try:
        object_id = ObjectId(product_id)
    except Exception as exc:
        raise HTTPException(status_code=400, detail="Invalid product id") from exc

    result = mongo_db.dishes.delete_one({"_id": object_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Product not found")

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/employees", response_model=list[EmployeeRead])
async def get_employees():
    with postgres_connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT employee_id, full_name, position, contacts, experience, salary, info, workplace, age
            FROM employee
            ORDER BY employee_id
            """
        )
        rows = cursor.fetchall()

    return [
        {
            "employee_id": row[0],
            "full_name": row[1],
            "position": row[2],
            "contacts": row[3],
            "experience": row[4],
            "salary": decimal_to_float(row[5]),
            "info": row[6],
            "workplace": row[7],
            "age": row[8],
        }
        for row in rows
    ]


@app.post("/employees", response_model=EmployeeRead, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    with postgres_connection.cursor() as cursor:
        cursor.execute(
            """
            INSERT INTO employee (full_name, position, contacts, experience, salary, info, workplace, age)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            RETURNING employee_id, full_name, position, contacts, experience, salary, info, workplace, age
            """,
            (
                employee.full_name,
                employee.position,
                employee.contacts,
                employee.experience,
                employee.salary,
                employee.info,
                employee.workplace,
                employee.age,
            ),
        )
        row = cursor.fetchone()

    return {
        "employee_id": row[0],
        "full_name": row[1],
        "position": row[2],
        "contacts": row[3],
        "experience": row[4],
        "salary": decimal_to_float(row[5]),
        "info": row[6],
        "workplace": row[7],
        "age": row[8],
    }


@app.delete("/employees/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(employee_id: int):
    try:
        with postgres_connection.cursor() as cursor:
            cursor.execute("DELETE FROM employee WHERE employee_id = %s", (employee_id,))
            if cursor.rowcount == 0:
                raise HTTPException(status_code=404, detail="Employee not found")
    except IntegrityError as exc:
        raise HTTPException(
            status_code=409,
            detail="Employee cannot be deleted because related records exist",
        ) from exc

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.get("/branches", response_model=list[BranchRead])
async def get_branches():
    with postgres_connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT
                establishment_id,
                city_id,
                type_id,
                address,
                postal_code,
                phone,
                employees_count,
                income,
                free_seats,
                info
            FROM establishment
            ORDER BY establishment_id
            """
        )
        rows = cursor.fetchall()

    return [
        {
            "establishment_id": row[0],
            "city_id": row[1],
            "type_id": row[2],
            "address": row[3],
            "postal_code": row[4],
            "phone": row[5],
            "employees_count": row[6],
            "income": decimal_to_float(row[7]),
            "free_seats": row[8],
            "info": row[9],
        }
        for row in rows
    ]
