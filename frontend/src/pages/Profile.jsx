import React, { useState, useEffect } from "react";
import "../assets/styleProfile.css";
import { Link } from "react-router-dom";

function Profile() {
  const [user, setUser] = useState({
    username: 'sontababy',
    name: 'Ульяна',
    skills: 'Веб-дизайн, фотошоп',
    city: 'Ханты-Мансийск',
    email: 'udikolenko@inbox.ru',
  });

  const [projects, setProjects] = useState([
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
        userAvatar: "",
        text: "Отличная работа! Всё сделано в срок и очень качественно"
      },
      {
        id: 2,
        userId: 102,
        userName: "Мария",
        userAvatar: "",
        text: "Приятно работать с профессионалом. Рекомендую!"
      }
    ],
    negative: [
      {
        id: 3,
        userId: 103,
        userName: "Сергей",
        userAvatar:"",
        text: "Проект задержался и не все правки были учтены."
      }
    ]
  };

  const currentReviews = reviews[reviewType];

  const getImageByCategory = (category) => {
    switch (category) {
      case "design":
        return "/images/project-design.png";
      case "code":
        return "/images/project-code.png";
      case "branding":
        return "/images/project-branding.png";
      default:
        return "/images/project-default.png";
    }
  };

  return (
    <>
      <header>
        <Link to="/" className="logo">
          <img src="/logo.png" alt="Логотип" />
          <span>FREEZLANCE</span>
        </Link>
        <div className="buttons">
          <button className="circle-button">
            <img src="/поиск.svg" width="30" height="40" alt="поиск" />
          </button>
          <button className="circle-button">
            <img src="/уведомления.svg" width="30" height="40" alt="уведомления" />
          </button>
          <button className="circle-button">
            <img src="/категории.svg" width="30" height="45" alt="категории" />
          </button>
          <Link to="/profile">
            <button className="circle-button">
              <img src="/фейс-cropped.svg" width="35" height="50" alt="профиль" />
            </button>
          </Link>
        </div>
      </header>

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
            <span>Имя пользователя: <span className="server-text">{user.name}</span><br /></span>
            <span>Информация о навыках пользователя: <span className="server-text">{user.skills}</span><br /></span>
            <span>Город: <span className="server-text">{user.city}</span><br /></span>
            <span>Почта: <span className="server-text">{user.email}</span><br /></span>
          </div>
          <button className="square_inform_buttons">
            <span>Настройки профиля</span>
          </button>
        </div>

        <div className="square_portfolio">
          <div className="square_portfolio_content">
            <span>Предыдущие проекты</span>
          </div>

          <button
            className="square_portfolio_buttons1"
            onClick={() =>
              document.getElementById("portfolioScroll").scrollBy({ left: -300, behavior: 'smooth' })
            }
          >
            <img src="" alt="стрелка влево" style={{ transform: "rotate(180deg)" }} />
          </button>

          <div className="portfolio-scroll-container" id="portfolioScroll">
            {projects.map((project) => (
              <div className="project-card" key={project.id}>
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
              document.getElementById("portfolioScroll").scrollBy({ left: 300, behavior: 'smooth' })
            }
          >
            <img src="" alt="стрелка вправо" />
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

