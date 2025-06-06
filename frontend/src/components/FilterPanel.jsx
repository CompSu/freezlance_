import { useState, useEffect } from "react";
import "../assets/CategoryPage.css";
import api from '../api/axios';

const categoryMap = {
  "Дизайн": [
    "Логотипы",
    "Графика",
    "UI/UX",
    "3D-моделирование",
    "Обработка и редактирование",
    "Реклама",
    "Полиграфия"
  ],
  "Разработка": [
    "Веб-разработка",
    "Мобильные приложения",
    "Игры",
    "Базы данных",
    "Скрипты и боты",
    "Тестирование"
  ],
  "Маркетинг": [
    "SEO",
    "SMM",
    "Контекстная реклама",
    "Аналитика"
  ],
  "Тексты": [
    "Копирайтинг",
    "Рерайтинг",
    "Переводы",
    "Редактирование",
    "Контент",
    "Бизнес-тексты",
    "Набор текста",
    "Резюме"
  ],
  "Бизнес": [
    "Бухгалтерия",
    "Обзвоны",
    "Юридические услуги",
    "Продажа сайтов",
    "HR",
    "Презентации",
    "Строительство"
  ],
  "Медиа": [
    "Аудио",
    "Музыка",
    "Аудиомонтаж",
    "Видео",
    "Анимация"
  ]
};

export default function FilterPanel({ items, setFilteredItems, currentCategory }) {
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [reviews, setReviews] = useState("0");
  const [deadline, setDeadline] = useState("any");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleApplyFilters = () => {
    const min = parseInt(minPrice) || 400;
    const max = parseInt(maxPrice) || 200000;
    const reviewCount = parseInt(reviews) || 0;

    const deadlineMap = {
      any: Infinity,
      upto24hours: 1,
      upto3days: 3,
      uptoaweek: 7,
    };

    const validSubcategories = categoryMap[currentCategory] || [];

    const filtered = items.filter(item => {
      const itemSubcategory = item.subcategory?.name;
      const itemPrice = parseInt(item.salary) || 0;
      const itemReviews = item.author?.rating_count || 0;
      const itemDeadline = deadlineMap[item.deadline] || parseInt(item.deadline);

      const categoryMatch =
        category === "all"
          ? validSubcategories.includes(itemSubcategory)
          : itemSubcategory === category;

      const priceMatch = (!min || itemPrice >= min) && (!max || itemPrice <= max);
      const reviewsMatch = itemReviews >= reviewCount;

      return categoryMatch && priceMatch && reviewsMatch && deadlineMap[deadline] >= itemDeadline;
    });

    setFilteredItems(filtered);
  };

  useEffect(() => {
    handleApplyFilters();
  }, [minPrice, maxPrice, reviews, deadline]);

  const subcategoriesOptions = currentCategory
    ? categoryMap[currentCategory] || []
    : [];

  return (
    <div className="filters">
      <h2>Фильтр</h2>

      <div className="filter-group">
        <h3>Подкатегория</h3>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Все подкатегории</option>
          {subcategoriesOptions.map((subcat) => (
            <option key={subcat} value={subcat}>
              {subcat}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <h3>Цена</h3>
        <div className="price-range">
          <div className="price-input">
            <span className="price-label">От</span>
            <input
              type="number"
              className="price-field"
              placeholder="400"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="400"
              step="100"
            />
          </div>
          <div className="price-input">
            <span className="price-label">До</span>
            <input
              type="number"
              className="price-field"
              placeholder="200000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="400"
              step="100"
            />
          </div>
        </div>
      </div>

      <div className="filter-group">
        <h3>Количество отзывов</h3>
        <select value={reviews} onChange={(e) => setReviews(e.target.value)}>
          <option value="0">Все</option>
          <option value="1">от 1</option>
          <option value="5">от 5</option>
          <option value="10">от 10</option>
          <option value="20">от 20</option>
        </select>
      </div>

      <div className="filter-group">
        <h3>Срок выполнения</h3>
        <select value={deadline} onChange={(e) => setDeadline(e.target.value)}>
          <option value="any">Любой</option>
          <option value="upto24hours">До 24 часов</option>
          <option value="upto3days">До 3 дней</option>
          <option value="uptoaweek">До недели</option>
        </select>
      </div>

      <div className="button_apply">
        <button className="apply" onClick={handleApplyFilters}>Применить</button>
      </div>
      <div className="content_apply">
        <span>Если вы не нашли нужную задачу, вы можете создать собственную в профиле</span>
      </div>

      {error && <div className="error-message">{error}</div>}
    </div>
  );
}
