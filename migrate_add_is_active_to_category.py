from app import app, db
from sqlalchemy import text

with app.app_context():
    with db.engine.connect() as conn:
        conn.execute(text('ALTER TABLE category ADD COLUMN is_active BOOLEAN DEFAULT 1'))
    print("is_active column added to category table.") 