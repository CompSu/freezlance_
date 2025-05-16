from flask import Flask, render_template, request, redirect, url_for, flash, session
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime
from flask_cors import CORS

import os

app = Flask(__name__)
CORS(app)
app.secret_key = 'stepacatmy'


basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'database.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Модельки
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
    
    rating_avg = db.Column(db.Float, default=0.0)  
    rating_count = db.Column(db.Integer, default=0)  
    is_moderator = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    
    authored_vacancies = db.relationship('Vacancy', back_populates='author', lazy=True)
    skills = db.relationship('UserSkill', backref='user', lazy=True, cascade="all, delete-orphan")
    portfolio_items = db.relationship('PortfolioItem', backref='user', lazy=True, cascade="all, delete-orphan")
    freelancer_applications = db.relationship('Application', back_populates='freelancer', lazy=True)

class UserSkill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    level = db.Column(db.Integer) 
    category = db.Column(db.String(50))  
    years_of_experience = db.Column(db.Integer)

class PortfolioItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))  
    project_url = db.Column(db.String(255))  
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    category = db.Column(db.String(50))

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    subcategories = db.relationship('Subcategory', backref='category', lazy=True)

class Subcategory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey('category.id'), nullable=False)

    __table_args__ = (
        db.UniqueConstraint('category_id', 'name', name='_category_subcategory_uc'),
    )
    subcategory_vacancies = db.relationship('Vacancy', back_populates='subcategory', lazy=True)

    def active_vacancies_count(self):
        return Vacancy.query.filter(
            Vacancy.subcategory_id == self.id,
            Vacancy.status == 'approved',
            Vacancy.is_active == True
        ).count()

class Vacancy(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    salary = db.Column(db.String(50))
    status = db.Column(db.String(20), default='pending')
    rejection_reason = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    subcategory_id = db.Column(db.Integer, db.ForeignKey('subcategory.id'), nullable=False)
    is_active = db.Column(db.Boolean, default=True)

    vacancy_applications = db.relationship(
        'Application', 
        back_populates='vacancy',
        cascade='all, delete-orphan',
        lazy=True
    )
    subcategory = db.relationship('Subcategory', back_populates='subcategory_vacancies')
    author = db.relationship('User', back_populates='authored_vacancies')

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    link = db.Column(db.String(255)) 
    
    user = db.relationship('User', backref='notifications')


class Application(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    vacancy_id = db.Column(db.Integer, db.ForeignKey('vacancy.id'), nullable=False)
    freelancer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default='pending') 
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    contact_info = db.Column(db.String(255)) 
    
    vacancy = db.relationship('Vacancy', back_populates='vacancy_applications')
    freelancer = db.relationship('User', back_populates='freelancer_applications')

class Review(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    reviewer_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    reviewed_user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    rating = db.Column(db.Integer, nullable=False) 
    text = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    is_hidden = db.Column(db.Boolean, default=False) 

    reviewer = db.relationship('User', foreign_keys=[reviewer_id], backref='reviews_given')
    reviewed_user = db.relationship('User', foreign_keys=[reviewed_user_id], backref='reviews_received')

with app.app_context():
    db.create_all()
    if not Category.query.first():
            categories_data = {
                "Дизайн": ["Логотипы", "Графика", "UI/UX", "3D-моделирование"],
                "Программирование": ["Веб-разработка", "Мобильные приложения", "Игры", "Базы данных"],
                "Маркетинг": ["SEO", "SMM", "Контекстная реклама", "Аналитика"],
                "Тексты": ["Копирайтинг", "Рерайтинг", "Переводы", "Редактирование"]
            }
            
            for cat_name, subcats in categories_data.items():
                category = Category(name=cat_name)
                db.session.add(category)
                db.session.commit()  
                
                for subcat_name in subcats:
                    subcategory = Subcategory(name=subcat_name, category_id=category.id)
                    db.session.add(subcategory)
            
            db.session.commit()
            print("Созданы начальные категории и подкатегории")

@app.route('/vacancy/<int:vacancy_id>/edit', methods=['GET', 'POST'])
def edit_vacancy(vacancy_id):
    if 'user_id' not in session:
        flash('Пожалуйста, войдите в систему', 'error')
        return redirect(url_for('login'))

    vacancy = Vacancy.query.get_or_404(vacancy_id)
    
    if vacancy.user_id != session['user_id'] and not session.get('is_moderator'):
        flash('У вас нет прав для редактирования этой вакансии', 'error')
        return redirect(url_for('vacancy_details', vacancy_id=vacancy_id))
    
    if request.method == 'POST':
        vacancy.title = request.form['title']
        vacancy.description = request.form['description']
        vacancy.salary = request.form['salary']
        vacancy.subcategory_id = request.form.get('subcategory')
        
        if session.get('is_moderator'):
            vacancy.status = request.form.get('status', vacancy.status)
            vacancy.rejection_reason = request.form.get('rejection_reason', vacancy.rejection_reason)
        else:
            if vacancy.status != 'pending':
                vacancy.status = 'pending'
                vacancy.rejection_reason = None
        
        db.session.commit()
        flash('Вакансия успешно обновлена', 'success')
        return redirect(url_for('vacancy_details', vacancy_id=vacancy_id))
    
    categories = Category.query.options(db.joinedload(Category.subcategories)).all()
    return render_template('edit_vacancy.html', 
                         vacancy=vacancy,
                         categories=categories,
                         is_moderator=session.get('is_moderator'))

@app.route('/vacancy/<int:vacancy_id>/delete', methods=['POST'])
def delete_vacancy(vacancy_id):
    if 'user_id' not in session:
        flash('Пожалуйста, войдите в систему', 'error')
        return redirect(url_for('login'))

    vacancy = Vacancy.query.get_or_404(vacancy_id)
    
    # Проверка прав
    if vacancy.author.id != session['user_id'] and not session.get('is_moderator'):
        flash('У вас нет прав для удаления этой вакансии', 'error')
        return redirect(url_for('vacancy_details', vacancy_id=vacancy_id))
    
    try:
        # Каскадное удаление сработает автоматически
        db.session.delete(vacancy)
        db.session.commit()
        flash('Вакансия и все связанные отклики успешно удалены', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Ошибка при удалении: {str(e)}', 'error')
        app.logger.error(f"Ошибка удаления вакансии {vacancy_id}: {str(e)}")
    
    return redirect(url_for('moderator_panel' if session.get('is_moderator') else 'profile'))

# Главная страница
@app.route('/')
def index():
    # Загружаем категории с подкатегориями и количеством вакансий
    categories = Category.query.options(db.joinedload(Category.subcategories)).all()
    
    # Добавляем количество вакансий к каждой подкатегории
    for category in categories:
        for subcategory in category.subcategories:
            subcategory.vacancies_count = subcategory.active_vacancies_count()
    
    # Последние активные вакансии для блока "Новые вакансии"
    recent_vacancies = Vacancy.query.filter_by(
        status='approved',
        is_active=True
    ).order_by(Vacancy.created_at.desc()).limit(5).all()
    
    return render_template('index.html',
                        categories=categories,
                        recent_vacancies=recent_vacancies)

@app.route('/category/<int:category_id>/<int:subcategory_id>')
def subcategory_vacancies(category_id, subcategory_id):
    subcategory = Subcategory.query.filter_by(
        id=subcategory_id, 
        category_id=category_id
    ).first_or_404()
    
    vacancies = Vacancy.query.filter(
        Vacancy.subcategory_id == subcategory_id,
        Vacancy.status == 'approved',
        Vacancy.is_active == True
    ).order_by(Vacancy.created_at.desc()).all()
    
    vacancies_count = len(vacancies)
    
    return render_template('subcategory.html',
                         subcategory=subcategory,
                         vacancies=vacancies,
                         vacancies_count=vacancies_count)

@app.route('/add_vacancy', methods=['GET', 'POST'])
def add_vacancy():
    if 'user_id' not in session:
        flash('Пожалуйста, войдите в систему', 'error')
        return redirect(url_for('login'))
    
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        salary = request.form['salary']
        subcategory_id = request.form.get('subcategory')
        
        if not title or not description or not subcategory_id:
            flash('Заполните обязательные поля', 'error')
            return redirect(url_for('add_vacancy'))
        
        # Проверяем существование подкатегории
        subcategory = Subcategory.query.get(subcategory_id)
        if not subcategory:
            flash('Выбранная подкатегория не существует', 'error')
            return redirect(url_for('add_vacancy'))
        
        new_vacancy = Vacancy(
            title=title,
            description=description,
            salary=salary,
            status='pending',
            user_id=session['user_id'],
            subcategory_id=subcategory_id
        )
        
        db.session.add(new_vacancy)
        db.session.commit()
        
        flash('Вакансия успешно добавлена и отправлена на модерацию', 'success')
        return redirect(url_for('profile'))
    
    categories = Category.query.options(db.joinedload(Category.subcategories)).all()
    return render_template('add_vacancy.html', categories=categories)



@app.route('/vacancy/<int:vacancy_id>/apply', methods=['GET', 'POST'])
def apply_to_vacancy(vacancy_id):
    if 'user_id' not in session:
        flash('Пожалуйста, войдите в систему', 'error')
        return redirect(url_for('login'))
    
    vacancy = Vacancy.query.get_or_404(vacancy_id)
    user = User.query.get(session['user_id'])
    
    if vacancy.user_id == user.id:
        flash('Вы не можете откликаться на свою вакансию', 'error')
        return redirect(url_for('vacancy_details', vacancy_id=vacancy_id))
    
    existing_application = Application.query.filter_by(
        vacancy_id=vacancy_id,
        freelancer_id=user.id
    ).first()
    
    if existing_application:
        flash('Вы уже откликались на эту вакансию', 'error')
        return redirect(url_for('vacancy_details', vacancy_id=vacancy_id))
    
    if request.method == 'POST':
        message = request.form['message']
        
        if not message:
            flash('Напишите сопроводительное сообщение', 'error')
            return redirect(url_for('apply_to_vacancy', vacancy_id=vacancy_id))
        
        application = Application(
            vacancy_id=vacancy_id,
            freelancer_id=user.id,
            message=message,
            status='pending'
        )
        db.session.add(application)
        
        notification = Notification(
            user_id=vacancy.user_id,
            message=f'Новый отклик на вакансию "{vacancy.title}" от пользователя {user.username}',
            link=url_for('view_applications', vacancy_id=vacancy_id)
        )
        db.session.add(notification)
        
        db.session.commit()
        
        flash('Ваш отклик отправлен заказчику', 'success')
        return redirect(url_for('vacancy_details', vacancy_id=vacancy_id))
    
    return render_template('apply_to_vacancy.html', vacancy=vacancy)

@app.route('/vacancy/<int:vacancy_id>/applications')
def view_applications(vacancy_id):
    if 'user_id' not in session:
        flash('Пожалуйста, войдите в систему', 'error')
        return redirect(url_for('login'))
    
    vacancy = Vacancy.query.get_or_404(vacancy_id)
    
    if vacancy.user_id != session['user_id'] and not session.get('is_moderator'):
        flash('У вас нет прав просматривать отклики на эту вакансию', 'error')
        return redirect(url_for('vacancy_details', vacancy_id=vacancy_id))
    
    applications = Application.query.filter_by(vacancy_id=vacancy_id).order_by(Application.created_at.desc()).all()
    
    return render_template('view_applications.html', 
                         vacancy=vacancy,
                         applications=applications)

@app.route('/application/<int:application_id>/accept', methods=['POST'])
def accept_application(application_id):
    if 'user_id' not in session:
        flash('Пожалуйста, войдите в систему', 'error')
        return redirect(url_for('login'))
    
    application = Application.query.get_or_404(application_id)
    vacancy = application.vacancy
    
    if vacancy.user_id != session['user_id']:
        flash('У вас нет прав принимать отклики на эту вакансию', 'error')
        return redirect(url_for('vacancy_details', vacancy_id=vacancy.id))
    
    contact_info = request.form['contact_info']
    
    if not contact_info:
        flash('Укажите контактную информацию для связи', 'error')
        return redirect(url_for('view_applications', vacancy_id=vacancy.id))
    
    application.status = 'accepted'
    application.contact_info = contact_info
    vacancy.is_active = False  
    
    other_applications = Application.query.filter(
        Application.vacancy_id == vacancy.id,
        Application.id != application.id,
        Application.status == 'pending'
    ).all()
    
    for app in other_applications:
        app.status = 'rejected'
        notification = Notification(
            user_id=app.freelancer_id,
            message=f'Ваш отклик на вакансию "{vacancy.title}" был отклонен, так как заказчик выбрал другого исполнителя.',
            link=url_for('vacancy_details', vacancy_id=vacancy.id)
        )
        db.session.add(notification)
    
    notification = Notification(
        user_id=application.freelancer_id,
        message=f'Ваш отклик на вакансию "{vacancy.title}" принят! Контактная информация заказчика: {contact_info}',
        link=url_for('user_profile', username=vacancy.author.username)
    )
    db.session.add(notification)
    
    db.session.commit()
    
    flash('Вы успешно выбрали исполнителя. Вакансия скрыта из общего доступа.', 'success')
    return redirect(url_for('view_applications', vacancy_id=vacancy.id))

@app.route('/application/<int:application_id>/reject', methods=['POST'])
def reject_application(application_id):
    if 'user_id' not in session:
        flash('Пожалуйста, войдите в систему', 'error')
        return redirect(url_for('login'))
    
    application = Application.query.get_or_404(application_id)
    vacancy = application.vacancy
    
    if vacancy.user_id != session['user_id']:
        flash('У вас нет прав отклонять отклики на эту вакансию', 'error')
        return redirect(url_for('vacancy_details', vacancy_id=vacancy.id))
    
    application.status = 'rejected'
    
    notification = Notification(
        user_id=application.freelancer_id,
        message=f'К сожалению, ваш отклик на вакансию "{vacancy.title}" был отклонен.',
        link=url_for('vacancy_details', vacancy_id=vacancy.id)
    )
    db.session.add(notification)
    
    db.session.commit()
    
    flash('Отклик отклонен', 'success')
    return redirect(url_for('view_applications', vacancy_id=vacancy.id))

@app.route('/notifications')
def view_notifications():
    if 'user_id' not in session:
        flash('Пожалуйста, войдите в систему', 'error')
        return redirect(url_for('login'))
    
    Notification.query.filter_by(user_id=session['user_id'], is_read=False).update({'is_read': True})
    db.session.commit()
    
    notifications = Notification.query.filter_by(user_id=session['user_id']).order_by(Notification.created_at.desc()).all()
    return render_template('notifications.html', notifications=notifications)





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
    
    pending_vacancies = Vacancy.query.filter_by(user_id=user.id, status='pending').all()
    approved_vacancies = Vacancy.query.filter_by(user_id=user.id, status='approved').all()
    rejected_vacancies = Vacancy.query.filter_by(user_id=user.id, status='rejected').all()
    
    return render_template('profile.html', user=user, 
                         pending_vacancies=pending_vacancies,
                         approved_vacancies=approved_vacancies,
                         rejected_vacancies=rejected_vacancies)

@app.route('/user/<username>')
def user_profile(username):
    # Проверяем, авторизован ли пользователь
    if 'user_id' not in session:
        flash('Пожалуйста, войдите в систему', 'error')
        return redirect(url_for('login'))
    
    # Получаем информацию о пользователе, чей профиль смотрят
    user = User.query.filter_by(username=username).first_or_404()
    
    # Получаем только одобренные вакансии пользователя
    approved_vacancies = Vacancy.query.filter_by(
        user_id=user.id, 
        status='approved'
    ).order_by(Vacancy.created_at.desc()).all()
    
    # Проверяем, является ли просматривающий пользователь владельцем профиля или модератором
    is_owner = 'user_id' in session and session['user_id'] == user.id
    is_moderator = session.get('is_moderator', False)
    
    return render_template('user_profile.html', 
                         user=user,
                         vacancies=approved_vacancies,
                         is_owner=is_owner,
                         is_moderator=is_moderator)

@app.route('/profile/skills', methods=['GET', 'POST'])
def manage_skills():
    if 'user_id' not in session:
        flash('Пожалуйста, войдите в систему', 'error')
        return redirect(url_for('login'))

    user = User.query.get(session['user_id'])
    
    if request.method == 'POST':

        if 'add_skill' in request.form:
            name = request.form['skill_name']
            level = request.form.get('skill_level')
            category = request.form.get('skill_category')
            years = request.form.get('years_of_experience')
            
            new_skill = UserSkill(
                user_id=user.id,
                name=name,
                level=level,
                category=category,
                years_of_experience=years
            )
            db.session.add(new_skill)
            flash('Навык успешно добавлен', 'success')

        elif 'delete_skill' in request.form:
            skill_id = request.form['skill_id']
            skill = UserSkill.query.filter_by(id=skill_id, user_id=user.id).first()
            if skill:
                db.session.delete(skill)
                flash('Навык удален', 'success')
        
        db.session.commit()
        return redirect(url_for('manage_skills'))
    
    return render_template('manage_skills.html', user=user)

@app.route('/profile/portfolio', methods=['GET', 'POST'])
def manage_portfolio():
    if 'user_id' not in session:
        flash('Пожалуйста, войдите в систему', 'error')
        return redirect(url_for('login'))

    user = User.query.get(session['user_id'])
    
    if request.method == 'POST':
        # Добавление новой работы в портфолио
        if 'add_item' in request.form:
            title = request.form['item_title']
            description = request.form['item_description']
            image_url = request.form['item_image_url']
            project_url = request.form['item_project_url']
            category = request.form['item_category']
            
            new_item = PortfolioItem(
                user_id=user.id,
                title=title,
                description=description,
                image_url=image_url,
                project_url=project_url,
                category=category
            )
            db.session.add(new_item)
            flash('Работа добавлена в портфолио', 'success')
        
        # Удаление работы из портфолио
        elif 'delete_item' in request.form:
            item_id = request.form['item_id']
            item = PortfolioItem.query.filter_by(id=item_id, user_id=user.id).first()
            if item:
                db.session.delete(item)
                flash('Работа удалена из портфолио', 'success')
        
        db.session.commit()
        return redirect(url_for('manage_portfolio'))
    
    return render_template('manage_portfolio.html', user=user)

@app.route('/user/<username>/reviews')
def user_reviews(username):
    user = User.query.filter_by(username=username).first_or_404()
    reviews = Review.query.filter_by(
        reviewed_user_id=user.id,
        is_hidden=False
    ).order_by(Review.created_at.desc()).all()
    
    return render_template('user_reviews.html', 
                        user=user,
                        reviews=reviews)

@app.route('/user/<username>/add_review', methods=['GET', 'POST'])
def add_review(username):
    if 'user_id' not in session:
        flash('Пожалуйста, войдите в систему', 'error')
        return redirect(url_for('login'))

    reviewed_user = User.query.filter_by(username=username).first_or_404()
    
    if reviewed_user.id == session['user_id']:
        flash('Вы не можете оставить отзыв самому себе', 'error')
        return redirect(url_for('user_profile', username=username))
    
    existing_review = Review.query.filter_by(
        reviewer_id=session['user_id'],
        reviewed_user_id=reviewed_user.id
    ).first()
    
    if existing_review:
        flash('Вы уже оставляли отзыв этому пользователю', 'error')
        return redirect(url_for('user_profile', username=username))
    
    if request.method == 'POST':
        rating = int(request.form['rating'])
        text = request.form['text']
        
        if not 1 <= rating <= 5:
            flash('Оценка должна быть от 1 до 5', 'error')
            return redirect(url_for('add_review', username=username))
        
        new_review = Review(
            reviewer_id=session['user_id'],
            reviewed_user_id=reviewed_user.id,
            rating=rating,
            text=text
        )
        
        db.session.add(new_review)
        db.session.commit()
        
        update_user_rating(reviewed_user.id)
        
        flash('Ваш отзыв успешно добавлен', 'success')
        return redirect(url_for('user_profile', username=username))
    
    return render_template('add_review.html', user=reviewed_user)

@app.route('/review/<int:review_id>/delete', methods=['POST'])
def delete_review(review_id):
    if 'user_id' not in session or not session.get('is_moderator'):
        flash('Доступ запрещен', 'error')
        return redirect(url_for('index'))

    review = Review.query.get_or_404(review_id)
    user_id = review.reviewed_user_id
    
    db.session.delete(review)
    db.session.commit()
    
    # Обновляем рейтинг пользователя
    update_user_rating(user_id)
    
    flash('Отзыв удален', 'success')
    return redirect(url_for('user_reviews', username=review.reviewed_user.username))

def update_user_rating(user_id):
    user = User.query.get(user_id)
    if user:
        # Получаем все видимые отзывы
        reviews = Review.query.filter_by(
            reviewed_user_id=user_id,
            is_hidden=False
        ).all()
        
        if reviews:
            total = sum(review.rating for review in reviews)
            user.rating_avg = round(total / len(reviews), 1)
            user.rating_count = len(reviews)
        else:
            user.rating_avg = 0.0
            user.rating_count = 0
        
        db.session.commit()

#moderka
@app.route('/moderator')
def moderator_panel():
    if 'user_id' not in session or not session.get('is_moderator'):
        flash('Доступ запрещен', 'error')
        return redirect(url_for('index'))
    
    pending_vacancies = Vacancy.query.filter_by(status='pending').order_by(Vacancy.created_at.desc()).all()
    return render_template('moderator_panel.html', vacancies=pending_vacancies)

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


with app.app_context():
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

@app.route('/vacancy/<int:vacancy_id>')
def vacancy_details(vacancy_id):
    vacancy = Vacancy.query.get_or_404(vacancy_id)
    can_send_message = 'user_id' in session and vacancy.user_id != session['user_id']
    return render_template('vacancy_details.html', 
                         vacancy=vacancy,
                         can_send_message=can_send_message)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
