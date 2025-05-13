import "../assets/TaskStyle.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";


export default function CreateTaskPage() {
  const [mainCategory, setMainCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [subCategory, setSubCategory] = useState("");


  const navigate = useNavigate();
const handleSubmit = async (e) => {
  e.preventDefault();

  const taskData = {
    title,
    description,
    category,
    subcategory,
    requirements,
    date,
    minBudget,
    maxBudget,
    //файл и т.д.
  };

  try {
    const response = await fetch("", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      throw new Error("Ошибка при создании задачи");
    }

    navigate("/profile");
  } catch (error) {
    console.error("Ошибка при отправке задачи:", error);
    alert("Не удалось создать задачу.");
  }
};


  
  const [minBudget, setMinBudget] = useState(400);
  const [maxBudget, setMaxBudget] = useState(1000);

  const categoryMap = {
    design: ["Логотипы", "Арт", "Иллюстрации"],
    copywriting: ["Статьи", "Реклама", "Слоганы"],
    social: ["Посты", "Сториз", "Реклама"],
  };

  const handleMainCategoryChange = (e) => {
    const value = e.target.value;
    setMainCategory(value);
    setSubCategories(categoryMap[value] || []);
    setSubCategory("");
  };

  const handleMinBudgetChange = (value) => {
    const val = Math.min(Math.max(value, 400), maxBudget);
    setMinBudget(val);
  };

  const handleMaxBudgetChange = (value) => {
    const val = Math.max(Math.min(value, 200000), minBudget);
    setMaxBudget(val);
  };

  return (
    <div className="create-task-page">
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

      <div className="rectangle">
        <div className="rectangle_text">
          <span>Создание задачи</span>
        </div>
        <form className="creation-form">
          <section className="form-section">
            <h2>
             Основное
            </h2>
            <textarea className="form-input" rows="5" placeholder="Название задачи" />
          </section>

          <section className="form-section">
            <h2>Рубрика</h2>
            <div className="category-group">
              <select id="main-category" value={mainCategory} onChange={handleMainCategoryChange}>
                <option value="">Основная категория</option>
                <option value="design">Дизайн</option>
                <option value="copywriting">Копирайтинг</option>
                <option value="social">СоцСети</option>
              </select>

              <select
                id="sub-category"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                disabled={!mainCategory}
              >
                <option value="">Подкатегория</option>
                {subCategories.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="form-section">
            <h2>
              Описание
            </h2>
            <textarea className="form-input" rows="5" placeholder="Подробное описание задачи" />
            <label className="file-upload-label">
              Прикрепить файл
              <input type="file" hidden />
            </label>
          </section>

          <section className="form-section">
            <h2>
              Бюджет
            </h2>
            <div className="range-container">
              <label>Минимальный бюджет</label>
              <input
                type="range"
                min="400"
                max="200000"
                value={minBudget}
                onChange={(e) => handleMinBudgetChange(+e.target.value)}
              />
              <input
                type="number"
                min="400"
                max={maxBudget}
                value={minBudget}
                onChange={(e) => handleMinBudgetChange(+e.target.value)}
              />

              <label>Максимальный бюджет</label>
              <input
                type="range"
                min="400"
                max="200000"
                value={maxBudget}
                onChange={(e) => handleMaxBudgetChange(+e.target.value)}
              />
              <input
                type="number"
                min={minBudget}
                max="200000"
                value={maxBudget}
                onChange={(e) => handleMaxBudgetChange(+e.target.value)}
              />

              <div className="total-price">
                от {minBudget} ₽ до {maxBudget} ₽
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>
              Срок
            </h2>
            <input type="date" className="form-input" />
          </section>

          <section className="form-section">
            <h2>
              Требования
            </h2>
            <textarea className="form-input" rows="4" placeholder="Требования к исполнителю" />
          </section>

          <button className="submit" onClick={handleSubmit}>
            Опубликовать задачу
          </button>

        </form>
      </div>
    </div>
  );
}
