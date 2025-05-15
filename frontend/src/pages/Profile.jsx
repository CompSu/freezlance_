import React, { useState } from "react";
import "../assets/styleProfile.css";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";

function Profile() {
  const [user, setUser] = useState({
    username: 'sontababy',
    name: 'Ульяна',
    skills: 'Веб-дизайн, фотошоп',
    city: 'Ханты-Мансийск',
    email: 'udikolenko@inbox.ru',
  });

  const [editedUser, setEditedUser] = useState(user);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedUser((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setUser(editedUser); // Пока локально
    setIsEditing(false);
  };

  const [projects, setProjects] = useState([
    { id: 1, title: "Лендинг для бренда", category: "design" },
    { id: 2, title: "Telegram-бот", category: "code" },
    { id: 3, title: "Редизайн логотипа", category: "branding" },
    { id: 4, title: "Лендинг для бренда", category: "design" },
    { id: 5, title: "Telegram-бот", category: "code" },
    { id: 6, title: "Редизайн логотипа", category: "branding" },
    { id: 1, title: "Лендинг для бренда", category: "design" },
    { id: 2, title: "Telegram-бот", category: "code" },
    { id: 3, title: "Редизайн логотипа", category: "branding" },
    { id: 4, title: "Лендинг для бренда", category: "design" },
    { id: 5, title: "Telegram-бот", category: "code" },
    { id: 6, title: "Редизайн логотипа", category: "branding" }
  ]);

  const [reviewType, setReviewType] = useState("positive");

  const reviews = {
    positive: [
      {
        id: 1,
        userId: 101,
        userName: "Артём",
        userAvatar: "/фейс-cropped.svg",
        text: "Отличная работа! Всё сделано в срок и очень качественно"
      },
      {
        id: 2,
        userId: 102,
        userName: "Мария",
        userAvatar: "/фейс-cropped.svg",
        text: "Приятно работать с профессионалом. Рекомендую!"
      }
    ],
    negative: [
      {
        id: 3,
        userId: 103,
        userName: "Сергей",
        userAvatar:"/фейс-cropped.svg",
        text: "Проект задержался и не все правки были учтены."
      }
    ]
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

  const navigate = useNavigate();

  const handleOpenTask = (id) => {
    navigate(`/task/${id}`);
  };

  return (
    <>
      <Header />

      <div className="square">
        <div className="square_photo">
          <img src="/cam.svg" width="35" height="50" alt="фото профиля" />
          <button className="square_photo_buttons">Загрузить фотографию</button>
        </div>
        <div className="square_photo_content">
          <span>{user.username}</span>
        </div>

        <div className="square_inform">
          <div className="square_inform_content">
            <span>
              Имя пользователя:{" "}
              {isEditing ? (
                <input
                  className="profile-input"
                  type="text"
                  name="name"
                  value={editedUser.name}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="server-text">{user.name}</span>
              )}
              <br />
            </span>
            <span>
              Информация о навыках пользователя:{" "}
              {isEditing ? (
                <input
                  className="profile-input"
                  type="text"
                  name="skills"
                  value={editedUser.skills}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="server-text">{user.skills}</span>
              )}
              <br />
            </span>
            <span>
              Город:{" "}
              {isEditing ? (
                <input
                  className="profile-input"
                  type="text"
                  name="city"
                  value={editedUser.city}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="server-text">{user.city}</span>
              )}
              <br />
            </span>
            <span>
              Почта:{" "}
              {isEditing ? (
                <input
                  className="profile-input"
                  type="email"
                  name="email"
                  value={editedUser.email}
                  onChange={handleInputChange}
                />
              ) : (
                <span className="server-text">{user.email}</span>
              )}
              <br />
            </span>
          </div>
          <button
            className="square_inform_buttons"
            onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          >
            <span>{isEditing ? "Сохранить" : "Настройки профиля"}</span>
          </button>
        </div>

        <div className="square_portfolio">
          <div className="square_portfolio_content">
            <span>Предыдущие проекты</span>
          </div>

          <button
            className="square_portfolio_buttons1"
            onClick={() =>
              document.getElementById("portfolioScroll").scrollBy({ left: -500, behavior: 'smooth' })
            }
          >
            <img src="/стрелка.svg" alt="стрелка влево" />
          </button>

          <div className="portfolio-scroll-container" id="portfolioScroll">
            {projects.map((project) => (
              <div
                className="project-card"
                key={project.id}
                onClick={() => handleOpenTask(project.id)}
                style={{ cursor: "pointer" }}
              >
                <img
                  src={getImageByCategory(project.category)}
                  alt={project.title}
                  className="project-image"
                />
                <div className="project-title">{project.title}</div>
              </div>
            ))}
          </div>


          <button
            className="square_portfolio_buttons2"
            onClick={() =>
              document.getElementById("portfolioScroll").scrollBy({ left: 500, behavior: 'smooth' })
            }
          >
            <img src="/стрелка.svg" alt="стрелка вправо" style={{ transform: "rotate(180deg)" }}/>
          </button>

          <Link to="/create-task">
            <button className="square_portfolio_buttons3">
              <span>Добавить новую задачу</span>
            </button>
          </Link>
        </div>

        <div className="square_reiting">
          <div className="div-horizontal-scroll">
            <span>Рейтинг и отзывы</span>
          </div>

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

          <button className="square_review_buttons">Добавить отзыв</button>
        </div>
      </div>
    </>
  );
}

export default Profile;
