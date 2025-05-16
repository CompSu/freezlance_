import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import LoginModal from './LoginModal';
import RegisterModal from './RegisterModal';
import api from '../api/axios';

const categories = [
    "Дизайн",
    "Разработка",
    "Маркетинг",
    "Тексты",
    "Бизнес",
    "Медиа"
];

const Header = () => {
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [user, setUser] = useState(null);
    const [showCategories, setShowCategories] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [showAuthDropdown, setShowAuthDropdown] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    useEffect(() => {
        if (user) {
            loadNotifications();
        }
    }, [user]);

    const loadNotifications = async () => {
        try {
            const response = await api.get('/notifications');
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Ошибка при загрузке уведомлений:', error);
        }
    };

    const handleLoginSuccess = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        setShowLoginModal(false);
    };

    const handleRegisterSuccess = (userData) => {
        setShowLoginModal(true);
        setShowRegisterModal(false);
    };

    const handleLogout = async () => {
        try {
            await api.post('/logout');
            localStorage.removeItem('user');
            setUser(null);
            navigate('/');
        } catch (error) {
            console.error('Ошибка при выходе:', error);
        }
    };

    const handleSearch = (e) => {
        if (e.key === 'Enter') {
            const query = e.target.value;
            navigate(`/search?q=${encodeURIComponent(query)}`);
        }
    };

    const handleCategoryClick = (category) => {
        setShowCategories(false);
        navigate(`/category/${encodeURIComponent(category)}`);
    };

    return (
        <header>
            <Link to="/" className="logo">
                <img src="/logo.png" alt="Freezlance" />
                <span>Freezlance</span>
            </Link>

            <div className="buttons">
                <div className="search-wrapper">
                    <div className="search-container">
                        <button className="search-button">
                            <img src="/поиск.svg" alt="Поиск" className="search-icon" />
                        </button>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Поиск..."
                            onKeyPress={handleSearch}
                        />
                    </div>
                </div>

                {user && (
                    <div className="notification-container">
                        <button 
                            className={`circle-button ${showNotifications ? 'active' : ''}`}
                            onClick={() => setShowNotifications(!showNotifications)}
                        >
                            <img src="/уведомления.svg" alt="Уведомления" />
                        </button>
                        {showNotifications && (
                            <div className="notification-dropdown">
                                <div className="notification-header">
                                    <h3>Уведомления</h3>
                                </div>
                                <div className="notifications-list">
                                    {notifications.map(notification => (
                                        <div 
                                            key={notification.id} 
                                            className={`notification-item ${notification.is_read ? 'read' : ''}`}
                                            onClick={() => navigate(notification.link)}
                                        >
                                            {notification.message}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="categories-container">
                    <button 
                        className={`circle-button ${showCategories ? 'active' : ''}`}
                        onClick={() => setShowCategories(!showCategories)}
                    >
                        <img src="/категории.svg" alt="Категории" />
                    </button>
                    {showCategories && (
                        <div className="categories-dropdown">
                            <div className="categories-header">
                                <h3>Категории</h3>
                            </div>
                            <div className="categories-content">
                                {categories.map(category => (
                                    <div 
                                        key={category}
                                        className="category-item"
                                        onClick={() => handleCategoryClick(category)}
                                    >
                                        {category}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="profile-container">
                    {user ? (
                        <>
                            <button 
                                className="circle-button"
                                onClick={() => setShowAuthDropdown(!showAuthDropdown)}
                            >
                                <img src="/фейс-cropped.svg" alt="Профиль" />
                            </button>
                            {showAuthDropdown && (
                                <div className="auth-dropdown">
                                    <Link to="/profile" className="auth-btn">Профиль</Link>
                                    {user.is_moderator && (
                                        <Link to="/moderator" className="auth-btn">Модерация</Link>
                                    )}
                                    <button onClick={handleLogout} className="auth-btn">Выйти</button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div 
                            className="profile-container"
                            onMouseEnter={() => setShowAuthDropdown(true)}
                            onMouseLeave={() => setShowAuthDropdown(false)}
                        >
                            <button className="circle-button">
                                <img src="/фейс-cropped.svg" alt="Войти" />
                            </button>
                            {showAuthDropdown && (
                                <div className="auth-dropdown">
                                    <button 
                                        onClick={() => {
                                            setShowLoginModal(true);
                                            setShowAuthDropdown(false);
                                        }} 
                                        className="auth-btn login-btn"
                                    >
                                        Войти
                                    </button>
                                    <button 
                                        onClick={() => {
                                            setShowRegisterModal(true);
                                            setShowAuthDropdown(false);
                                        }} 
                                        className="auth-btn"
                                    >
                                        Регистрация
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showLoginModal && (
                <LoginModal
                    onClose={() => setShowLoginModal(false)}
                    onSwitch={() => {
                        setShowLoginModal(false);
                        setShowRegisterModal(true);
                    }}
                    onLoginSuccess={handleLoginSuccess}
                />
            )}

            {showRegisterModal && (
                <RegisterModal
                    onClose={() => setShowRegisterModal(false)}
                    onSwitch={() => {
                        setShowRegisterModal(false);
                        setShowLoginModal(true);
                    }}
                    onRegisterSuccess={handleRegisterSuccess}
                />
            )}
        </header>
    );
};

export default Header;

