import psycopg2

try:
    conn = psycopg2.connect(user="postgres", password="2005", host="localhost", port="5432", dbname="queueless_db")
    conn.autocommit = True
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS orders (
            order_id VARCHAR PRIMARY KEY,
            user_id VARCHAR NOT NULL,
            shop_id INTEGER NOT NULL REFERENCES shops(shop_id),
            file_path VARCHAR NOT NULL,
            copies INTEGER DEFAULT 1 NOT NULL,
            print_type VARCHAR DEFAULT 'bw' NOT NULL,
            status VARCHAR DEFAULT 'queued' NOT NULL,
            queue_number INTEGER NOT NULL,
            addons JSON DEFAULT '[]'::json NOT NULL,
            total_cost REAL DEFAULT 0.0 NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
        );
        CREATE INDEX IF NOT EXISTS ix_orders_user_id ON orders (user_id);
        CREATE INDEX IF NOT EXISTS ix_orders_order_id ON orders (order_id);
    """)
    print("Table orders created successfully.")
    cursor.close()
    conn.close()
except Exception as e:
    print(f"Error creating table: {e}")
