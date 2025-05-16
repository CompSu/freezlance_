import React from "react";
import { useNavigate } from "react-router-dom";
import "../assets/CategoryPage.css";

export default function TaskCard({ task }) {
  const navigate = useNavigate();

  const deadlineLabels = {
    upto24hours: "До 24 часов",
    upto3days: "До 3 дней",
    uptoaweek: "До недели",
  };

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} style={{ color: i <= rating ? "#FFD700" : "#ccc" }}>
          ★
        </span>
      );
    }
    return stars;
  };

  const handleClick = () => {
    navigate(`/vacancies/${task.id}`);
  };

  return (
    <div className="task-card" onClick={handleClick} style={{ cursor: "pointer" }}>
      {task.image_url ? (
        <img
          src={task.image_url}
          alt={task.title}
          className="task-card-image"
        />
      ) : (
        <div className="task-card-no-image">Нет изображения</div>
      )}
      <div className="task-card-content">
        <h3 className="task-card-title">{task.title}</h3>
        <p className="task-card-description">{task.description}</p>

        <div className="task-card-info">
          <div className="price">
            {task.salary ? `Цена: ${task.salary}` : 'Цена договорная'}
          </div>
          <div className="category">
            Категория: {task.subcategory?.name}
          </div>
          <div className="status">
            Статус: {task.status}
          </div>
        </div>

        <div className="task-card-user">
          <img
            src={task.author.avatar_url || '/default-avatar.jpg'}
            alt={task.author.username}
            className="user-avatar"
          />
          <span className="username">{task.author.username}</span>
          <div className="rating">
            {renderStars(task.author.rating_avg)}
            <span className="rating-count">({task.author.rating_count})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
