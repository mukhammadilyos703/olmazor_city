import sqlite3
import os

def migrate_database():
    """Add is_active column to menu_item table if it doesn't exist"""
    
    # Check both possible database locations
    db_paths = ['restaurant.db', 'instance/restaurant.db']
    db_path = None
    
    for path in db_paths:
        if os.path.exists(path):
            db_path = path
            break
    
    if not db_path:
        print("Database file not found. Creating new database...")
        db_path = 'restaurant.db'
    
    print(f"Using database at: {db_path}")
    
    # Connect to database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if menu_item table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='menu_item'")
        if not cursor.fetchone():
            print("menu_item table not found. Creating new database structure...")
            conn.close()
            return
        
        # Check if is_active column already exists
        cursor.execute("PRAGMA table_info(menu_item)")
        columns = [column[1] for column in cursor.fetchall()]
        
        if 'is_active' not in columns:
            print("Adding is_active column to menu_item table...")
            
            # Add the is_active column with default value True
            cursor.execute("""
                ALTER TABLE menu_item 
                ADD COLUMN is_active BOOLEAN DEFAULT 1
            """)
            
            # Update existing records to be active by default
            cursor.execute("""
                UPDATE menu_item 
                SET is_active = 1 
                WHERE is_active IS NULL
            """)
            
            conn.commit()
            print("✅ Successfully added is_active column to menu_item table")
            print("✅ All existing menu items set to active by default")
        else:
            print("✅ is_active column already exists in menu_item table")
            
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database() 