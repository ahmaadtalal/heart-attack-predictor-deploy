# --- START create_tables.py ---
import sys
from sqlalchemy import create_engine
import models # Assumes this is correct now
from database import Base # Only import Base, not engine

# 1. Check if the connection URL was provided
if len(sys.argv) < 2:
    print("Error: Please provide the database connection URL as an argument.")
    print("Usage: python create_tables.py \"<NEON_CONNECTION_URL>\"")
    sys.exit(1)

# 2. Get the Neon URL from the command line argument
NEON_DATABASE_URL = sys.argv[1]

# 3. Create a NEW engine using the Neon URL
# We use echo=True to see the SQL commands being run, which is helpful for debugging
neon_engine = create_engine(NEON_DATABASE_URL, echo=True)

print(f"Attempting to create tables on: {NEON_DATABASE_URL}")

# 4. Create all tables in the database using the new NEON engine
Base.metadata.create_all(bind=neon_engine)

print("--- Tables created successfully on NEON! ---")
# --- END create_tables.py ---