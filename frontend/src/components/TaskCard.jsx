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
    navigate(`/task/${task.id}`); 
  };

  return (
    <div className="task-card" onClick={handleClick} style={{ cursor: "pointer" }}>
      <img
        src={`/images/${task.image}`}
        alt={task.title}
        className="task-card-image"
      />
      <div className="task-card-content">
        <h3 className="task-card-title">{task.title}</h3>
        <p className="task-card-description">{task.description}</p>

        <div className="task-card-info">
          <div className="price">Цена: {task.price} ₽</div>
          <div className="reviews">
            Отзывы: {task.reviews} {renderStars(task.rating)}
          </div>
          <div className="deadline">
            Срок: {deadlineLabels[task.deadline] || "Не указан"}
          </div>
        </div>

        <div className="task-card-user">
          <img
            src={`/avatars/${task.avatar}`}
            alt={task.username}
            className="user-avatar"
          />
          <span className="username">{task.username}</span>
        </div>
      </div>
    </div>
  );
}
