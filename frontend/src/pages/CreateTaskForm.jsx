import "../assets/TaskStyle.css";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import api from '../api/axios';

export default function CreateTaskPage() {
  const [mainCategory, setMainCategory] = useState("");
  const [subCategories, setSubCategories] = useState([]);
  const [subCategory, setSubCategory] = useState("");
  const [minBudget, setMinBudget] = useState(400);
  const [maxBudget, setMaxBudget] = useState(200000);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    salary: '',
    subcategory_id: ''
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await api.get('/vacancies');
      setCategories(response.data.categories);
    } catch (err) {
      setError('Ошибка при загрузке категорий');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const submissionData = {
        ...formData,
        salary: `${minBudget} - ${maxBudget} ₽`,
        subcategory_id: subCategory
      };

      const response = await api.post('/vacancies', submissionData);
      navigate(`/vacancies/${response.data.vacancy.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при создании вакансии');
    }
  };

  const handleMainCategoryChange = (e) => {
    const value = e.target.value;
    setMainCategory(value);
    const category = categories.find(cat => cat.name === value);
    if (category) {
      setSubCategories(category.subcategories);
    } else {
      setSubCategories([]);
    }
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

  if (loading) return <div>Загрузка...</div>;

  return (
    <div className="create-task-page">
      <Header />

      <div className="rectangle">
        <div className="rectangle_text">
          <span>Создание задачи</span>
        </div>
        <form className="creation-form" onSubmit={handleSubmit}>
          <section className="form-section">
            <h2>Основное</h2>
            <textarea 
              className="form-input" 
              rows="5" 
              placeholder="Название задачи" 
              name="title" 
              value={formData.title} 
              onChange={handleInputChange}
              required 
            />
          </section>

          <section className="form-section">
            <h2>Рубрика</h2>
            <div className="category-group">
              <select 
                id="main-category" 
                value={mainCategory} 
                onChange={handleMainCategoryChange}
                required
              >
                <option value="">Основная категория</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                id="sub-category"
                value={subCategory}
                onChange={(e) => setSubCategory(e.target.value)}
                disabled={!mainCategory}
                required
              >
                <option value="">Подкатегория</option>
                {subCategories.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <section className="form-section">
            <h2>Описание</h2>
            <textarea 
              className="form-input" 
              rows="5" 
              placeholder="Подробное описание задачи" 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange}
              required
            />
          </section>

          <section className="form-section">
            <h2>Бюджет</h2>
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

          {error && <div className="error-message">{error}</div>}

          <button className="submit" type="submit">
            Опубликовать задачу
          </button>
        </form>
      </div>
    </div>
  );
}
