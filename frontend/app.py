from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = 'your_secret_key_here'

# Настройка базы данных
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Модель пользователя
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    phone = db.Column(db.String(20))
    first_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50))
    birth_date = db.Column(db.Date)
    about = db.Column(db.Text)
    is_moderator = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    vacancies = db.relationship('Vacancy', backref='author', lazy=True)

# Модель вакансии
class Vacancy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    salary = db.Column(db.String(50))
    status = db.Column(db.String(20), default='pending')  # pending, approved, rejected
    rejection_reason = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

class Message(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_read = db.Column(db.Boolean, default=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    recipient_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    vacancy_id = db.Column(db.Integer, db.ForeignKey('vacancy.id'), nullable=False)
    
    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref='received_messages')
    vacancy = db.relationship('Vacancy', backref='messages')

# Создаем таблицы
with app.app_context():
    db.create_all()

# Главная страница
@app.route('/')
def index():
    vacancies = Vacancy.query.filter_by(status='approved').order_by(Vacancy.created_at.desc()).all()
    return render_template('index.html', vacancies=vacancies)

# Регистрация
@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        
        if password != confirm_password:
            flash('Пароли не совпадают', 'error')
            return redirect(url_for('register'))
        
        existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
        if existing_user:
            flash('Пользователь с таким именем или email уже существует', 'error')
            return redirect(url_for('register'))
        
        hashed_password = generate_password_hash(password, method='sha256')
        new_user = User(username=username, email=email, password=hashed_password)
        
        db.session.add(new_user)
        db.session.commit()
        
        flash('Регистрация прошла успешно. Теперь вы можете войти.', 'success')
        return redirect(url_for('login'))
    
    return render_template('register.html')

# Вход
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        
        if not user or not check_password_hash(user.password, password):
            flash('Неверное имя пользователя или пароль', 'error')
            return redirect(url_for('login'))
        
        session['user_id'] = user.id
        session['username'] = user.username
        session['is_moderator'] = user.is_moderator
        flash('Вы успешно вошли в систему', 'success')
        
        if user.is_moderator:
            return redirect(url_for('moderator_panel'))
        return redirect(url_for('profile'))
    
    return render_template('login.html')

# Выход
@app.route('/logout')
def logout():
    session.clear()
    flash('Вы вышли из системы', 'info')
    return redirect(url_for('index'))

# Профиль
@app.route('/profile', methods=['GET', 'POST'])
def profile():
    if 'user_id' not in session:
        flash('Пожалуйста, войдите в систему', 'error')
        return redirect(url_for('login'))
    
    user = User.query.get(session['user_id'])
    
    if request.method == 'POST':
        user.phone = request.form['phone']
        user.first_name = request.form['first_name']
        user.last_name = request.form['last_name']
        user.about = request.form['about']
        
        birth_date_str = request.form['birth_date']
        if birth_date_str:
            user.birth_date = datetime.strptime(birth_date_str, '%Y-%m-%d')
        
        db.session.commit()
        flash('Профиль успешно обновлен', 'success')
        return redirect(url_for('profile'))
    
    # Получаем все вакансии пользователя с разными статусами
    pending_vacancies = Vacancy.query.filter_by(user_id=user.id, status='pending').all()
    approved_vacancies = Vacancy.query.filter_by(user_id=user.id, status='approved').all()
    rejected_vacancies = Vacancy.query.filter_by(user_id=user.id, status='rejected').all()
    
    return render_template('profile.html', user=user, 
                         pending_vacancies=pending_vacancies,
                         approved_vacancies=approved_vacancies,
                         rejected_vacancies=rejected_vacancies)

# Добавление вакансии
@app.route('/add_vacancy', methods=['GET', 'POST'])
def add_vacancy():
    if 'user_id' not in session:
        flash('Пожалуйста, войдите в систему', 'error')
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        salary = request.form['salary']
        
        if not title or not description:
            flash('Заполните обязательные поля', 'error')
            return redirect(url_for('add_vacancy'))
        
        new_vacancy = Vacancy(
            title=title,
            description=description,
            salary=salary,
            status='pending',  # Новая вакансия отправляется на модерацию
            user_id=session['user_id']
        )
        
        db.session.add(new_vacancy)
        db.session.commit()
        
        flash('Вакансия успешно добавлена и отправлена на модерацию', 'success')
        return redirect(url_for('profile'))
    
    return render_template('add_vacancy.html')

# Панель модератора
@app.route('/moderator')
def moderator_panel():
    if 'user_id' not in session or not session.get('is_moderator'):
        flash('Доступ запрещен', 'error')
        return redirect(url_for('index'))
    
    pending_vacancies = Vacancy.query.filter_by(status='pending').order_by(Vacancy.created_at.desc()).all()
    return render_template('moderator_panel.html', vacancies=pending_vacancies)

# Просмотр вакансии модератором
@app.route('/moderator/vacancy/<int:vacancy_id>', methods=['GET', 'POST'])
def moderator_vacancy(vacancy_id):
    if 'user_id' not in session or not session.get('is_moderator'):
        flash('Доступ запрещен', 'error')
        return redirect(url_for('index'))
    
    vacancy = Vacancy.query.get_or_404(vacancy_id)
    
    if request.method == 'POST':
        action = request.form['action']
        
        if action == 'approve':
            vacancy.status = 'approved'
            vacancy.rejection_reason = None
            flash('Вакансия одобрена', 'success')
        elif action == 'reject':
            vacancy.status = 'rejected'
            vacancy.rejection_reason = request.form['rejection_reason']
            flash('Вакансия отклонена', 'warning')
        
        db.session.commit()
        return redirect(url_for('moderator_panel'))
    
    return render_template('moderator_vacancy.html', vacancy=vacancy)

# Создание тестового модератора (выполнить один раз)
with app.app_context():
    # Убедимся, что таблицы созданы с актуальной структурой
    db.create_all()
    
    if not User.query.filter_by(username='moderator').first():
        hashed_password = generate_password_hash('moderator123', method='sha256')
        moderator = User(
            username='moderator',
            email='moderator@example.com',
            password=hashed_password,
            is_moderator=True,
            first_name='Moderator',
            last_name='Admin'
        )
        db.session.add(moderator)
        db.session.commit()
        print('Тестовый модератор создан: moderator / moderator123')

@app.route('/vacancy/<int:vacancy_id>/message', methods=['GET', 'POST'])
def send_message(vacancy_id):
    if 'user_id' not in session:
        flash('Пожалуйста, войдите в систему', 'error')
        return redirect(url_for('login'))
    
    vacancy = Vacancy.query.get_or_404(vacancy_id)
    if vacancy.user_id == session['user_id']:
        flash('Вы не можете отправить сообщение себе', 'error')
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        content = request.form['content']
        if not content:
            flash('Сообщение не может быть пустым', 'error')
            return redirect(url_for('send_message', vacancy_id=vacancy_id))
        
        new_message = Message(
            content=content,
            sender_id=session['user_id'],
            recipient_id=vacancy.user_id,
            vacancy_id=vacancy_id
        )
        
        db.session.add(new_message)
        db.session.commit()
        
        flash('Сообщение успешно отправлено', 'success')
        return redirect(url_for('vacancy_details', vacancy_id=vacancy_id))
    
    return render_template('send_message.html', vacancy=vacancy)

# Просмотр сообщений
@app.route('/messages')
def user_messages():
    if 'user_id' not in session:
        flash('Пожалуйста, войдите в систему', 'error')
        return redirect(url_for('login'))
    
    # Помечаем сообщения как прочитанные при открытии
    Message.query.filter_by(recipient_id=session['user_id'], is_read=False).update({'is_read': True})
    db.session.commit()
    
    received_messages = Message.query.filter_by(recipient_id=session['user_id']).order_by(Message.created_at.desc()).all()
    sent_messages = Message.query.filter_by(sender_id=session['user_id']).order_by(Message.created_at.desc()).all()
    
    return render_template('messages.html', 
                         received_messages=received_messages,
                         sent_messages=sent_messages)

# Детали вакансии (обновленный маршрут)
@app.route('/vacancy/<int:vacancy_id>')
def vacancy_details(vacancy_id):
    vacancy = Vacancy.query.get_or_404(vacancy_id)
    can_send_message = 'user_id' in session and vacancy.user_id != session['user_id']
    return render_template('vacancy_details.html', 
                         vacancy=vacancy,
                         can_send_message=can_send_message)

if __name__ == '__main__':
    app.run(debug=True)