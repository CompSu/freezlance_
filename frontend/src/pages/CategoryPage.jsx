import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/header";
import FilterPanel from "../components/FilterPanel"; 
import TaskCard from "../components/TaskCard";
import "../assets/CategoryPage.css";
import api from '../api/axios';

const CategoryPage = () => {
  const { name } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [vacancies, setVacancies] = useState([]);
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    loadVacancies();
  }, [name]);

  const loadVacancies = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/categories/${encodeURIComponent(name)}/vacancies`);
      setVacancies(response.data.vacancies);
      setFiltered(response.data.vacancies);
    } catch (err) {
      console.error('Ошибка при загрузке вакансий:', err);
      setError('Не удалось загрузить вакансии для данной категории');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="main-container">
        <aside className="filters">
          <FilterPanel
            items={vacancies} 
            setFilteredItems={setFiltered}
            currentCategory={name}
          />
        </aside>

        <main className="content">
          <h1>Категория: {name}</h1>
          {loading ? (
            <div className="loading">
              <h2>Загрузка...</h2>
            </div>
          ) : error ? (
            <div className="error">
              <h2>{error}</h2>
            </div>
          ) : (
            <div className="grid">
              {filtered.length > 0 ? (
                filtered.map((vacancy) => (
                  <TaskCard key={vacancy.id} task={vacancy} />
                ))
              ) : (
                <div className="no-results">
                  <p>В данной категории пока нет активных вакансий</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </>
  );
};

export default CategoryPage;
