from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from datetime import datetime
from flask_cors import CORS

import os

app = Flask(__name__)
CORS(app, supports_credentials=True)
app.secret_key = 'stepacatmy'

# Настройка загрузки файлов
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static', 'avatars')
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Создаем директорию, если её нет
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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
    avatar_url = db.Column(db.String(255))
    
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

    @property
    def active_vacancies(self):
        return [v for v in self.authored_vacancies if v.status == 'approved' and v.is_active]

    @property
    def pending_vacancies(self):
        return [v for v in self.authored_vacancies if v.status == 'pending']

    @property
    def rejected_vacancies(self):
        return [v for v in self.authored_vacancies if v.status == 'rejected']

    def to_dict(self, include_private=False):
        data = {
            'id': self.id,
            'username': self.username,
            'first_name': self.first_name,
            'last_name': self.last_name,
            'about': self.about,
            'rating_avg': self.rating_avg,
            'rating_count': self.rating_count,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'birth_date': self.birth_date.isoformat() if self.birth_date else None,
            'avatar_url': self.avatar_url,
            'active_vacancies_count': len(self.active_vacancies)
        }
        if include_private:
            data.update({
                'email': self.email,
                'phone': self.phone,
                'is_moderator': self.is_moderator
            })
        return data

class UserSkill(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    level = db.Column(db.Integer) 
    category = db.Column(db.String(50))  
    years_of_experience = db.Column(db.Integer)

    def to_dict(self):
        try:
            return {
                'id': self.id,
                'name': self.name,
                'level': self.level,
                'category': self.category,
                'years_of_experience': self.years_of_experience
            }
        except Exception as e:
            print(f"Error serializing skill {self.name}: {str(e)}")
            return None

class PortfolioItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    title = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(255))  
    project_url = db.Column(db.String(255))  
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    category = db.Column(db.String(50))

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'image_url': self.image_url,
            'project_url': self.project_url,
            'category': self.category,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }

class Category(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    subcategories = db.relationship('Subcategory', backref='category', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'subcategories': [sub.to_dict() for sub in self.subcategories]
        }

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

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'category_id': self.category_id,
            'active_vacancies_count': self.active_vacancies_count()
        }

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

    def to_dict(self, include_applications=False):
        try:
            data = {
                'id': self.id,
                'title': self.title,
                'description': self.description,
                'salary': self.salary,
                'status': self.status,
                'rejection_reason': self.rejection_reason,
                'created_at': self.created_at.isoformat() if self.created_at else None,
                'is_active': self.is_active
            }
            
            # Безопасное получение связанных данных
            try:
                if self.author:
                    data['author'] = self.author.to_dict()
            except Exception as e:
                print(f"Error serializing vacancy author: {str(e)}")
                data['author'] = None

            try:
                if self.subcategory:
                    data['subcategory'] = self.subcategory.to_dict()
            except Exception as e:
                print(f"Error serializing vacancy subcategory: {str(e)}")
                data['subcategory'] = None

            if include_applications:
                try:
                    data['applications'] = [app.to_dict() for app in self.vacancy_applications]
                except Exception as e:
                    print(f"Error serializing vacancy applications: {str(e)}")
                    data['applications'] = []

            return data
        except Exception as e:
            print(f"Error serializing vacancy {self.title}: {str(e)}")
            return None

class Notification(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    link = db.Column(db.String(255)) 
    
    user = db.relationship('User', backref='notifications')

    def to_dict(self):
        return {
            'id': self.id,
            'message': self.message,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'link': self.link
        }

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

    def to_dict(self):
        return {
            'id': self.id,
            'message': self.message,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'contact_info': self.contact_info,
            'freelancer': self.freelancer.to_dict(),
            'vacancy': {
                'id': self.vacancy.id,
                'title': self.vacancy.title
            }
        }

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

    def to_dict(self):
        return {
            'id': self.id,
            'rating': self.rating,
            'text': self.text,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'is_hidden': self.is_hidden,
            'reviewer': self.reviewer.to_dict(),
            'reviewed_user': self.reviewed_user.to_dict()
        }

with app.app_context():
    db.create_all()
    if not Category.query.first():
            categories_data = {
                "Дизайн": ["Логотипы", "Графика", "UI/UX", "3D-моделирование", "Обработка и редактирование", "Реклама", "Полиграфия"],
                "Разработка": ["Веб-разработка", "Мобильные приложения", "Игры", "Базы данных", "Скрипты и боты", "Тестирование"],
                "Маркетинг": ["SEO", "SMM", "Контекстная реклама", "Аналитика"],
                "Тексты": ["Копирайтинг", "Рерайтинг", "Переводы", "Редактирование", "Контент", "Бизнес-тексты", "Набор текста", "Резюме"],
                "Бизнес": ["Бухгалтерия", "Обзвоны", "Юридические услуги", "Продажа сайтов", "HR", "Презентации", "Строительство"],
                "Медиа": ["Аудио", "Музыка", "Аудиомонтаж", "Видео", "Анимация"]
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
@app.route('/api/vacancies', methods=['GET'])
def index():
    categories = Category.query.options(db.joinedload(Category.subcategories)).all()
    
    # Добавляем количество вакансий к каждой подкатегории
    for category in categories:
        for subcategory in category.subcategories:
            subcategory.vacancies_count = subcategory.active_vacancies_count()
    
    recent_vacancies = Vacancy.query.filter_by(
        status='approved',
        is_active=True
    ).order_by(Vacancy.created_at.desc()).limit(5).all()
    
    return jsonify({
        'categories': [category.to_dict() for category in categories],
        'recent_vacancies': [vacancy.to_dict() for vacancy in recent_vacancies]
    })

@app.route('/api/categories/<int:category_id>/subcategories/<int:subcategory_id>/vacancies')
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
    
    return jsonify({
        'subcategory': subcategory.to_dict(),
        'vacancies': [vacancy.to_dict() for vacancy in vacancies],
        'vacancies_count': len(vacancies)
    })

@app.route('/api/vacancies', methods=['POST'])
def add_vacancy():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    title = data.get('title')
    description = data.get('description')
    salary = data.get('salary')
    subcategory_id = data.get('subcategory_id')
    
    if not all([title, description, subcategory_id]):
        return jsonify({'error': 'Title, description and subcategory are required'}), 400
    
    subcategory = Subcategory.query.get(subcategory_id)
    if not subcategory:
        return jsonify({'error': 'Invalid subcategory'}), 400
    
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
    
    return jsonify({
        'message': 'Vacancy added successfully and sent for moderation',
        'vacancy': new_vacancy.to_dict()
    }), 201

@app.route('/api/vacancies/<int:vacancy_id>', methods=['GET', 'PUT', 'DELETE'])
def vacancy_details(vacancy_id):
    vacancy = Vacancy.query.get_or_404(vacancy_id)
    
    if request.method == 'GET':
        can_send_message = 'user_id' in session and vacancy.user_id != session['user_id']
        response = vacancy.to_dict()
        response['can_send_message'] = can_send_message
        return jsonify(response)
    
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
        
    if vacancy.user_id != session['user_id'] and not session.get('is_moderator'):
        return jsonify({'error': 'Access denied'}), 403
    
    if request.method == 'PUT':
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        vacancy.title = data.get('title', vacancy.title)
        vacancy.description = data.get('description', vacancy.description)
        vacancy.salary = data.get('salary', vacancy.salary)
        
        if 'subcategory_id' in data:
            subcategory = Subcategory.query.get(data['subcategory_id'])
            if not subcategory:
                return jsonify({'error': 'Invalid subcategory'}), 400
            vacancy.subcategory_id = data['subcategory_id']
        
        if session.get('is_moderator'):
            vacancy.status = data.get('status', vacancy.status)
            vacancy.rejection_reason = data.get('rejection_reason', vacancy.rejection_reason)
        else:
            if vacancy.status != 'pending':
                vacancy.status = 'pending'
                vacancy.rejection_reason = None
        
        db.session.commit()
        return jsonify({
            'message': 'Vacancy updated successfully',
            'vacancy': vacancy.to_dict()
        })
    
    elif request.method == 'DELETE':
        try:
            db.session.delete(vacancy)
            db.session.commit()
            return jsonify({'message': 'Vacancy and all related applications deleted successfully'})
        except Exception as e:
            db.session.rollback()
            return jsonify({'error': f'Error deleting vacancy: {str(e)}'}), 500

@app.route('/api/vacancies/<int:vacancy_id>/applications', methods=['GET', 'POST'])
def manage_applications(vacancy_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    vacancy = Vacancy.query.get_or_404(vacancy_id)
    user = User.query.get(session['user_id'])
    
    if request.method == 'GET':
        if vacancy.user_id != session['user_id'] and not session.get('is_moderator'):
            return jsonify({'error': 'Access denied'}), 403
            
        applications = Application.query.filter_by(vacancy_id=vacancy_id).order_by(Application.created_at.desc()).all()
        return jsonify({
            'vacancy': vacancy.to_dict(),
            'applications': [app.to_dict() for app in applications]
        })
    
    # POST - создание нового отклика
    if vacancy.user_id == user.id:
        return jsonify({'error': 'You cannot apply to your own vacancy'}), 400
    
    existing_application = Application.query.filter_by(
        vacancy_id=vacancy_id,
        freelancer_id=user.id
    ).first()
    
    if existing_application:
        return jsonify({'error': 'You have already applied to this vacancy'}), 400
    
    data = request.get_json()
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400
    
    application = Application(
        vacancy_id=vacancy_id,
        freelancer_id=user.id,
        message=data['message'],
        status='pending'
    )
    db.session.add(application)
    
    notification = Notification(
        user_id=vacancy.user_id,
        message=f'New application for vacancy "{vacancy.title}" from user {user.username}',
        link=f'/api/vacancies/{vacancy_id}/applications'
    )
    db.session.add(notification)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Application sent successfully',
        'application': application.to_dict()
    }), 201

@app.route('/api/applications/<int:application_id>', methods=['GET'])
def get_application(application_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
        
    application = Application.query.get_or_404(application_id)
    
    # Проверяем, что пользователь имеет доступ к этому предложению
    if application.freelancer_id != session['user_id']:
        return jsonify({'error': 'Access denied'}), 403
        
    return jsonify({
        'application': application.to_dict()
    })

@app.route('/api/applications/<int:application_id>/accept', methods=['POST'])
def accept_application_by_freelancer(application_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
        
    application = Application.query.get_or_404(application_id)
    
    # Проверяем, что пользователь имеет доступ к этому предложению
    if application.freelancer_id != session['user_id']:
        return jsonify({'error': 'Access denied'}), 403
        
    if application.status != 'accepted':
        return jsonify({'error': 'Application is not accepted by client'}), 400
        
    data = request.get_json()
    if not data or 'comment' not in data:
        return jsonify({'error': 'Comment is required'}), 400
        
    # Обновляем статус и добавляем комментарий
    application.status = 'in_progress'
    
    # Создаем уведомление для заказчика
    notification = Notification(
        user_id=application.vacancy.user_id,
        message=f'Фрилансер {application.freelancer.username} принял ваше предложение по вакансии "{application.vacancy.title}"',
        link=f'/vacancies/{application.vacancy_id}'
    )
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({
        'message': 'Application accepted successfully',
        'application': application.to_dict()
    })

@app.route('/api/applications/<int:application_id>/reject', methods=['POST'])
def reject_application(application_id):
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    application = Application.query.get_or_404(application_id)
    vacancy = application.vacancy
    
    if vacancy.user_id != session['user_id']:
        return jsonify({'error': 'Access denied'}), 403
    
    application.status = 'rejected'
    
    notification = Notification(
        user_id=application.freelancer_id,
        message=f'Your application for vacancy "{vacancy.title}" was rejected.',
        link=f'/api/vacancies/{vacancy.id}'
    )
    db.session.add(notification)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Application rejected successfully',
        'application': application.to_dict()
    })

@app.route('/api/notifications')
def view_notifications():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    # Помечаем все непрочитанные уведомления как прочитанные
    Notification.query.filter_by(user_id=session['user_id'], is_read=False).update({'is_read': True})
    db.session.commit()
    
    notifications = Notification.query.filter_by(user_id=session['user_id']).order_by(Notification.created_at.desc()).all()
    return jsonify({
        'notifications': [notification.to_dict() for notification in notifications]
    })

@app.route('/api/notifications', methods=['POST'])
def create_notification():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    target_user_id = data.get('user_id')
    message = data.get('message')
    link = data.get('link')
    
    if not all([target_user_id, message]):
        return jsonify({'error': 'User ID and message are required'}), 400
    
    notification = Notification(
        user_id=target_user_id,
        message=message,
        link=link
    )
    
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({
        'message': 'Notification created successfully',
        'notification': notification.to_dict()
    }), 201

# Регистрация
@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirm_password')
    
    if not all([username, email, password, confirm_password]):
        return jsonify({'error': 'All fields are required'}), 400
    
    if password != confirm_password:
        return jsonify({'error': 'Passwords do not match'}), 400
    
    existing_user = User.query.filter((User.username == username) | (User.email == email)).first()
    if existing_user:
        return jsonify({'error': 'User with this username or email already exists'}), 409
    
    hashed_password = generate_password_hash(password, method='sha256')
    new_user = User(username=username, email=email, password=hashed_password)
    
    db.session.add(new_user)
    db.session.commit()
    
    return jsonify({'message': 'Registration successful', 'user': new_user.to_dict()}), 201

# Вход
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    username = data.get('username')
    password = data.get('password')
    
    if not all([username, password]):
        return jsonify({'error': 'Username and password are required'}), 400
    
    user = User.query.filter_by(username=username).first()
    
    if not user or not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    session['user_id'] = user.id
    session['username'] = user.username
    session['is_moderator'] = user.is_moderator
    
    print("Login successful. Session data:", dict(session))  # Добавляем отладочный вывод
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict(include_private=True)
    })

# Выход
@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'message': 'Logged out successfully'})

# Профиль
@app.route('/api/profile', methods=['GET', 'PUT'])
def profile():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    user = User.query.get(session['user_id'])
    
    if request.method == 'GET':
        user_data = user.to_dict(include_private=True)
        user_data.update({
            'pending_vacancies': [v.to_dict() for v in Vacancy.query.filter_by(user_id=user.id, status='pending').all()],
            'approved_vacancies': [v.to_dict() for v in Vacancy.query.filter_by(user_id=user.id, status='approved').all()],
            'rejected_vacancies': [v.to_dict() for v in Vacancy.query.filter_by(user_id=user.id, status='rejected').all()]
        })
        return jsonify(user_data)
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    user.phone = data.get('phone', user.phone)
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.about = data.get('about', user.about)
    
    birth_date = data.get('birth_date')
    if birth_date:
        try:
            user.birth_date = datetime.fromisoformat(birth_date)
        except ValueError:
            return jsonify({'error': 'Invalid date format'}), 400
    
    db.session.commit()
    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict(include_private=True)
    })

@app.route('/api/users/<username>', methods=['GET'])
def user_profile(username):
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    current_user_id = session['user_id']
    print(f"Current user ID: {current_user_id}")
    
    user = User.query.filter_by(username=username).first_or_404()
    print(f"Requested user: {user.username} (ID: {user.id})")
    
    # Проверяем все вакансии пользователя
    all_vacancies = Vacancy.query.filter_by(user_id=user.id).all()
    print(f"All user vacancies: {len(all_vacancies)}")
    for v in all_vacancies:
        print(f"Vacancy: {v.title}, Status: {v.status}, Active: {v.is_active}")
    
    # Проверяем все навыки пользователя
    all_skills = UserSkill.query.filter_by(user_id=user.id).all()
    print(f"All user skills: {len(all_skills)}")
    for s in all_skills:
        print(f"Skill: {s.name}, Level: {s.level}, Category: {s.category}")
    
    # Получаем вакансии с полной загрузкой связанных данных
    user_vacancies = Vacancy.query.filter_by(
        user_id=user.id
    ).options(
        db.joinedload(Vacancy.subcategory).joinedload(Subcategory.category),
        db.joinedload(Vacancy.author)
    ).all()
    
    # Разделяем вакансии по статусам
    approved_vacancies = [v for v in user_vacancies if v.status == 'approved' and v.is_active]
    pending_vacancies = [v for v in user_vacancies if v.status == 'pending']
    rejected_vacancies = [v for v in user_vacancies if v.status == 'rejected']
    
    print(f"Processed vacancies - Approved: {len(approved_vacancies)}, Pending: {len(pending_vacancies)}, Rejected: {len(rejected_vacancies)}")
    
    # Получаем навыки и портфолио
    skills = UserSkill.query.filter_by(user_id=user.id).all()
    portfolio_items = PortfolioItem.query.filter_by(user_id=user.id).all()
    
    is_owner = current_user_id == user.id
    is_moderator = session.get('is_moderator', False)
    
    print(f"Access check - Is owner: {is_owner}, Is moderator: {is_moderator}")
    
    # Подготавливаем данные для ответа
    response_data = user.to_dict(include_private=is_owner)
    
    # Всегда включаем публичные данные
    public_data = {
        'approved_vacancies': [v.to_dict(include_applications=False) for v in approved_vacancies],
        'skills': [skill.to_dict() for skill in skills],
        'portfolio_items': [item.to_dict() for item in portfolio_items],
        'is_owner': is_owner,
        'is_moderator': is_moderator,
        'total_approved_vacancies': len(approved_vacancies),
        'total_skills': len(skills)
    }
    response_data.update(public_data)
    
    # Добавляем приватные данные только для владельца
    if is_owner or is_moderator:
        private_data = {
            'pending_vacancies': [v.to_dict(include_applications=False) for v in pending_vacancies],
            'rejected_vacancies': [v.to_dict(include_applications=False) for v in rejected_vacancies]
        }
        response_data.update(private_data)
    
    print("Final response data counts:", {
        'approved_vacancies': len(response_data.get('approved_vacancies', [])),
        'pending_vacancies': len(response_data.get('pending_vacancies', [])),
        'rejected_vacancies': len(response_data.get('rejected_vacancies', [])),
        'skills': len(response_data.get('skills', [])),
        'portfolio_items': len(response_data.get('portfolio_items', []))
    })
    
    return jsonify(response_data)

@app.route('/api/profile/skills', methods=['GET', 'POST', 'DELETE'])
def manage_skills():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401

    user = User.query.get(session['user_id'])
    
    if request.method == 'GET':
        return jsonify({
            'skills': [skill.to_dict() for skill in user.skills]
        })
    
    elif request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        name = data.get('name')
        if not name:
            return jsonify({'error': 'Skill name is required'}), 400
            
        level = data.get('level')
        if not isinstance(level, int) or not 1 <= level <= 5:
            return jsonify({'error': 'Skill level must be between 1 and 5'}), 400
            
        years_of_experience = data.get('years_of_experience')
        if years_of_experience is not None:
            try:
                years_of_experience = int(years_of_experience)
                if years_of_experience < 0:
                    return jsonify({'error': 'Years of experience cannot be negative'}), 400
            except ValueError:
                return jsonify({'error': 'Invalid years of experience value'}), 400
            
        new_skill = UserSkill(
            user_id=user.id,
            name=name,
            level=level,
            category=data.get('category'),
            years_of_experience=years_of_experience
        )
        db.session.add(new_skill)
        db.session.commit()
        
        return jsonify({
            'message': 'Skill added successfully',
            'skill': new_skill.to_dict()
        }), 201
    
    elif request.method == 'DELETE':
        data = request.get_json()
        if not data or 'skill_id' not in data:
            return jsonify({'error': 'Skill ID is required'}), 400
            
        skill = UserSkill.query.filter_by(id=data['skill_id'], user_id=user.id).first()
        if not skill:
            return jsonify({'error': 'Skill not found'}), 404
            
        db.session.delete(skill)
        db.session.commit()
        
        return jsonify({'message': 'Skill deleted successfully'})

@app.route('/api/profile/portfolio', methods=['GET', 'POST', 'DELETE'])
def manage_portfolio():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401

    user = User.query.get(session['user_id'])
    
    if request.method == 'GET':
        return jsonify({
            'portfolio_items': [item.to_dict() for item in user.portfolio_items]
        })
    
    elif request.method == 'POST':
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No data provided'}), 400
            
        title = data.get('title')
        if not title:
            return jsonify({'error': 'Title is required'}), 400
            
        new_item = PortfolioItem(
            user_id=user.id,
            title=title,
            description=data.get('description'),
            image_url=data.get('image_url'),
            project_url=data.get('project_url'),
            category=data.get('category')
        )
        db.session.add(new_item)
        db.session.commit()
        
        return jsonify({
            'message': 'Portfolio item added successfully',
            'portfolio_item': new_item.to_dict()
        }), 201
    
    elif request.method == 'DELETE':
        data = request.get_json()
        if not data or 'item_id' not in data:
            return jsonify({'error': 'Portfolio item ID is required'}), 400
            
        item = PortfolioItem.query.filter_by(id=data['item_id'], user_id=user.id).first()
        if not item:
            return jsonify({'error': 'Portfolio item not found'}), 404
            
        db.session.delete(item)
        db.session.commit()
        
        return jsonify({'message': 'Portfolio item deleted successfully'})

@app.route('/api/users/<username>/reviews', methods=['GET'])
def user_reviews(username):
    user = User.query.filter_by(username=username).first_or_404()
    reviews = Review.query.filter_by(
        reviewed_user_id=user.id,
        is_hidden=False
    ).order_by(Review.created_at.desc()).all()
    
    return jsonify({
        'user': user.to_dict(),
        'reviews': [review.to_dict() for review in reviews]
    })

@app.route('/api/users/<username>/reviews', methods=['POST'])
def add_review(username):
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401

    reviewed_user = User.query.filter_by(username=username).first_or_404()
    
    if reviewed_user.id == session['user_id']:
        return jsonify({'error': 'You cannot review yourself'}), 400
    
    existing_review = Review.query.filter_by(
        reviewer_id=session['user_id'],
        reviewed_user_id=reviewed_user.id
    ).first()
    
    if existing_review:
        return jsonify({'error': 'You have already reviewed this user'}), 400
    
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data provided'}), 400
        
    rating = data.get('rating')
    text = data.get('text')
    
    if not rating or not text:
        return jsonify({'error': 'Rating and text are required'}), 400
        
    try:
        rating = int(rating)
        if not 1 <= rating <= 5:
            return jsonify({'error': 'Rating must be between 1 and 5'}), 400
    except ValueError:
        return jsonify({'error': 'Invalid rating value'}), 400
    
    new_review = Review(
        reviewer_id=session['user_id'],
        reviewed_user_id=reviewed_user.id,
        rating=rating,
        text=text
    )
    
    db.session.add(new_review)
    db.session.commit()
    
    update_user_rating(reviewed_user.id)
    
    return jsonify({
        'message': 'Review added successfully',
        'review': new_review.to_dict()
    }), 201

@app.route('/api/reviews/<int:review_id>', methods=['DELETE'])
def delete_review(review_id):
    if 'user_id' not in session or not session.get('is_moderator'):
        return jsonify({'error': 'Access denied'}), 403

    review = Review.query.get_or_404(review_id)
    user_id = review.reviewed_user_id
    
    db.session.delete(review)
    db.session.commit()
    
    update_user_rating(user_id)
    
    return jsonify({'message': 'Review deleted successfully'})

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
@app.route('/api/moderator/vacancies', methods=['GET'])
def moderator_panel():
    print("Session data:", dict(session))  # Добавляем отладочный вывод
    if 'user_id' not in session or not session.get('is_moderator'):
        return jsonify({'error': 'Access denied'}), 403
    
    pending_vacancies = Vacancy.query.filter_by(status='pending').order_by(Vacancy.created_at.desc()).all()
    return jsonify({
        'pending_vacancies': [vacancy.to_dict() for vacancy in pending_vacancies]
    })

@app.route('/api/moderator/vacancies/<int:vacancy_id>', methods=['PUT'])
def moderator_vacancy(vacancy_id):
    if 'user_id' not in session or not session.get('is_moderator'):
        return jsonify({'error': 'Access denied'}), 403
    
    vacancy = Vacancy.query.get_or_404(vacancy_id)
    
    data = request.get_json()
    if not data or 'action' not in data:
        return jsonify({'error': 'Action is required'}), 400
    
    action = data['action']
    
    if action == 'approve':
        vacancy.status = 'approved'
        vacancy.rejection_reason = None
        
        # Добавляем уведомление для автора вакансии
        notification = Notification(
            user_id=vacancy.user_id,
            message=f'Ваша вакансия "{vacancy.title}" была одобрена модератором',
            link=f'/vacancies/{vacancy.id}'
        )
        db.session.add(notification)
        message = 'Vacancy approved successfully'
        
    elif action == 'reject':
        if 'rejection_reason' not in data:
            return jsonify({'error': 'Rejection reason is required'}), 400
        vacancy.status = 'rejected'
        vacancy.rejection_reason = data['rejection_reason']
        
        # Добавляем уведомление о отклонении
        notification = Notification(
            user_id=vacancy.user_id,
            message=f'Ваша вакансия "{vacancy.title}" была отклонена. Причина: {data["rejection_reason"]}',
            link=f'/vacancies/{vacancy.id}'
        )
        db.session.add(notification)
        message = 'Vacancy rejected successfully'
    else:
        return jsonify({'error': 'Invalid action'}), 400
    
    db.session.commit()
    return jsonify({
        'message': message,
        'vacancy': vacancy.to_dict()
    })

@app.route('/api/categories/<string:name>/vacancies')
def category_vacancies(name):
    print(f"Searching vacancies for category: {name}")  # Добавляем лог
    
    # Находим все подкатегории для данной категории
    category = Category.query.filter_by(name=name).first_or_404()
    subcategories = category.subcategories
    print(f"Found subcategories: {[sub.name for sub in subcategories]}")  # Добавляем лог
    
    # Получаем все активные вакансии для всех подкатегорий
    vacancies = []
    for subcategory in subcategories:
        subcategory_vacancies = Vacancy.query.filter(
            Vacancy.subcategory_id == subcategory.id,
            Vacancy.status == 'approved',
            Vacancy.is_active == True
        ).all()
        print(f"Found {len(subcategory_vacancies)} vacancies for subcategory {subcategory.name}")  # Добавляем лог
        vacancies.extend(subcategory_vacancies)
    
    # Сортируем по дате создания
    vacancies.sort(key=lambda x: x.created_at, reverse=True)
    
    response_data = {
        'category': category.to_dict(),
        'vacancies': [vacancy.to_dict() for vacancy in vacancies],
        'vacancies_count': len(vacancies)
    }
    print(f"Total vacancies found: {len(vacancies)}")  # Добавляем лог
    return jsonify(response_data)

@app.route('/api/profile/avatar', methods=['POST'])
def upload_avatar():
    if 'user_id' not in session:
        return jsonify({'error': 'Authentication required'}), 401
    
    if 'avatar' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
        
    file = request.files['avatar']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
        
    if file and allowed_file(file.filename):
        # Создаем уникальное имя файла
        filename = secure_filename(f"{session['user_id']}_{int(datetime.now().timestamp())}_{file.filename}")
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Удаляем старый аватар, если он есть
        user = User.query.get(session['user_id'])
        if user.avatar_url:
            old_avatar = os.path.join(app.config['UPLOAD_FOLDER'], os.path.basename(user.avatar_url))
            if os.path.exists(old_avatar):
                os.remove(old_avatar)
        
        # Сохраняем новый файл
        file.save(filepath)
        
        # Обновляем URL аватара в базе данных
        user.avatar_url = f"/static/avatars/{filename}"
        db.session.commit()
        
        return jsonify({
            'message': 'Avatar uploaded successfully',
            'avatar_url': user.avatar_url
        })
    
    return jsonify({'error': 'Invalid file type'}), 400

# Добавляем маршрут для доступа к статическим файлам
@app.route('/static/avatars/<path:filename>')
def serve_avatar(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/debug/user/<username>', methods=['GET'])
def debug_user_data(username):
    if 'user_id' not in session or not session.get('is_moderator'):
        return jsonify({'error': 'Access denied'}), 403
        
    user = User.query.filter_by(username=username).first_or_404()
    
    # Собираем все данные пользователя
    debug_data = {
        'user_info': {
            'id': user.id,
            'username': user.username,
            'is_moderator': user.is_moderator,
            'created_at': user.created_at.isoformat() if user.created_at else None
        },
        'vacancies': [{
            'id': v.id,
            'title': v.title,
            'status': v.status,
            'is_active': v.is_active,
            'created_at': v.created_at.isoformat() if v.created_at else None
        } for v in user.authored_vacancies],
        'skills': [{
            'id': s.id,
            'name': s.name,
            'level': s.level,
            'category': s.category
        } for s in user.skills],
        'portfolio': [{
            'id': p.id,
            'title': p.title,
            'category': p.category
        } for p in user.portfolio_items]
    }
    
    return jsonify(debug_data)

if __name__ == '__main__':
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
            print('Test moderator created: moderator / moderator123')
    
    app.run(host='0.0.0.0', port=5000)
