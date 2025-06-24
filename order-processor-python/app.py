from flask import Flask, request, jsonify
import psycopg2
import os
import time

app = Flask(__name__)

# ✅ Wait and connect to PostgreSQL
def wait_for_postgres():
    for attempt in range(10):
        try:
            conn = psycopg2.connect(
                host=os.environ.get("PGHOST", "postgres"),
                port=os.environ.get("PGPORT", "5432"),
                database=os.environ.get("PGDATABASE", "emartdb"),
                user=os.environ.get("PGUSER", "emartuser"),
                password=os.environ.get("PGPASSWORD", "emartpass")
            )
            print("✅ Connected to Postgres")
            return conn
        except Exception as e:
            print(f"⏳ Attempt {attempt+1}/10: Waiting for Postgres... {e}")
            time.sleep(2)
    raise Exception("❌ Could not connect to Postgres after retries")

conn = wait_for_postgres()

# ✅ Create users table and seed it
cursor = conn.cursor()
cursor.execute("""
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(100)
)
""")
cursor.execute("SELECT COUNT(*) FROM users")
if cursor.fetchone()[0] == 0:
    cursor.execute("""
    INSERT INTO users (id, name, email, password) VALUES
    ('u1', 'Alice', 'alice@example.com', 'pass123')
    """)
    print("🧑‍💻 Default user seeded")
conn.commit()
cursor.close()

# ✅ User Login Route
@app.route("/validateuser", methods=["POST"])
def validate_user():
    data = request.json
    user_id = data.get("user_id")
    password = data.get("password")

    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = %s AND password = %s", (user_id, password))
    user = cursor.fetchone()
    cursor.close()

    print("🔐 VALIDATE:", user_id, password, "FOUND" if user else "NOT FOUND")

    if user:
        return jsonify({"status": "success", "user": user_id})
    else:
        return jsonify({"status": "failed"}), 401

# ✅ Submit Order Route (updated to accept multiple items)
@app.route("/submitorder", methods=["POST"])
def submit_order():
    data = request.json
    user_id = data.get("user_id")
    items = data.get("items", [])
    total_amount = data.get("total", 0.0)

    if not user_id or not items:
        return jsonify({"status": "failed", "message": "Missing user_id or items"}), 400

    cursor = conn.cursor()

    # Ensure orders table exists
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            id SERIAL PRIMARY KEY,
            user_id TEXT,
            product_id TEXT,
            name TEXT,
            quantity INTEGER,
            price NUMERIC,
            total_amount NUMERIC,
            order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    for item in items:
        product_id = item.get("product_id")
        name = item.get("name")
        quantity = item.get("quantity", 1)
        price = item.get("price", 0.0)

        cursor.execute("""
            INSERT INTO orders (user_id, product_id, name, quantity, price, total_amount)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (user_id, product_id, name, quantity, price, total_amount))

    conn.commit()
    cursor.close()

    print("✅ ORDER ADDED:", user_id, len(items), "items, Total:", total_amount)
    return jsonify({"status": "success", "message": "Order recorded"}), 200

# ✅ Start Flask
if __name__ == "__main__":
    print("🚀 Starting Flask on port 5002")
    app.run(host="0.0.0.0", port=5002)

