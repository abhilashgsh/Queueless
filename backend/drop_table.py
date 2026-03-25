import psycopg2

try:
    conn = psycopg2.connect(user="postgres", password="2005", host="localhost", port="5432", dbname="queueless_db")
    conn.autocommit = True
    cursor = conn.cursor()
    cursor.execute("DROP TABLE orders CASCADE;")
    print("Table orders dropped successfully.")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error dropping table: {e}")
