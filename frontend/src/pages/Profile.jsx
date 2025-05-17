import React, { useState, useEffect, useRef } from 'react';
import { Alert, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import "../assets/styleProfile.css";
import { Link } from "react-router-dom";
import Header from "../components/header";

const Profile = () => {
    const [profile, setProfile] = useState({
        approved_vacancies: [],
        pending_vacancies: [],
        skills: [],
        portfolio_items: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone: '',
        about: '',
        birth_date: ''
    });
    const [newSkill, setNewSkill] = useState({
        name: '',
        level: 1,
        category: '',
        years_of_experience: 0
    });
    const navigate = useNavigate();
    const [reviews, setReviews] = useState({ positive: [], negative: [] });
    const [reviewType, setReviewType] = useState("positive");
    const [portfolioItems, setPortfolioItems] = useState([]);
    const [avatarFile, setAvatarFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        loadProfile();
    }, []);

    useEffect(() => {
        if (profile?.username) {
            loadReviews();
            loadPortfolio();
        }
    }, [profile?.username]);

    const loadProfile = async () => {
        try {
            const response = await api.get('/profile');
            if (response.data) {
                setProfile({
                    ...response.data,
                    approved_vacancies: response.data.approved_vacancies || [],
                    pending_vacancies: response.data.pending_vacancies || [],
                    skills: response.data.skills || [],
                    portfolio_items: response.data.portfolio_items || []
                });
                setFormData({
                    first_name: response.data.first_name || '',
                    last_name: response.data.last_name || '',
                    email: response.data.email || '',
                    phone: response.data.phone || '',
                    about: response.data.about || '',
                    birth_date: response.data.birth_date || ''
                });
            }
        } catch (err) {
            if (err.response?.status === 401) {
                navigate('/');
            } else {
                setError('Ошибка при загрузке профиля');
            }
        } finally {
            setLoading(false);
        }
    };

    const loadReviews = async () => {
        try {
            const response = await api.get(`/users/${profile.username}/reviews`);
            const allReviews = response.data.reviews;
            
            const positive = allReviews.filter(review => review.rating >= 4);
            const negative = allReviews.filter(review => review.rating < 4);
            
            setReviews({
                positive,
                negative
            });
        } catch (err) {
            setError('Ошибка при загрузке отзывов');
        }
    };

    const loadPortfolio = async () => {
        try {
            const response = await api.get('/profile/portfolio');
            setPortfolioItems(response.data.portfolio_items);
        } catch (err) {
            setError('Ошибка при загрузке портфолио');
        }
    };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSkillInputChange = (e) => {
        const { name, value } = e.target;
        setNewSkill(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post('/profile/skills', newSkill);
            setProfile(prev => ({
                ...prev,
                skills: [...prev.skills, response.data.skill]
            }));
            setNewSkill({ name: '', level: 1, category: '', years_of_experience: 0 });
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка при добавлении навыка');
        }
    };

    const handleSubmit = async () => {
        try {
            const response = await api.put('/profile', formData);
            setProfile(prev => ({
                ...prev,
                ...response.data.user
            }));
            setEditMode(false);
            setError('');
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка при обновлении профиля');
        }
    };

    const handleSkillDelete = async (skillId) => {
        try {
            await api.delete('/profile/skills', { data: { skill_id: skillId } });
            setProfile(prev => ({
                ...prev,
                skills: prev.skills.filter(skill => skill.id !== skillId)
            }));
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка при удалении навыка');
        }
    };

    const handlePortfolioAdd = async (itemData) => {
        try {
            const response = await api.post('/profile/portfolio', itemData);
            setProfile(prev => ({
                ...prev,
                portfolio_items: [...prev.portfolio_items, response.data.portfolio_item]
            }));
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка при добавлении работы в портфолио');
        }
    };

    const handlePortfolioDelete = async (itemId) => {
        try {
            await api.delete('/profile/portfolio', { data: { item_id: itemId } });
            setProfile(prev => ({
                ...prev,
                portfolio_items: prev.portfolio_items.filter(item => item.id !== itemId)
            }));
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка при удалении работы из портфолио');
        }
  };

  const currentReviews = reviews[reviewType];

  const getImageByCategory = (category) => {
    switch (category) {
      case "design":
        return "../images/арт-и-иллюстрации.jpg";
      case "code":
        return "../images/десктоп-и-программирование.png";
      case "branding":
        return "../images/логотипы-и-брендинг.png";
      default:
        return "../images/project-default.png";
    }
  };

  const handleOpenTask = (id) => {
    navigate(`/vacancies/${id}`);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await api.post('/profile/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            setProfile(prev => ({
                ...prev,
                avatar_url: response.data.avatar_url
            }));
            setAvatarFile(file);
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка при загрузке аватара');
        }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current.click();
  };

    if (loading) return <div>Загрузка...</div>;
    if (!profile) return <div>Профиль не найден</div>;

  const renderApplications = (applications) => {
    if (!applications || applications.length === 0) {
        return <p>Нет заявок</p>;
    }

    return applications.map(application => (
        <div key={application.id} className="application-card mb-3">
            <div className="card">
                <div className="card-body">
                    <h5 className="card-title">{application.vacancy.title}</h5>
                    <p className="card-text">{application.message}</p>
                    <p className="card-text">
                        <small className="text-muted">Статус: {application.status}</small>
                    </p>
                    {application.status === 'accepted' && !application.contact_info && (
                        <Link 
                            to={`/applications/${application.id}/accept`}
                            className="btn btn-primary"
                        >
                            Принять предложение
                        </Link>
                    )}
                    {application.contact_info && (
                        <div className="mt-2">
                            <strong>Контактная информация:</strong>
                            <p>{application.contact_info}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    ));
  };

  return (
    <>
      <Header />
            {error && <Alert variant="danger" className="error-alert">{error}</Alert>}

      <div className="square">
        <div className="square_photo" onClick={handleAvatarClick}>
          {profile.avatar_url ? (
            <img 
              src={`http://localhost:5000${profile.avatar_url}`} 
              alt="фото профиля" 
              className="profile-avatar"
            />
          ) : (
            <>
          <img src="/cam.svg" width="35" height="50" alt="фото профиля" />
          <button className="square_photo_buttons">Загрузить фотографию</button>
            </>
          )}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleAvatarChange}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>
        <div className="square_photo_content">
                    <span>{profile.username}</span>
        </div>

        <div className="square_inform">
          <div className="square_inform_content">
                        {/* Основная информация */}
                        <div className="basic-info">
            <span>
              Имя пользователя:{" "}
                                {editMode ? (
                <input
                  className="profile-input"
                  type="text"
                                        name="first_name"
                                        value={formData.first_name}
                  onChange={handleInputChange}
                />
              ) : (
                                    <span className="server-text">{profile.first_name}</span>
              )}
                            </span>
              <br />
            <span>
                                Email:{" "}
                                {editMode ? (
                <input
                  className="profile-input"
                                        type="email"
                                        name="email"
                                        value={formData.email}
                  onChange={handleInputChange}
                />
              ) : (
                                    <span className="server-text">{profile.email}</span>
              )}
                            </span>
              <br />
            <span>
                                Телефон:{" "}
                                {editMode ? (
                <input
                  className="profile-input"
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                  onChange={handleInputChange}
                />
              ) : (
                                    <span className="server-text">{profile.phone}</span>
              )}
                            </span>
              <br />
            <span>
                                О себе:{" "}
                                {editMode ? (
                                    <textarea
                  className="profile-input"
                                        name="about"
                                        value={formData.about}
                  onChange={handleInputChange}
                />
              ) : (
                                    <span className="server-text">{profile.about}</span>
              )}
            </span>
          </div>

                        {/* Навыки */}
                        <div className="skills-section">
                            <h3 className="section-title">Навыки</h3>
                            <div className="skills-list">
                                {profile.skills?.length > 0 ? (
                                    profile.skills.map(skill => (
                                        <div key={skill.id} className="skill-item">
                                            <div className="skill-info">
                                                <strong>{skill.name}</strong>
                                                <div className="skill-details">
                                                    <span>Уровень: {skill.level}/5</span>
                                                    {skill.category && <span>• Категория: {skill.category}</span>}
                                                    {skill.years_of_experience > 0 && 
                                                        <span>• Опыт: {skill.years_of_experience} {skill.years_of_experience === 1 ? 'год' : 
                                                            skill.years_of_experience < 5 ? 'года' : 'лет'}</span>
                                                    }
                                                </div>
                                            </div>
                                            {editMode && (
                                                <Button 
                                                    variant="danger" 
                                                    size="sm"
                                                    onClick={() => handleSkillDelete(skill.id)}
                                                >
                                                    ✕
                                                </Button>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <span className="server-text">Нет добавленных навыков</span>
                                )}
                                {editMode && (
                                    <Form onSubmit={handleAddSkill} className="add-skill-form">
                                        <Form.Group className="mb-2">
                                            <Form.Control
                                                type="text"
                                                name="name"
                                                value={newSkill.name}
                                                onChange={handleSkillInputChange}
                                                placeholder="Название навыка"
                                                className="profile-input"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-2">
                                            <Form.Label>Уровень владения (1-5)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="level"
                                                value={newSkill.level}
                                                onChange={handleSkillInputChange}
                                                min="1"
                                                max="5"
                                                className="profile-input"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-2">
                                            <Form.Control
                                                type="text"
                                                name="category"
                                                value={newSkill.category}
                                                onChange={handleSkillInputChange}
                                                placeholder="Категория навыка"
                                                className="profile-input"
                                            />
                                        </Form.Group>
                                        <Form.Group className="mb-2">
                                            <Form.Label>Опыт (в годах)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="years_of_experience"
                                                value={newSkill.years_of_experience}
                                                onChange={handleSkillInputChange}
                                                min="0"
                                                className="profile-input"
                                            />
                                        </Form.Group>
                                        <Button type="submit" variant="primary" size="sm">
                                            Добавить навык
                                        </Button>
                                    </Form>
                                )}
                            </div>
        </div>

                        {/* Вакансии */}
                        <div className="vacancies-section">
                            <h3 className="section-title">Мои работы и вакансии</h3>
                            <div className="portfolio-scroll-container">
                                {profile.approved_vacancies?.map((vacancy) => (
                                    <div
                                        className="project-card"
                                        key={vacancy.id}
                                        onClick={() => handleOpenTask(vacancy.id)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        <img
                                            src={getImageByCategory(vacancy.subcategory?.category?.name || 'default')}
                                            alt={vacancy.title}
                                            className="project-image"
                                        />
                                        <div className="project-title">{vacancy.title}</div>
                                    </div>
                                ))}
                            </div>
                            <Link to="/create-task">
                                <button className="square_portfolio_buttons3">
                                    <span>Добавить новую работу</span>
                                </button>
                            </Link>
                            
                            {profile.pending_vacancies?.length > 0 && (
                                <div className="pending-vacancies mt-3">
                                    <h6>На модерации</h6>
                                    {profile.pending_vacancies.map(vacancy => (
                                        <div key={vacancy.id} className="vacancy-item">
                                            {vacancy.title} (На модерации)
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Отзывы */}
                        <div className="reviews-section">
                            <h3 className="section-title">Отзывы</h3>
          <div className="rating-buttons">
            <button className="plus" onClick={() => setReviewType("positive")}>
              Положительные
            </button>
            <button className="minus" onClick={() => setReviewType("negative")}>
              Отрицательные
            </button>
          </div>
          <div className="review-list">
            {currentReviews.map((review) => (
              <div key={review.id} className="review-card">
                <img src={review.userAvatar} alt="аватар" className="review-avatar" />
                <div className="review-content">
                  <Link to={`/user/${review.userId}`} className="review-user-name">
                    {review.userName}
                  </Link>
                  <p className="review-text">{review.text}</p>
                </div>
              </div>
            ))}
                            </div>
          </div>

                        <button
                            className="square_inform_buttons"
                            onClick={() => (editMode ? handleSubmit() : setEditMode(true))}
                        >
                            <span>{editMode ? "Сохранить" : "Настройки профиля"}</span>
                        </button>
                    </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
