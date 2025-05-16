from app import db, User
from werkzeug.security import generate_password_hash
from datetime import datetime

# Проверяем, существует ли уже модератор
moderator = User.query.filter_by(username='moderator').first()

if not moderator:
    # Создаем нового модератора
    hashed_password = generate_password_hash('moderator123', method='sha256')
    moderator = User(
        username='moderator',
        email='moderator@example.com',
        password=hashed_password,
        is_moderator=True,
        first_name='Moderator',
        last_name='Admin',
        created_at=datetime.utcnow()
    )
    db.session.add(moderator)
    db.session.commit()
    print('Тестовый модератор создан успешно!')
    print('Логин: moderator')
    print('Пароль: moderator123')
else:
    print('Модератор уже существует в базе данных') 