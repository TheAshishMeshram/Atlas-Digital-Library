from flask import Flask, render_template, jsonify, request, send_from_directory

import sqlite3
import os
from datetime import datetime, timedelta

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'database.db')

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# Ensure database exists before running
if not os.path.exists(DB_PATH):
    # Run the init_db logic if db is missing
    from init_db import init_db
    init_db()

def init_extra_tables():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS card_applications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_name TEXT NOT NULL,
            student_id TEXT NOT NULL UNIQUE,
            email TEXT NOT NULL,
            department TEXT NOT NULL,
            status TEXT DEFAULT 'pending',
            created_at TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

init_extra_tables()

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/static/images/<path:filename>')
def serve_image(filename):
    return send_from_directory(os.path.join(BASE_DIR, 'static', 'images'), filename)

@app.route('/api/books', methods=['GET'])
def get_books():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    query_param = request.args.get('q', '').strip()
    category_param = request.args.get('category', '').strip()
    
    sql_query = "SELECT * FROM books WHERE 1=1"
    params = []
    
    if category_param and category_param.lower() != 'all':
        sql_query += " AND category = ?"
        params.append(category_param)
        
    if query_param:
        sql_query += " AND (title LIKE ? OR author LIKE ? OR description LIKE ?)"
        like_search = f"%{query_param}%"
        params.extend([like_search, like_search, like_search])
        
    cursor.execute(sql_query, params)
    books = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(books)

@app.route('/api/categories', methods=['GET'])
def get_categories():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get all distinct categories and count books in each
    cursor.execute("SELECT category, COUNT(*) as count FROM books GROUP BY category")
    categories_raw = cursor.fetchall()
    
    # Also get total count
    cursor.execute("SELECT COUNT(*) as count FROM books")
    total_count = cursor.fetchone()['count']
    
    conn.close()
    
    categories = [{'name': 'All', 'count': total_count}]
    for cat in categories_raw:
        categories.append({
            'name': cat['category'],
            'count': cat['count']
        })
        
    return jsonify(categories)

@app.route('/api/stats', methods=['GET'])
def get_stats():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Total books titles count
    cursor.execute("SELECT COUNT(*) as unique_titles, SUM(total_copies) as total_physical_books FROM books")
    row = cursor.fetchone()
    total_titles = row['unique_titles'] or 0
    total_physical = row['total_physical_books'] or 0
    
    # Available books count
    cursor.execute("SELECT SUM(available_copies) as available FROM books")
    available_physical = cursor.fetchone()['available'] or 0
    
    # Active issued books count
    cursor.execute("SELECT COUNT(*) as active_issued FROM transactions WHERE status = 'issued'")
    active_issued = cursor.fetchone()['active_issued'] or 0
    
    # Overdue books count (status = issued AND due_date < current_date)
    today_str = datetime.today().strftime('%Y-%m-%d')
    cursor.execute("SELECT COUNT(*) as overdue FROM transactions WHERE status = 'issued' AND due_date < ?", (today_str,))
    overdue = cursor.fetchone()['overdue'] or 0
    
    conn.close()
    
    return jsonify({
        'total_titles': total_titles,
        'total_physical': total_physical,
        'available_books': available_physical,
        'issued_books': active_issued,
        'overdue_books': overdue
    })

@app.route('/api/issue', methods=['POST'])
def issue_book():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    book_id = data.get('book_id')
    student_name = data.get('student_name', '').strip()
    student_id = data.get('student_id', '').strip()
    duration_days = int(data.get('duration_days', 7))
    
    if not book_id or not student_name or not student_id:
        return jsonify({'error': 'Missing required fields (book_id, student_name, student_id)'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Check if book exists and is available
    cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
    book = cursor.fetchone()
    
    if not book:
        conn.close()
        return jsonify({'error': 'Book not found'}), 404
        
    if book['available_copies'] <= 0:
        conn.close()
        return jsonify({'error': 'Book is currently not available for issue'}), 400
        
    # Proceed to issue book
    # Update book stock
    new_avail = book['available_copies'] - 1
    cursor.execute("UPDATE books SET available_copies = ? WHERE id = ?", (new_avail, book_id))
    
    # Create transaction
    issue_date = datetime.today().strftime('%Y-%m-%d')
    due_date = (datetime.today() + timedelta(days=duration_days)).strftime('%Y-%m-%d')
    
    cursor.execute('''
        INSERT INTO transactions (book_id, student_name, student_id, issue_date, due_date, status)
        VALUES (?, ?, ?, ?, ?, 'issued')
    ''', (book_id, student_name, student_id, issue_date, due_date))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': f"Book '{book['title']}' successfully issued to {student_name}.",
        'due_date': due_date
    })

@app.route('/api/return', methods=['POST'])
def return_book():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    transaction_id = data.get('transaction_id')
    
    if not transaction_id:
        return jsonify({'error': 'Missing transaction_id'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get transaction details
    cursor.execute("SELECT * FROM transactions WHERE id = ?", (transaction_id,))
    transaction = cursor.fetchone()
    
    if not transaction:
        conn.close()
        return jsonify({'error': 'Transaction record not found'}), 404
        
    if transaction['status'] == 'returned':
        conn.close()
        return jsonify({'error': 'This book has already been returned'}), 400
        
    book_id = transaction['book_id']
    
    # Get book details to increment availability
    cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
    book = cursor.fetchone()
    
    if not book:
        conn.close()
        return jsonify({'error': 'Book reference not found in database'}), 404
        
    # Update transaction
    return_date = datetime.today().strftime('%Y-%m-%d')
    cursor.execute("UPDATE transactions SET status = 'returned', return_date = ? WHERE id = ?", (return_date, transaction_id))
    
    # Update book copies
    new_avail = min(book['available_copies'] + 1, book['total_copies'])
    cursor.execute("UPDATE books SET available_copies = ? WHERE id = ?", (new_avail, book_id))
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': f"Book '{book['title']}' was successfully returned."
    })

@app.route('/api/history', methods=['GET'])
def get_history():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Get all transactions joined with books to return titles and authors
    cursor.execute('''
        SELECT t.id, t.book_id, t.student_name, t.student_id, t.issue_date, t.due_date, t.return_date, t.status,
               b.title as book_title, b.author as book_author, b.category as book_category
        FROM transactions t
        JOIN books b ON t.book_id = b.id
        ORDER BY t.id DESC
    ''')
    
    history = [dict(row) for row in cursor.fetchall()]
    conn.close()
    
    return jsonify(history)

@app.route('/api/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No credentials provided'}), 400
    username = data.get('username')
    password = data.get('password')
    if username == 'admin' and password == 'admin':
        return jsonify({'success': True, 'message': 'Authenticated successfully'})
    return jsonify({'error': 'Invalid username or password'}), 401

@app.route('/api/admin/add-book', methods=['POST'])
def admin_add_book():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No book data provided'}), 400
    
    title = data.get('title', '').strip()
    author = data.get('author', '').strip()
    category = data.get('category', '').strip()
    description = data.get('description', '').strip()
    cover_url = data.get('cover_url', '').strip()
    total_copies = data.get('total_copies', 1)
    
    try:
        total_copies = int(total_copies)
    except (ValueError, TypeError):
        return jsonify({'error': 'Total copies must be a valid number'}), 400
        
    if not title or not author or not category or not description:
        return jsonify({'error': 'All fields are required'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO books (title, author, category, description, cover_url, total_copies, available_copies)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (title, author, category, description, cover_url, total_copies, total_copies))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': f"Book '{title}' added successfully."})

@app.route('/api/admin/delete-book/<int:book_id>', methods=['DELETE'])
def admin_delete_book(book_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM books WHERE id = ?", (book_id,))
    book = cursor.fetchone()
    
    if not book:
        conn.close()
        return jsonify({'error': 'Book not found'}), 404
        
    # Delete associated transactions first
    cursor.execute("DELETE FROM transactions WHERE book_id = ?", (book_id,))
    # Delete book
    cursor.execute("DELETE FROM books WHERE id = ?", (book_id,))
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': f"Book '{book['title']}' deleted successfully."})

@app.route('/api/card/apply', methods=['POST'])
def card_apply():
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    student_name = data.get('student_name', '').strip()
    student_id = data.get('student_id', '').strip()
    email = data.get('email', '').strip()
    department = data.get('department', '').strip()
    
    if not student_name or not student_id or not email or not department:
        return jsonify({'error': 'All fields are required'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        # Check if already applied
        cursor.execute("SELECT * FROM card_applications WHERE student_id = ?", (student_id,))
        existing = cursor.fetchone()
        if existing:
            conn.close()
            return jsonify({
                'success': True,
                'message': f"Application already logged.",
                'status': existing['status']
            })
            
        created_at = datetime.today().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute('''
            INSERT INTO card_applications (student_name, student_id, email, department, status, created_at)
            VALUES (?, ?, ?, ?, 'pending', ?)
        ''', (student_name, student_id, email, department, created_at))
        conn.commit()
        conn.close()
        return jsonify({
            'success': True,
            'message': 'Digital Card application submitted successfully.',
            'status': 'pending'
        })
    except sqlite3.IntegrityError:
        conn.close()
        return jsonify({'error': 'Student ID already applied.'}), 400
    except Exception as e:
        conn.close()
        return jsonify({'error': str(e)}), 500

@app.route('/api/card/status/<student_id>', methods=['GET'])
def card_status(student_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM card_applications WHERE student_id = ?", (student_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return jsonify({'status': 'none'})
    return jsonify(dict(row))

@app.route('/api/admin/card-applications', methods=['GET'])
def get_card_applications():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM card_applications ORDER BY CASE status WHEN 'pending' THEN 1 ELSE 2 END, id DESC")
    rows = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return jsonify(rows)

@app.route('/api/admin/card-application/<int:app_id>/status', methods=['POST'])
def update_card_application_status(app_id):
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    status = data.get('status')
    if status not in ['approved', 'rejected']:
        return jsonify({'error': 'Invalid status'}), 400
        
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT * FROM card_applications WHERE id = ?", (app_id,))
    app_record = cursor.fetchone()
    if not app_record:
        conn.close()
        return jsonify({'error': 'Application not found'}), 404
        
    cursor.execute("UPDATE card_applications SET status = ? WHERE id = ?", (status, app_id))
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': f"Application for {app_record['student_name']} has been {status}."
    })

if __name__ == '__main__':
    # Make sure static directories exist
    os.makedirs(os.path.join(BASE_DIR, 'templates'), exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, 'static', 'css'), exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, 'static', 'js'), exist_ok=True)
    os.makedirs(os.path.join(BASE_DIR, 'static', 'images'), exist_ok=True)
    app.run(debug=True, port=5000)
