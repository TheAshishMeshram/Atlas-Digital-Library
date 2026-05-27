import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'database.db')

def init_db():
    print(f"Initializing database at: {DB_PATH}")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create books table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            author TEXT NOT NULL,
            category TEXT NOT NULL,
            description TEXT,
            cover_url TEXT,
            total_copies INTEGER DEFAULT 1,
            available_copies INTEGER DEFAULT 1
        )
    ''')
    
    # Create transactions table
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            book_id INTEGER NOT NULL,
            student_name TEXT NOT NULL,
            student_id TEXT NOT NULL,
            issue_date TEXT NOT NULL,
            due_date TEXT NOT NULL,
            return_date TEXT,
            status TEXT DEFAULT 'issued',
            FOREIGN KEY (book_id) REFERENCES books (id)
        )
    ''')
    
    # Clear existing data to allow fresh seeds
    cursor.execute('DELETE FROM transactions')
    cursor.execute('DELETE FROM books')
    
    # Seed books
    books_data = [
        (
            "Rich Dad Poor Dad", 
            "Robert Kiyosaki", 
            "Business", 
            "What the Rich Teach Their Kids About Money That the Poor and Middle Class Do Not!",
            "/static/images/book12.jpg", 
            3, 
            3
        ),
        (
            "The Art of Innovation", 
            "Tom Kelley", 
            "Design", 
            "Insights and brainstorming methods from IDEO, one of the world's leading design firms, on fostering creativity.",
            "/static/images/book8.jpg", 
            4, 
            4
        ),
        (
            "Clean Code", 
            "Robert C. Martin", 
            "Science & Tech", 
            "A handbook of agile software craftsmanship. Learn to write code that is clean, readable, and highly maintainable.",
            "/static/images/book6.jpg", 
            5, 
            5
        ),
        (
            "The Lean Startup", 
            "Eric Ries", 
            "Business", 
            "How today's entrepreneurs use continuous innovation to create radically successful businesses.",
            "/static/images/book7.jpg", 
            3, 
            3
        ),
        (
            "Sapiens: A Brief History of Humankind", 
            "Yuval Noah Harari", 
            "History", 
            "A sweeping narrative of humanity's creation and evolution, exploring how history has shaped our societies.",
            "/static/images/book9.jpg", 
            2, 
            2
        ),
        (
            "Principles: Life and Work", 
            "Ray Dalio", 
            "Business", 
            "The founder of Bridgewater Associates shares the unconventional principles he developed, refined, and used to achieve success.",
            "/static/images/book4.jpg", 
            4, 
            4
        ),
        (
            "The Design of Everyday Things", 
            "Don Norman", 
            "Design", 
            "A classic primer on cognitive design, showing how and why some products satisfy customers while others frustrate them.",
            "/static/images/book1.webp", 
            3, 
            3
        ),
        (
            "A Brief History of Time", 
            "Stephen Hawking", 
            "Science & Tech", 
            "A landmark volume in science writing by one of the great minds of our time, exploring the boundaries of the universe.",
            "/static/images/book2.webp", 
            2, 
            2
        ),
        (
            "The Psychology of Money", 
            "Morgan Housel", 
            "Business", 
            "Timeless lessons on wealth, greed, and happiness doing well with money isn?t necessarily about what you know. It?s about how you behave. And behavior is hard to teach, even to really smart people.",
            "/static/images/book11.jpg", 
            4, 
            4
        ),
        (
            "The Alchemist", 
            "Paulo Coelho", 
            "Fiction", 
            "A beautiful philosophical novel about Santiago, an Andalusian shepherd boy, who yearerns to travel in search of worldly treasure.",
            "/static/images/book3.webp", 
            5, 
            5
        ),
        (
            "The Art of War", 
            "Sun Tzu", 
            "History", 
            "The ancient Chinese military treatise dating from the Late Spring and Autumn Period, focused on strategy and tactics.",
            "/static/images/book10.webp", 
            3, 
            3
        ),
        (
            "Zero to One", 
            "Peter Thiel", 
            "Business", 
            "Notes on startups, or how to build the future. Thiel shows how we can find singular ways to create new things.",
            "/static/images/book5.jpg", 
            4, 
            4
        )
    ]
    
    cursor.executemany('''
        INSERT INTO books (title, author, category, description, cover_url, total_copies, available_copies)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', books_data)
    
    conn.commit()
    conn.close()
    print("Database successfully initialized and seeded with 12 premium books.")

if __name__ == '__main__':
    init_db()
