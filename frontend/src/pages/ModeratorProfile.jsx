import React, { useState, useEffect } from "react";
import Header from "../components/header";
import "../assets/Moder.css";
import { Link } from "react-router-dom";
import api from '../api/axios';

const ModeratorProfile = () => {
  const [vacancies, setVacancies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadVacancies();
  }, []);

  const loadVacancies = async () => {
    try {
      const response = await api.get('/moderator/vacancies');
      setVacancies(response.data.pending_vacancies);
    } catch (err) {
      setError(`Ошибка при загрузке вакансий: ${err.response?.data?.error || err.message}`);
      console.error('Detailed error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Загрузка...</div>;

  return (
    <>
      <Header />
      <div className="square">
        <div className="ModerRole">
          <h2>Панель модератора</h2>
          <p>Задачи на модерации:</p>
        </div>
        {error && <p className="error-message">{error}</p>}
        {vacancies.length > 0 ? (
          <div className="moderation-list">
            {vacancies.map((vacancy) => (
              <div key={vacancy.id} className="moderation-item">
                <h3>{vacancy.title}</h3>
                <p>Автор: {vacancy.author.username}</p>
                <p>Дата: {new Date(vacancy.created_at).toLocaleString()}</p>
                <div className="actions">
                  <Link to={`/moderation`} className="button">
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
