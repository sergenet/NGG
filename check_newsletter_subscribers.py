#!/usr/bin/env python3
"""Check GardenWithSerge newsletter subscribers"""

import mysql.connector
from datetime import datetime
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv("C:\\gardenwithserge-website\\.env")

# Database connection
db = mysql.connector.connect(
    host="localhost",
    user=os.getenv("DB_USER", "sergbcqk_gardenwithserge_user"),
    password=os.getenv("DB_PASSWORD", ""),
    database=os.getenv("DB_NAME", "sergbcqk_gardenwithserge_db")
)

cursor = db.cursor(dictionary=True)

print("\n" + "="*60)
print("GARDENWITHSERGE NEWSLETTER SUBSCRIBERS")
print("="*60)
print(f"Checked at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")

# Total subscribers
cursor.execute("SELECT COUNT(*) as total FROM newsletter_subscribers")
total = cursor.fetchone()['total']
print(f"📊 Total Subscribers: {total}")

# Active subscribers
cursor.execute("SELECT COUNT(*) as active FROM newsletter_subscribers WHERE active = 1")
active = cursor.fetchone()['active']
print(f"✅ Active: {active}")

# Inactive subscribers
cursor.execute("SELECT COUNT(*) as inactive FROM newsletter_subscribers WHERE active = 0")
inactive = cursor.fetchone()['inactive']
print(f"❌ Unsubscribed: {inactive}")

# Last newsletter sent
cursor.execute("""
    SELECT MAX(DATE(created_at)) as last_sent, COUNT(*) as count_sent
    FROM newsletter_log
""")
result = cursor.fetchone()
last_sent = result['last_sent'] if result['last_sent'] else "Never"
print(f"📧 Last Newsletter Sent: {last_sent}")

# Recent subscriptions (last 7 days)
cursor.execute("""
    SELECT COUNT(*) as recent
    FROM newsletter_subscribers
    WHERE DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
""")
recent = cursor.fetchone()['recent']
print(f"🆕 New Subscribers (Last 7 Days): {recent}")

# Recent unsubscribes (last 7 days)
cursor.execute("""
    SELECT COUNT(*) as recent_unsub
    FROM newsletter_subscribers
    WHERE active = 0 AND DATE(updated_at) >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
""")
recent_unsub = cursor.fetchone()['recent_unsub']
print(f"👋 Unsubscribed (Last 7 Days): {recent_unsub}")

print("\n" + "-"*60)
print("RECENT SUBSCRIBERS:")
print("-"*60)
cursor.execute("""
    SELECT email, language, DATE_FORMAT(created_at, '%Y-%m-%d %H:%i') as signed_up
    FROM newsletter_subscribers
    WHERE active = 1
    ORDER BY created_at DESC
    LIMIT 10
""")
subscribers = cursor.fetchall()
for sub in subscribers:
    print(f"  • {sub['email']} ({sub['language']}) - {sub['signed_up']}")

if not subscribers:
    print("  (No active subscribers yet)")

cursor.close()
db.close()

print("\n" + "="*60)
input("Press Enter to close...")
