import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Header from "../components/Header";
import FilterPanel from "../components/FilterPanel"; 
import TaskCard from "../components/TaskCard";
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
  social: ["socialnetworksandmarketplaces"],
  development: ["webandmobiledevelopment"],
  media: [],   
  business: [], 
  texts: [],   
};

const allServices = [
  {
    id: 1,
    category: "logoandbraiding",
    title: "Уникальный логотип",
    description: "Разработка лого",
    price: 4000,
    reviews: 10,
    deadline: "upto3days",
    image: "powerpoint-corporate-template-0003-btc-_5%201.png",
    username: "sontababy",
    rating: 3,
    avatar: "9b29c60ed0a928d4cfdd268c0042b5ea4f7548c3%20(3).jpg",
  },
  {
    id: 2,
    category: "presentationsandinfographics",
    title: "Трендовая презентация",
    description: "Разработка презентации",
    price: 1000,
    reviews: 23,
    deadline: "upto24hours",
    image: "powerpoint-corporate-template-0003-btc-_5%201.png",
    username: "sontababy",
    rating: 5,
    avatar: "9b29c60ed0a928d4cfdd268c0042b5ea4f7548c3%20(3).jpg",
  },
];

const CategoryPage = () => {
  const { name } = useParams();
  const [filtered, setFiltered] = useState([]);

  useEffect(() => {
    const categoriesForPage = categoryMap[name] || [];
    const results = allServices.filter(item => categoriesForPage.includes(item.category));
    setFiltered(results);
  }, [name]);

  return (
    <>
      <Header />
      <div className="main-container">
        <aside className="filters">
          <FilterPanel
            items={filtered} 
            setFilteredItems={setFiltered}
            currentCategory={name}
          />
        </aside>

        <main className="content">
          <h1>Категория: {name}</h1>
          <div className="grid">
            {filtered.length ? (
              filtered.map((item) => (
                <TaskCard key={item.id} task={item} />
              ))
            ) : (
              <p>Ничего не найдено по заданным фильтрам</p>
            )}
          </div>
        </main>
      </div>
    </>
  );
};

export default CategoryPage;
