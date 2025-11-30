# --- START database.py modifications ---

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os # <-- Make sure this line is included

# 1. Read the URL from the environment variable (used by Render)
DATABASE_URL = os.environ.get("DATABASE_URL")

# 2. If the environment variable isn't set (i.e., you are testing locally), use the local fallback.
if not DATABASE_URL:
    DATABASE_URL = "postgresql://m1:722005postgre@localhost:5432/heartdb"

engine = create_engine(DATABASE_URL)
print("Connecting to:", DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- END database.py modifications ---