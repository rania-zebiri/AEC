#!/usr/bin/env python
"""Test database connection"""
import psycopg2
import os

# Use the credentials from docker-compose.yml
conn_params = {
    "host": "localhost",
    "port": 5432,
    "database": "seismic_risk_portfolio",
    "user": "postgres",
    "password": "nouha@20"
}

try:
    conn = psycopg2.connect(**conn_params)
    print("✅ Connected to database successfully!")
    
    cur = conn.cursor()
    cur.execute("SELECT version();")
    version = cur.fetchone()
    print(f"PostgreSQL version: {version[0][:50]}...")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Connection failed: {e}")
    print("\nMake sure:")
    print("1. Docker Desktop is running")
    print("2. Run 'docker-compose up -d'")
    print("3. Wait for PostgreSQL to start")