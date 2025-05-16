import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/header";
import "../assets/TaskDetails.css";
import api from '../api/axios';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTask();
  }, [id]);

  const loadTask = async () => {
    try {
      const response = await api.get(`/vacancies/${id}`);
      setTask(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при загрузке задачи');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    try {
      const response = await api.post(`/vacancies/${id}/applications`, {
        message: "Я хотел бы взяться за выполнение этой задачи"
      });
      navigate(`/profile`); // или куда вы хотите перенаправить после отклика
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при отклике на задачу');
    }
  };

  if (loading) return (
    <>
      <Header />
      <div className="squareTask">
        <div className="headingErrorTask">
          <h2>Загрузка...</h2>
        </div>
      </div>
    </>
  );

  if (error || !task) {
    return (
      <>
        <Header />
        <div className="squareTask">
          <div className="headingErrorTask">
            <h2>{error || 'Задача не найдена'}</h2>
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
            {task.image_url ? (
              <img src={task.image_url} alt="Изображение задачи" />
            ) : (
              <div className="no-image">Изображение отсутствует</div>
            )}
          </div>

          <div className="portfolio_user">
            <div className="user-main">
              <img src="/avatar.jpg" className="user-avatar" alt="Аватар" />
              <span className="username">{task.author.username}</span>
              <div className="user-rating">{task.author.rating_avg}★</div>
            </div>
            <div className="portfolio_user_text">
              <span>Статус: {task.status}</span>
            </div>
            <div className="user_buttons">
              {task.can_send_message && (
                <button 
                  className="user_button"
                  onClick={handleApply}
                >
                  Откликнуться на задачу {task.salary && `за ${task.salary}`}
                </button>
              )}
            </div>
          </div>

          <div className="text_portfolio">
            <h3>О задаче:</h3>
            <div className="task-description">
              {task.description}
            </div>
            {task.subcategory && (
              <div className="task-category">
                <strong>Категория:</strong> {task.subcategory.name}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TaskDetails;
