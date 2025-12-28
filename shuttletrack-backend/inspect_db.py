import sqlite3
from pathlib import Path

db_path = Path("shuttle.db").resolve()
print("Using DB:", db_path)

conn = sqlite3.connect(db_path)
cur = conn.cursor()

# Show all tables
print("\nTables in DB:")
for row in cur.execute("SELECT name FROM sqlite_master WHERE type='table';"):
    print(" -", row[0])

# Show some rows from important tables
for t in ("user", "bus", "route", "stop", "feedback", "announcement"):
    try:
        rows = cur.execute(f"SELECT * FROM {t} LIMIT 10").fetchall()
        print(f"\n== {t.upper()} ({len(rows)} rows shown) ==")
        for r in rows:
            print(r)
    except Exception as e:
        print(f"\n== {t.upper()} == (not present or error: {e})")

conn.close()
