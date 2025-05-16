import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import "../assets/TaskDetails.css";

const fakeTasks = {
  1: {
    title: "Новый логотип. Уникальный логотип. Разработка лого.",
    images: [
      "/powerpoint-corporate-template-0003-btc-_5 1.png",
    ],
    username: "sontababy",
    rating: 3,
    deadline: "3 дня на выполнение",
    price: 5000,
    description: (
      <>
        <p>Описание: Разработаю дизайн логотипа, который разорвёт Ваших конкурентов!</p>
        <p>Хочешь привлечь внимание и создать запоминающийся образ бренда?
          Тогда тебе необходим уникальный логотип…</p>
        <h4>Гарантии:</h4>
        <ul className="guarantees-list">
          <li>Разработка логотипа до полного утверждения</li>
          <li>Бесплатные правки и корректировки</li>
          <li>Всегда на связи 24/7</li>
          <li>Только уникальный и креативный логотип</li>
          <li>100% результат, реально!</li>
        </ul>
        <h4>Что Вы получаете в итоге:</h4>
        <p>После утверждения логотипа вы получаете исходники в векторном и растровом формате…</p>
        <h4>Нужно для заказа:</h4>
        <ul className="requirements-list">
          <li>Название<em>(Какое текстовое содержание должно быть в логотипе)</em></li>
          <li>Слоган<em>(Подпись под логотипом)</em></li>
          <li>Основные услуги<em>(Что делает компания)</em></li>
          <li>Стилистика<em>(Строгий, шуточный и т.п.)</em></li>
          <li>Графические элементы<em>(Дом, животное и т.п.)</em></li>
          <li>Примеры логотипов<em>(Примеры, которые нравятся)</em></li>
          <li>Цветовая гамма</li>
        </ul>
        <div className="file-specs">
          <p><strong>Файлы:</strong> Доп. опции к логотипу.pdf</p>
          <p><strong>Вид:</strong> Новый логотип</p>
          <p><strong>Стиль:</strong> Плоский</p>
          <p><strong>Создание логотипа:</strong> С нуля</p>
        </div>
      </>
    ),
  },
};

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const task = fakeTasks[id];

  if (!task) {
    return (
      <>
        <Header />
        <div className="squareTask">
          <div className="headingErrorTask">
            <h2>Задача не найдена</h2>
            <button onClick={() => navigate(-1)}>Назад</button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="squareTask">
        <div className="square_text">
          <span>{task.title}</span>
        </div>

        <div className="portfolio">
          <div className="portfolio_photo">
            <img src={task.images[0]} alt="Пример работы" />
            <div className="portfolio_buttons">
              <button className="buttons">
                <img src="/стрелка.svg" alt="Назад" />
              </button>
              <button className="buttons">
                <img src="/стрелка.svg" alt="Вперёд" />
              </button>
            </div>
            <div className="portfolio_text"><span>Портфолио</span></div>
          </div>

          <div className="portfolio_user">
            <div className="user-main">
              <img src="/avatar.jpg" className="user-avatar" alt="Аватар" />
              <span className="username">{task.username}</span>
              <div className="user-rating">{task.rating}★</div>
            </div>
            <div className="portfolio_user_text">
              <span>{task.deadline}</span>
            </div>
            <div className="user_buttons">
              <button className="user_button">Заказать за {task.price}р</button>
            </div>
          </div>

          <div className="text_portfolio">
            <h3>О задаче:</h3>
            <div className="task-description">
              {task.description}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskDetails;
