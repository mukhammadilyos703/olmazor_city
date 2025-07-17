from app import app, db
from sqlalchemy import text

with app.app_context():
    with db.engine.connect() as conn:
        conn.execute(text('ALTER TABLE menu_item ADD COLUMN name_ru VARCHAR(200)'))
        conn.execute(text('ALTER TABLE menu_item ADD COLUMN description_ru TEXT'))
    print("name_ru and description_ru columns added to menu_item table.") 