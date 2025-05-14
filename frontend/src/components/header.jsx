import { useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    console.log("Поиск запроса:", query);
    //API
  };

  return (
    <header>
      <div className="logo">
        <Link to="/" className="logo">
          <img src="/logo.png" alt="Логотип" />
          <span>FREEZLANCE</span>
        </Link>
      </div>

      <div className="buttons">
      <div className="search-wrapper">
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Найти услугу"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="search-button" onClick={handleSearch}>
            <img src="/поиск.svg" alt="Поиск" className="search-icon" />
          </button>
        </div>
      </div>
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
  );
}
