import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/header';
import api from '../api/axios';
import '../assets/UserProfile.css';

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    text: ''
  });

  const handleOpenTask = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  useEffect(() => {
    loadUserProfile();
  }, [username]);

  const loadUserProfile = async () => {
    try {
      const [userResponse, reviewsResponse] = await Promise.all([
        api.get(`/users/${username}`),
        api.get(`/users/${username}/reviews`)
      ]);
      console.log('User data:', userResponse.data);
      setUser(userResponse.data);
      setReviews(reviewsResponse.data.reviews);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err.response?.data?.error || 'Ошибка при загрузке профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/users/${username}/reviews`, reviewForm);
      await api.post(`/notifications`, {
        user_id: user.id,
        message: `Пользователь оставил вам новый отзыв с оценкой ${reviewForm.rating}★`,
        link: `/users/${username}`
      });
      const response = await api.get(`/users/${username}/reviews`);
      setReviews(response.data.reviews);
      setReviewForm({ rating: 5, text: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при отправке отзыва');
    }
  };

  const getImageByCategory = (category) => {
    if (!category) return "../images/project-default.png";
    
    switch (category.toLowerCase()) {
      case "дизайн":
        return "../images/арт-и-иллюстрации.jpg";
      case "разработка":
        return "../images/десктоп-и-программирование.png";
      case "маркетинг":
        return "../images/логотипы-и-брендинг.png";
      default:
        return "../images/project-default.png";
    }
  };

  if (loading) return (
    <>
      <Header />
      <div className="profile-container">
        <h2>Загрузка...</h2>
      </div>
    </>
  );

  if (error || !user) return (
    <>
      <Header />
      <div className="profile-container">
        <h2>{error || 'Пользователь не найден'}</h2>
      </div>
    </>
  );

  return (
    <>
      <Header />
      <div className="square">
        <div className="square_photo">
          <img 
            src={user.avatar_url ? `http://localhost:5000${user.avatar_url}` : "/avatar.jpg"} 
            alt="фото профиля" 
            className="profile-avatar"
          />
        </div>
        <div className="square_photo_content">
          <span>{user.username}</span>
        </div>

        <div className="square_inform">
          <div className="square_inform_content">
            {/* Основная информация */}
            <div className="basic-info">
              <span>
                Имя пользователя: <span className="server-text">{user.first_name}</span>
              </span>
              <br />
              <span>
                Email: <span className="server-text">{user.email}</span>
              </span>
              <br />
              <span>
                Телефон: <span className="server-text">{user.phone}</span>
              </span>
              <br />
              <span>
                О себе: <span className="server-text">{user.about}</span>
              </span>
            </div>

            {/* Навыки */}
            <div className="skills-section">
              <h3 className="section-title">Навыки</h3>
              <div className="skills-list">
                {user.skills?.length > 0 ? (
                  user.skills.map(skill => (
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
                    </div>
                  ))
                ) : (
                  <span className="server-text">Нет добавленных навыков</span>
                )}
              </div>
            </div>

            <div className="vacancies-section">
              <h3 className="section-title">Мои работы и вакансии</h3>
              <div className="portfolio-scroll-container">
                {user.approved_vacancies?.map((vacancy) => (
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
            </div>

            {/* Отзывы */}
            {!user.is_owner && (
              <div className="review-form-container">
                <h3>Оставить отзыв</h3>
                <form onSubmit={handleReviewSubmit} className="review-form">
                  <div className="rating-select">
                    <label>Оценка:</label>
                    <select
                      value={reviewForm.rating}
                      onChange={(e) => setReviewForm({ ...reviewForm, rating: parseInt(e.target.value) })}
                    >
                      {[5, 4, 3, 2, 1].map(num => (
                        <option key={num} value={num}>{num}★</option>
                      ))}
                    </select>
                  </div>
                  <div className="review-text">
                    <label>Ваш отзыв:</label>
                    <textarea
                      value={reviewForm.text}
                      onChange={(e) => setReviewForm({ ...reviewForm, text: e.target.value })}
                      placeholder="Напишите ваш отзыв..."
                      required
                    />
                  </div>
                  <button type="submit">Отправить отзыв</button>
                </form>
              </div>
            )}

            <div className="reviews-section">
              <h3>Отзывы</h3>
              {reviews.length === 0 ? (
                <p>Пока нет отзывов</p>
              ) : (
                <div className="reviews-list">
                  {reviews.map(review => (
                    <div key={review.id} className="review-item">
                      <div className="review-header">
                        <Link to={`/users/${review.reviewer.username}`} className="reviewer-name-link">
                          {review.reviewer.username}
                        </Link>
                        <span className="review-rating">{review.rating}★</span>
                        <span className="review-date">
                          {new Date(review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="review-text">{review.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile; 