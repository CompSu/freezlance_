import Header from "../components/Header";
import { useState } from "react";
import { useParams } from "react-router-dom";
import "../assets/Moder.css";

export default function ModerateVacancyPage() {
  const { id } = useParams(); // получаем id из URL
  const [rejectionReason, setRejectionReason] = useState("");

  // Заглушка нескольких вакансий
  const fakeVacancies = {
    1: {
      title: "Редизайн лендинга",
      author: { username: "Светлана" },
      created_at: "14.05.2025 12:45",
      salary: "20 000 ₽",
      description: "Нужно обновить дизайн существующего лендинга. Требуется современный минимализм.",
    },
    2: {
      title: "Разработка Telegram-бота",
      author: { username: "Иван" },
      created_at: "15.05.2025 09:30",
      salary: "25 000 ₽",
      description: "Бот для уведомлений и автосообщений. Желательно с панелью админа.",
    }
  };

  const vacancy = fakeVacancies[id];

  const handleSubmit = (e, action) => {
    e.preventDefault();
    console.log("ID вакансии:", id);
    console.log("Действие:", action);
    console.log("Причина отклонения:", rejectionReason);
    // Здесь axios-запрос
  };

  if (!vacancy) {
    return (
      <>
        <Header />
        <div className="main-content">
          <div className="ModContainer">
            <h2 className="page-title">Вакансия не найдена</h2>
            <p>Проверьте правильность ссылки или вернитесь назад.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="main-content">
        <div className="ModContainer">
          <h2 className="page-title">Модерация вакансии</h2>

          <div className="vacancy-details">
            <h3 className="vacancy-title">{vacancy.title}</h3>
            <p className="vacancy-meta">Автор: <b>{vacancy.author.username}</b></p>
            <p className="vacancy-meta">Дата: <b>{vacancy.created_at}</b></p>
            {vacancy.salary && <p className="vacancy-meta">Зарплата: <b>{vacancy.salary}</b></p>}
            <div className="vacancy-description">
              {vacancy.description}
            </div>
          </div>

          <form className="moderation-form" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="rejection_reason">Причина отклонения (если отклоняете):</label>
              <textarea
                id="rejection_reason"
                name="rejection_reason"
                rows="3"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </div>

            <div className="moderation-actions">
              <button
                type="submit"
                className="button approve"
                onClick={(e) => handleSubmit(e, "approve")}
              >
                Одобрить
              </button>
              <button
                type="submit"
                className="button reject"
                onClick={(e) => handleSubmit(e, "reject")}
              >
                Отклонить
              </button>
              <button className="button back" onClick={() => window.history.back()}>
                Назад
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
