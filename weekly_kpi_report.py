# weekly_kpi_report.py

import mysql.connector
import argparse

# Parse arguments
parser = argparse.ArgumentParser(description="Generate weekly KPI report.")
parser.add_argument("--db", action="store_true", help="Use database connection")
parser.add_argument("--host", type=str, required=True, help="Database host")
parser.add_argument("--port", type=int, required=True, help="Database port")
args = parser.parse_args()

# Connect to the database
if args.db:
    try:
        connection = mysql.connector.connect(
            host=args.host,
            port=args.port,
            user="your_user",
            password="your_password",
            database="your_database"
        )
        cursor = connection.cursor()

        # Example query
        cursor.execute("SELECT COUNT(*) FROM newsletter_subscribers")
        total_subscribers = cursor.fetchone()[0]
        print(f"Total Subscribers: {total_subscribers}")

        cursor.close()
        connection.close()
    except mysql.connector.Error as err:
        print(f"Error: {err}")
else:
    print("Database connection not enabled. Use --db flag.")