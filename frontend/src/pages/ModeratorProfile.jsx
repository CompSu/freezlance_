import React from "react";
import Header from "../components/Header";
import "../assets/styleProfile.css";
import { Link } from "react-router-dom";

const ModeratorProfile = () => {
  const tasksForModeration = [
    {
      id: 1,
      title: "Редизайн лендинга",
      author: "Светлана",
      createdAt: "2025-05-14 12:45",
    },
    {
      id: 2,
      title: "Разработка Telegram-бота",
      author: "Иван",
      createdAt: "2025-05-15 09:30",
    },
  ];

  return (
    <>
      <Header />
      <div className="square">
        <h2>Панель модератора</h2>
        <p>Задачи на модерации:</p>

        {tasksForModeration.length > 0 ? (
          <div className="moderation-list">
            {tasksForModeration.map((task) => (
              <div key={task.id} className="moderation-item">
                <h3>{task.title}</h3>
                <p>Автор: {task.author}</p>
                <p>Дата: {task.createdAt}</p>
                <div className="actions">
                  <Link to={`/moderation/${task.id}`} className="button">
                    Просмотреть
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>Нет задач на модерации.</p>
        )}
      </div>
    </>
  );
};

export default ModeratorProfile;
