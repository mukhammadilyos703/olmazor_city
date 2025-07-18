from flask import Flask, render_template, request, redirect, url_for, flash, jsonify, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
import os
from datetime import datetime
import uuid
from googletrans import Translator
import qrcode
import io
from flask import send_file

from datetime import datetime, timedelta
import json
import xlsxwriter
from io import BytesIO
import matplotlib.pyplot as plt
import seaborn as sns
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib.images import Image

app = Flask(__name__)
app.config['SECRET_KEY'] = 'olmazor-city-secret-key-2024'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///restaurant.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = 'static/uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Ensure upload folder exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

db = SQLAlchemy(app)

# Models
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name_uz = db.Column(db.String(100), nullable=False)
    name_ru = db.Column(db.String(100), nullable=False)
    icon = db.Column(db.String(50), default='🍽️')
    is_active = db.Column(db.Boolean, default=True)  # New field for active/inactive status
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    menu_items = db.relationship('MenuItem', backref='category', lazy=True)

class MenuItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    name_ru = db.Column(db.String(200)) # New field for Russian name
    description = db.Column(db.Text)
    description_ru = db.Column(db.Text) # New field for Russian description
    price = db.Column(db.Float, nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)
    image_url = db.Column(db.String(200))
    popular = db.Column(db.Boolean, default=False)
    rating = db.Column(db.Float, default=4.5)
    spice_level = db.Column(db.Integer, default=0)  # 0-5
    is_active = db.Column(db.Boolean, default=True)  # New field for active/inactive status
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    customer_name = db.Column(db.String(100))
    customer_phone = db.Column(db.String(20))
    items = db.Column(db.Text)  # JSON string of ordered items
    total_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, confirmed, completed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class PageView(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    page = db.Column(db.String(50), nullable=False)
    ip_address = db.Column(db.String(45))
    user_agent = db.Column(db.Text)
    viewed_at = db.Column(db.DateTime, default=datetime.utcnow)

class SecuritySetting(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)
    enabled = db.Column(db.Boolean, default=False)
    config = db.Column(db.JSON)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)

class LoginAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), nullable=False)
    ip_address = db.Column(db.String(45))
    success = db.Column(db.Boolean, default=False)
    attempted_at = db.Column(db.DateTime, default=datetime.utcnow)

# Authentication decorators
def login_required(f):
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Tizimga kirish kerak!', 'warning')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

def admin_required(f):
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Tizimga kirish kerak!', 'warning')
            return redirect(url_for('login'))
        user = db.session.get(User, session['user_id'])
        if not user or not user.is_admin:
            flash('Admin huquqlari kerak!', 'danger')
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# Custom filter for formatting numbers
@app.template_filter('format_number')
def format_number(value):
    return "{:,.0f}".format(value)

# Custom filter for parsing JSON
@app.template_filter('from_json')
def from_json(value):
    import json
    try:
        return json.loads(value)
    except:
        return []

def uzbek_to_russian(text):
    translator = Translator()
    result = translator.translate(text, src='uz', dest='ru')
    return result.text

@app.route('/api/translate/uz-ru', methods=['POST'])
@admin_required
def api_translate_uz_ru():
    data = request.get_json()
    uz_text = data.get('text', '')
    ru_text = uzbek_to_russian(uz_text)
    return jsonify({'translated': ru_text})

# Routes
@app.route('/')
def index():
    lang = session.get('lang', 'uz')
    categories = Category.query.filter_by(is_active=True).all()
    # Only show menu items that are active and belong to active categories
    active_category_ids = [cat.id for cat in categories]
    menu_items = MenuItem.query.filter(MenuItem.is_active == True, MenuItem.category_id.in_(active_category_ids)).limit(6).all()
    track_page_view('index')
    return render_template('index.html', menu_items=menu_items, categories=categories, lang=lang)

@app.route('/menu')
def menu():
    lang = session.get('lang', 'uz')
    categories = Category.query.filter_by(is_active=True).all()
    active_category_ids = [cat.id for cat in categories]
    menu_items = MenuItem.query.filter(MenuItem.is_active == True, MenuItem.category_id.in_(active_category_ids)).all()
    track_page_view('menu')
    return render_template('menu.html', menu_items=menu_items, categories=categories, lang=lang)

@app.route('/qr-menu')
def qr_menu():
    lang = session.get('lang', 'uz')
    categories = Category.query.filter_by(is_active=True).all()
    active_category_ids = [cat.id for cat in categories]
    menu_items = MenuItem.query.filter(MenuItem.is_active == True, MenuItem.category_id.in_(active_category_ids)).all()
    track_page_view('qr_menu')
    return render_template('qr_menu.html', menu_items=menu_items, categories=categories, lang=lang)

@app.route('/gallery')
def gallery():
    lang = session.get('lang', 'uz')
    # Track page view
    track_page_view('gallery')
    return render_template('gallery.html', lang=lang)

@app.route('/qr-generator')
def qr_generator():
    # Track page view
    track_page_view('qr_generator')
    return render_template('qr_generator.html')

@app.route('/api/stats/detailed/<type>')
@admin_required
def get_detailed_stats(type):
    if type == 'menu':
        # Get menu items statistics
        total = MenuItem.query.count()
        active = MenuItem.query.filter_by(is_active=True).count()
        inactive = MenuItem.query.filter_by(is_active=False).count()
        popular = MenuItem.query.filter_by(popular=True).count()
        by_category = db.session.query(
            Category.name_uz,
            db.func.count(MenuItem.id)
        ).join(MenuItem).group_by(Category.id).all()
        
        return jsonify({
            'total': total,
            'active': active,
            'inactive': inactive,
            'popular': popular,
            'by_category': dict(by_category)
        })
    
    elif type == 'orders':
        # Get orders statistics
        total = Order.query.count()
        pending = Order.query.filter_by(status='pending').count()
        completed = Order.query.filter_by(status='completed').count()
        cancelled = Order.query.filter_by(status='cancelled').count()
        
        # Get daily orders for the last 7 days
        daily_orders = []
        for i in range(7):
            date = datetime.now().date() - timedelta(days=i)
            count = Order.query.filter(
                db.func.date(Order.created_at) == date
            ).count()
            daily_orders.append({
                'date': date.strftime('%Y-%m-%d'),
                'count': count
            })
        
        return jsonify({
            'total': total,
            'pending': pending,
            'completed': completed,
            'cancelled': cancelled,
            'daily_orders': daily_orders
        })
    
    elif type == 'views':
        # Get page views statistics
        total = PageView.query.count()
        today = PageView.query.filter(
            db.func.date(PageView.viewed_at) == datetime.now().date()
        ).count()
        
        # Get daily views for the last 7 days
        daily_views = []
        for i in range(7):
            date = datetime.now().date() - timedelta(days=i)
            count = PageView.query.filter(
                db.func.date(PageView.viewed_at) == date
            ).count()
            daily_views.append({
                'date': date.strftime('%Y-%m-%d'),
                'count': count
            })
        
        # Get views by page
        by_page = db.session.query(
            PageView.page,
            db.func.count(PageView.id)
        ).group_by(PageView.page).all()
        
        return jsonify({
            'total': total,
            'today': today,
            'daily_views': daily_views,
            'by_page': dict(by_page)
        })
    
    return jsonify({'error': 'Invalid type'})

@app.route('/api/export/<type>')
@admin_required
def export_report(type):
    if type == 'orders':
        # Create Excel file
        output = BytesIO()
        workbook = xlsxwriter.Workbook(output)
        worksheet = workbook.add_worksheet()
        
        # Add headers
        headers = ['ID', 'Customer', 'Phone', 'Items', 'Total', 'Status', 'Created At']
        for col, header in enumerate(headers):
            worksheet.write(0, col, header)
        
        # Add data
        orders = Order.query.all()
        for row, order in enumerate(orders, start=1):
            worksheet.write(row, 0, order.id)
            worksheet.write(row, 1, order.customer_name)
            worksheet.write(row, 2, order.customer_phone)
            worksheet.write(row, 3, order.items)
            worksheet.write(row, 4, order.total_amount)
            worksheet.write(row, 5, order.status)
            worksheet.write(row, 6, order.created_at.strftime('%Y-%m-%d %H:%M'))
        
        workbook.close()
        output.seek(0)
        
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name='orders_report.xlsx'
        )
    
    elif type == 'sales':
        # Create PDF report
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        # Add title
        styles = getSampleStyleSheet()
        elements.append(Paragraph('Sales Report', styles['Title']))
        
        # Add sales data
        orders = Order.query.filter_by(status='completed').all()
        data = [['Date', 'Orders', 'Total Sales']]
        
        # Group by date
        sales_by_date = {}
        for order in orders:
            date = order.created_at.date()
            if date not in sales_by_date:
                sales_by_date[date] = {'count': 0, 'total': 0}
            sales_by_date[date]['count'] += 1
            sales_by_date[date]['total'] += order.total_amount
        
        # Add to table
        for date, stats in sorted(sales_by_date.items()):
            data.append([
                date.strftime('%Y-%m-%d'),
                stats['count'],
                f"{stats['total']:,.0f} so'm"
            ])
        
        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 12),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(table)
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='sales_report.pdf'
        )
    
    elif type == 'analytics':
        # Create PDF analytics report
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        elements = []
        
        # Add title
        styles = getSampleStyleSheet()
        elements.append(Paragraph('Analytics Report', styles['Title']))
        
        # Add various statistics
        stats = [
            ('Total Menu Items', MenuItem.query.count()),
            ('Active Menu Items', MenuItem.query.filter_by(is_active=True).count()),
            ('Total Categories', Category.query.count()),
            ('Total Orders', Order.query.count()),
            ('Completed Orders', Order.query.filter_by(status='completed').count()),
            ('Total Page Views', PageView.query.count())
        ]
        
        data = [['Metric', 'Value']]
        for metric, value in stats:
            data.append([metric, value])
        
        # Create table
        table = Table(data)
        table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 14),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('TEXTCOLOR', (0, 1), (-1, -1), colors.black),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 12),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black)
        ]))
        elements.append(table)
        
        # Add some charts
        # Orders by status
        plt.figure(figsize=(8, 6))
        orders_by_status = {
            'Pending': Order.query.filter_by(status='pending').count(),
            'Completed': Order.query.filter_by(status='completed').count(),
            'Cancelled': Order.query.filter_by(status='cancelled').count()
        }
        plt.pie(
            orders_by_status.values(),
            labels=orders_by_status.keys(),
            autopct='%1.1f%%'
        )
        plt.title('Orders by Status')
        
        # Save chart to buffer
        chart_buffer = BytesIO()
        plt.savefig(chart_buffer, format='png')
        chart_buffer.seek(0)
        
        # Add chart to PDF
        elements.append(Image(chart_buffer))
        
        # Build PDF
        doc.build(elements)
        buffer.seek(0)
        
        return send_file(
            buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name='analytics_report.pdf'
        )
    
    return jsonify({'error': 'Invalid type'})

@app.route('/api/security/update', methods=['POST'])
@admin_required
def update_security():
    data = request.get_json()
    setting = data.get('setting')
    enabled = data.get('enabled')
    
    if not setting:
        return jsonify({'error': 'Setting name required'}), 400
    
    security_setting = SecuritySetting.query.filter_by(name=setting).first()
    if not security_setting:
        security_setting = SecuritySetting(name=setting)
    
    security_setting.enabled = enabled
    security_setting.updated_at = datetime.utcnow()
    
    db.session.add(security_setting)
    db.session.commit()
    
    return jsonify({'success': True})

@app.route('/api/security/status')
@admin_required
def get_security_status():
    settings = SecuritySetting.query.all()
    return jsonify({
        setting.name: setting.enabled for setting in settings
    })

# Login attempt tracking
def track_login_attempt(username, success, ip_address):
    attempt = LoginAttempt(
        username=username,
        success=success,
        ip_address=ip_address
    )
    db.session.add(attempt)
    db.session.commit()

# Modified login route with attempt tracking
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        # Check if login attempts are enabled and if user is blocked
        login_attempts_setting = SecuritySetting.query.filter_by(name='login_attempts').first()
        if login_attempts_setting and login_attempts_setting.enabled:
            # Count failed attempts in last hour
            hour_ago = datetime.utcnow() - timedelta(hours=1)
            failed_attempts = LoginAttempt.query.filter_by(
                username=username,
                success=False,
                attempted_at > hour_ago
            ).count()
            
            if failed_attempts >= 5:
                track_login_attempt(username, False, request.remote_addr)
                flash('Too many failed attempts. Please try again later.', 'danger')
                return redirect(url_for('login'))
        
        user = User.query.filter_by(username=username).first()
        if user and check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            track_login_attempt(username, True, request.remote_addr)
            flash('Muvaffaqiyatli kirildi!', 'success')
            return redirect(url_for('admin_dashboard'))
        else:
            track_login_attempt(username, False, request.remote_addr)
            flash('Noto\'g\'ri login yoki parol!', 'danger')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    session.pop('user_id', None)
    flash('Tizimdan chiqildi!', 'info')
    return redirect(url_for('index'))

@app.route('/admin')
@admin_required
def admin_dashboard():
    # Get basic statistics
    total_menu_items = MenuItem.query.count()
    total_categories = Category.query.count()
    total_orders = Order.query.count()
    total_page_views = PageView.query.count()
    
    # Get detailed statistics
    menu_items_active = MenuItem.query.filter_by(is_active=True).count()
    menu_items_inactive = MenuItem.query.filter_by(is_active=False).count()
    
    orders_pending = Order.query.filter_by(status='pending').count()
    orders_completed = Order.query.filter_by(status='completed').count()
    
    # Get today's page views
    from datetime import datetime, timedelta
    today = datetime.now().date()
    today_views = PageView.query.filter(
        PageView.viewed_at >= today
    ).count()
    
    # Get current date and time
    now = datetime.now()
    current_date = now.strftime('%d.%m.%Y')
    current_time = now.strftime('%H:%M')
    
    # Get recent orders
    recent_orders = Order.query.order_by(Order.created_at.desc()).limit(5).all()
    
    # Get popular menu items
    popular_items = MenuItem.query.filter_by(popular=True).limit(5).all()
    
    return render_template('admin/dashboard.html',
                         total_menu_items=total_menu_items,
                         total_categories=total_categories,
                         total_orders=total_orders,
                         total_page_views=total_page_views,
                         menu_items_active=menu_items_active,
                         menu_items_inactive=menu_items_inactive,
                         orders_pending=orders_pending,
                         orders_completed=orders_completed,
                         today_views=today_views,
                         current_date=current_date,
                         current_time=current_time,
                         recent_orders=recent_orders,
                         popular_items=popular_items)

@app.route('/admin/menu')
@admin_required
def admin_menu():
    menu_items = MenuItem.query.all()
    categories = Category.query.all()
    return render_template('admin/menu.html', menu_items=menu_items, categories=categories)

@app.route('/admin/menu/add', methods=['GET', 'POST'])
@admin_required
def admin_add_menu():
    if request.method == 'POST':
        name = request.form['name']
        name_ru = request.form.get('name_ru')
        description = request.form['description']
        description_ru = request.form.get('description_ru')
        price = float(request.form['price'])
        category_id = int(request.form['category_id'])
        popular = 'popular' in request.form
        rating = float(request.form['rating'])
        spice_level = int(request.form['spice_level'])
        
        # Handle image upload
        image_url = None
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename:
                filename = secure_filename(file.filename)
                # Add unique identifier to prevent conflicts
                unique_filename = f"{uuid.uuid4().hex}_{filename}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
                image_url = f"uploads/{unique_filename}"
        
        menu_item = MenuItem(
            name=name,
            name_ru=name_ru,
            description=description,
            description_ru=description_ru,
            price=price,
            category_id=category_id,
            image_url=image_url,
            popular=popular,
            rating=rating,
            spice_level=spice_level
        )
        
        db.session.add(menu_item)
        db.session.commit()
        
        flash('Taom muvaffaqiyatli qo\'shildi!', 'success')
        return redirect(url_for('admin_menu'))
    
    categories = Category.query.all()
    return render_template('admin/add_menu.html', categories=categories)

@app.route('/admin/menu/edit/<int:id>', methods=['GET', 'POST'])
@admin_required
def admin_edit_menu(id):
    menu_item = MenuItem.query.get_or_404(id)
    
    if request.method == 'POST':
        menu_item.name = request.form['name']
        menu_item.name_ru = request.form.get('name_ru')
        menu_item.description = request.form['description']
        menu_item.description_ru = request.form.get('description_ru')
        menu_item.price = float(request.form['price'])
        menu_item.category_id = int(request.form['category_id'])
        menu_item.popular = 'popular' in request.form
        menu_item.rating = float(request.form['rating'])
        menu_item.spice_level = int(request.form['spice_level'])
        
        # Handle image upload
        if 'image' in request.files:
            file = request.files['image']
            if file and file.filename:
                # Delete old image if exists
                if menu_item.image_url:
                    old_image_path = os.path.join(app.config['UPLOAD_FOLDER'], menu_item.image_url.replace('uploads/', ''))
                    if os.path.exists(old_image_path):
                        os.remove(old_image_path)
                
                filename = secure_filename(file.filename)
                unique_filename = f"{uuid.uuid4().hex}_{filename}"
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], unique_filename))
                menu_item.image_url = f"uploads/{unique_filename}"
        
        db.session.commit()
        flash('Taom muvaffaqiyatli yangilandi!', 'success')
        return redirect(url_for('admin_menu'))
    
    categories = Category.query.all()
    return render_template('admin/edit_menu.html', menu_item=menu_item, categories=categories)

@app.route('/admin/menu/delete/<int:id>')
@admin_required
def admin_delete_menu(id):
    menu_item = MenuItem.query.get_or_404(id)
    
    # Delete image file if exists
    if menu_item.image_url:
        image_path = os.path.join(app.config['UPLOAD_FOLDER'], menu_item.image_url.replace('uploads/', ''))
        if os.path.exists(image_path):
            os.remove(image_path)
    
    db.session.delete(menu_item)
    db.session.commit()
    
    flash('Taom muvaffaqiyatli o\'chirildi!', 'success')
    return redirect(url_for('admin_menu'))

@app.route('/admin/menu/toggle/<int:id>', methods=['POST'])
@admin_required
def toggle_menu_item(id):
    try:
        data = request.get_json()
        is_active = data.get('is_active', False)
        
        menu_item = MenuItem.query.get_or_404(id)
        menu_item.is_active = is_active
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Taom holati muvaffaqiyatli o\'zgartirildi!',
            'is_active': menu_item.is_active
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Xatolik yuz berdi!'
        }), 500

@app.route('/admin/categories')
@admin_required
def admin_categories():
    categories = Category.query.all()
    return render_template('admin/categories.html', categories=categories)

@app.route('/admin/categories/add', methods=['GET', 'POST'])
@admin_required
def admin_add_category():
    if request.method == 'POST':
        name_uz = request.form['name_uz']
        name_ru = request.form['name_ru']
        icon = request.form['icon']
        
        category = Category(name_uz=name_uz, name_ru=name_ru, icon=icon)
        db.session.add(category)
        db.session.commit()
        
        flash('Kategoriya muvaffaqiyatli qo\'shildi!', 'success')
        return redirect(url_for('admin_categories'))
    
    return render_template('admin/add_category.html')

@app.route('/admin/categories/edit/<int:id>', methods=['GET', 'POST'])
@admin_required
def admin_edit_category(id):
    category = Category.query.get_or_404(id)
    
    if request.method == 'POST':
        category.name_uz = request.form['name_uz']
        category.name_ru = request.form['name_ru']
        category.icon = request.form['icon']
        
        db.session.commit()
        flash('Kategoriya muvaffaqiyatli yangilandi!', 'success')
        return redirect(url_for('admin_categories'))
    
    return render_template('admin/edit_category.html', category=category)

@app.route('/admin/categories/delete/<int:id>', methods=['POST'])
@admin_required
def admin_delete_category(id):
    category = Category.query.get_or_404(id)
    # Check if category has menu items
    if category.menu_items:
        flash('Bu kategoriyada taomlar bor, avval ularni o‘chiring!', 'danger')
        return redirect(url_for('admin_categories'))
    db.session.delete(category)
    db.session.commit()
    flash('Kategoriya muvaffaqiyatli o‘chirildi!', 'success')
    return redirect(url_for('admin_categories'))

@app.route('/admin/categories/toggle/<int:id>', methods=['POST'])
@admin_required
def toggle_category(id):
    try:
        data = request.get_json()
        is_active = data.get('is_active', False)
        
        category = Category.query.get_or_404(id)
        category.is_active = is_active
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'Kategoriya holati muvaffaqiyatli o\'zgartirildi!',
            'is_active': category.is_active
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': 'Xatolik yuz berdi!'
        }), 500

@app.route('/admin/orders')
@admin_required
def admin_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return render_template('admin/orders.html', orders=orders)

@app.route('/admin/orders/<int:id>/status/<status>')
@admin_required
def admin_update_order_status(id, status):
    order = Order.query.get_or_404(id)
    order.status = status
    db.session.commit()
    
    flash(f'Buyurtma holati "{status}" ga o\'zgartirildi!', 'success')
    return redirect(url_for('admin_orders'))

@app.route('/admin/analytics')
@admin_required
def admin_analytics():
    # Get page view statistics
    page_views = PageView.query.all()
    
    # Count views by page
    page_stats = {}
    for view in page_views:
        if view.page not in page_stats:
            page_stats[view.page] = 0
        page_stats[view.page] += 1
    
    # Get recent page views
    recent_views = PageView.query.order_by(PageView.viewed_at.desc()).limit(20).all()
    
    return render_template('admin/analytics.html', 
                         page_stats=page_stats, 
                         recent_views=recent_views,
                         total_views=len(page_views))

@app.route('/admin/change-password', methods=['GET', 'POST'])
@admin_required
def change_password():
    if request.method == 'POST':
        old_password = request.form['old_password']
        new_password = request.form['new_password']
        confirm_password = request.form['confirm_password']

        user = db.session.get(User, session['user_id'])
        if not user:
            flash('Foydalanuvchi topilmadi!', 'danger')
        elif not check_password_hash(user.password_hash, old_password):
            flash('Eski parol noto‘g‘ri!', 'danger')
        elif new_password != confirm_password:
            flash('Yangi parollar mos emas!', 'danger')
        else:
            user.password_hash = generate_password_hash(new_password)
            db.session.commit()
            flash('Parol muvaffaqiyatli o‘zgartirildi!', 'success')
            return redirect(url_for('admin_dashboard'))
    return render_template('admin/change_password.html')

@app.route('/set-language/<lang>')
def set_language(lang):
    if lang in ['uz', 'ru']:
        session['lang'] = lang
    return redirect(request.referrer or url_for('index'))

def track_page_view(page):
    """Track page view for analytics"""
    page_view = PageView(
        page=page,
        ip_address=request.remote_addr,
        user_agent=request.headers.get('User-Agent', '')
    )
    db.session.add(page_view)
    db.session.commit()

@app.route('/generate-qr', methods=['POST'])
def generate_qr():
    data = request.json
    url = data.get('url')
    size = int(data.get('size', 300))
    color = data.get('color', '000000')
    bg_color = data.get('bg_color', 'FFFFFF')

    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)
    img = qr.make_image(fill_color=f"#{color}", back_color=f"#{bg_color}")
    # Ensure img is a PIL Image for resize
    if hasattr(img, 'get_image'):
        img = img.get_image()
    img = img.resize((size, size))

    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return send_file(buf, mimetype='image/png')

if __name__ == "__main__":
    with app.app_context():
        db.create_all()
        # Create admin user if not exists
        admin_user = User.query.filter_by(username='admin').first()
        if not admin_user:
            admin_user = User(
                username='admin',
                password_hash=generate_password_hash('admin123'),
                is_admin=True
            )
            db.session.add(admin_user)
            db.session.commit()
            print("Admin user created: username='admin', password='admin123'")
        # Create default categories if not exists
        if Category.query.count() == 0:
            categories = [
                Category(name_uz='Milliy taomlar', name_ru='Национальные блюда', icon='🍽️'),
                Category(name_uz='Ichimliklar', name_ru='Напитки', icon='🥤'),
                Category(name_uz='Shirinliklar', name_ru='Десерты', icon='🍰'),
                Category(name_uz='Salatlar', name_ru='Салаты', icon='🥗'),
                Category(name_uz='Non mahsulotlari', name_ru='Хлебобулочные изделия', icon='🥖')
            ]
            for category in categories:
                db.session.add(category)
            db.session.commit()
            print("Default categories created")
    app.run(host="0.0.0.0", port=5000, debug=True) 