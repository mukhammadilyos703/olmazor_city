import sqlite3

# Agar bazangiz boshqa joyda bo‘lsa, to‘liq yo‘lni yozing
db_path = "restaurant.db"

conn = sqlite3.connect(db_path)
c = conn.cursor()

# Ustun bor-yo‘qligini tekshirish
c.execute("PRAGMA table_info(category)")
columns = [row[1] for row in c.fetchall()]
if "name_en" not in columns:
    c.execute("ALTER TABLE category ADD COLUMN name_en VARCHAR(100) DEFAULT ''")
    print("name_en ustuni qo‘shildi.")
else:
    print("name_en ustuni allaqachon mavjud.")

conn.commit()
conn.close() 