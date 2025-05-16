import Header from "../components/Header";
import { useState } from "react";

export default function ModerateVacancyPage() {
  const [rejectionReason, setRejectionReason] = useState("");

  // Заглушка вакансии
  const vacancy = {
    title: "Разработка лендинга для портфолио",
    author: { username: "freelancer123" },
    created_at: "16.05.2025 14:35",
    salary: "15 000 ₽",
    description: "Нужен простой, но стильный лендинг с адаптивной версткой для размещения в портфолио.",
    rejection_reason: "",
  };

  const handleSubmit = (e, action) => {
    e.preventDefault();
    // Заглушка: заменить на запрос к API
    console.log("Действие:", action);
    console.log("Причина отклонения:", rejectionReason);
  };

  return (
    <>
      <Header />
      <div className="main-content">
        <div className="container">
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
