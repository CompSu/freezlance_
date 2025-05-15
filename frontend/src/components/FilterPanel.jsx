import { useState } from "react";
import "../assets/CategoryPage.css";

const categoryMap = {
  design: [
    "logoandbraiding",
    "presentationsandinfographics",
    "artandillustrations",
    "interiorandexterior",
    "processingandediting",
    "advertisement",
    "polygraphy",
  ],
  development: [
    "webandmobiledevelopment",
    "desktop",
    "scripts",
    "gamedev",
    "servers",
    "test"
  ],
  social: [
    "smm",
    "clients_db",
    "email",
    "marketplaces",
    "marketing"
  ],
  business: [
    "accounting",
    "calls",
    "legal",
    "sites_sale",
    "hr",
    "presentation",
    "construction"
  ],
  media: [
    "audio",
    "music",
    "audio_edit",
    "video",
    "animation"
  ],    
  texts: [
    "content",
    "translation",
    "business_text",
    "typing",
    "cv"
  ],   
};

export default function FilterPanel({ items, setFilteredItems, currentCategory }) {
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [reviews, setReviews] = useState("0");
  const [deadline, setDeadline] = useState("any");

  const handleApplyFilters = () => {
    const min = parseInt(minPrice) || 0;
    const max = parseInt(maxPrice) || Infinity;
    const reviewCount = parseInt(reviews) || 0;

    const deadlineMap = {
      any: Infinity,
      upto24hours: 1,
      upto3days: 3,
      uptoaweek: 7,
    };

    const validSubcategories = categoryMap[currentCategory] || [];

    const filtered = items.filter(item => {
      const itemCategory = item.category;
      const itemPrice = parseInt(item.price);
      const itemReviews = parseInt(item.reviews);
      const itemDeadline = deadlineMap[item.deadline] || parseInt(item.deadline);

      const categoryMatch =
        category === "all"
          ? validSubcategories.includes(itemCategory)
          : itemCategory === category;

      return (
        categoryMatch &&
        itemPrice >= min &&
        itemPrice <= max &&
        itemReviews >= reviewCount &&
        deadlineMap[deadline] >= itemDeadline
      );
    });

    setFilteredItems(filtered);
  };

  const subcategoriesOptions = currentCategory
    ? categoryMap[currentCategory] || []
    : [];

  const subcategoryLabels = {
    logoandbraiding: "Логотипы и брендинг",
    presentationsandinfographics: "Презентации и инфографика",
    artandillustrations: "Арт и иллюстрация",
    webandmobiledevelopment: "Веб и моб. разработка",
    smm: "Соцсети и SMM",
    interiorandexterior: "Интерьер и экстерьер",
    processingandediting: "Обработка и редактирование",
    advertisement: "Реклама",
    polygraphy: "Полиграфия",
    webdev: "Веб разработка",
    desktop: "Декстоп и программирование",
    scripts: "Скрипты и боты",
    gamedev: "Игры",
    servers: "Сервера и хостинг",
    test: "Тест и помощь",
    clients_db: "База данных клиентов",
    email: "E-mail рассылки",
    marketplaces: "Маркетплейсы и доски объявлений",
    marketing: "Маркетинг и PR",
    accounting: "Бухгалтерия",
    calls: "Обзвоны",
    legal: "Юридическая помощь",
    sites_sale: "Продажа сайтов",
    hr: "Подбор персонала",
    presentation: "Презентация",
    construction: "Стройка",
    audio: "Аудиозапись",
    music: "Музыка",
    audio_edit: "Редактирование аудио",
    animation: "Анимация",
    video: "Видеоролики",
    content: "Тексты для сайта",
    translation: "Переводы",
    business_text: "Бизнес тексты",
    typing: "Набор текста",
    cv: "Резюме"
  };

  return (
    <div className="filters">
      <h2>Фильтр</h2>

      <div className="filter-group">
        <h3>Подкатегория</h3>
        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="all">Все подкатегории</option>
          {subcategoriesOptions.map((subcat) => (
            <option key={subcat} value={subcat}>
              {subcategoryLabels[subcat] || subcat}
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
    </div>
  );
}
