import React from "react";
import "../assets/styleProfile.css";
import { Link } from "react-router-dom";

function Profile() {
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
          <img src="/камера.svg" width="35" height="50" alt="фото профиля" />
          <button className="square_photo_buttons">Загрузить фотографию</button>
        </div>
        <div className="square_photo_content">
          <span>sontababy</span>
        </div>

        <div className="square_inform">
          <div className="square_inform_content">
            <span>Имя пользователя: Ульяна<br /></span>
            <span>Информация о навыках пользователя: Веб-дизайн, фотошоп<br /></span>
            <span>Город: Ханты-Мансийск<br /></span>
            <span>Почта: udikolenko@inbox.ru<br /></span>
          </div>
          <button className="square_inform_buttons">
            <img src="/material-symbols_settings.svg" width="15" height="15" alt="настройки" />
            <span>Настройки профиля</span>
          </button>
        </div>

        <div className="square_portfolio">
          <div className="square_portfolio_content">
            <span>Предыдущие проекты</span>
          </div>
          <button className="square_portfolio_buttons1">
            <img src="/стрелка.svg" alt="стрелка" />
          </button>
          <button className="square_portfolio_buttons2"></button>
          <button className="square_portfolio_buttons3">
            <span>Добавить новую задачу</span>
          </button>
        </div>

        <div className="square_reiting">
          <div className="div-horizontal-scroll">
            <span>Рейтинг и отзывы</span>
          </div>
          <button className="plus">Положительные</button>
          <button className="minus">Отрицательные</button>
        </div>
      </div>

    </>
  );
}

export default Profile;
