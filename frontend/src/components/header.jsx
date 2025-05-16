import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import RegisterModal from './RegisterModal';
import LoginModal from './LoginModal';

export default function Header() {
  const [query, setQuery] = useState("");
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);

  const categoriesButtonRef = useRef(null);
  const notificationsButtonRef = useRef(null);

  const isAuthenticated = true; // для бэка
  const userRole = "moderator"; // или "user"


  const handleSearch = () => {
    console.log("Поиск запроса:", query);
  };

  const toggleCategories = (e) => {
    e.stopPropagation();
    setIsCategoriesOpen((prev) => !prev);
  };

  const toggleNotifications = (e) => {
    e.stopPropagation();
    setIsNotificationsOpen((prev) => !prev);
  };

  const closeDropdowns = () => {
    setIsCategoriesOpen(false);
    setIsNotificationsOpen(false);
    setIsProfileMenuOpen(false);
  };

  useEffect(() => {
    document.addEventListener("click", closeDropdowns);
    return () => document.removeEventListener("click", closeDropdowns);
  }, []);

  const openLogin = () => setActiveModal("login");
  const openRegister = () => setActiveModal("register");
  const closeModal = () => setActiveModal(null);

  return (
    <div className={`main-content ${activeModal ? "blurred" : ""}`}>
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

          <div className="notification-container">
            <button
              ref={notificationsButtonRef}
              className={`circle-button notification-button ${isNotificationsOpen ? "active" : ""}`}
              onClick={toggleNotifications}
              onMouseDown={() => (notificationsButtonRef.current.style.transform = "scale(0.95)")}
              onMouseUp={() =>
                (notificationsButtonRef.current.style.transform = isNotificationsOpen ? "scale(0.95)" : "scale(1.05)")
              }
              onMouseLeave={() => {
                if (!isNotificationsOpen) notificationsButtonRef.current.style.transform = "scale(1)";
              }}
            >
              <img src="/уведомления.svg" width="30" height="40" alt="уведомления" />
            </button>

            {isNotificationsOpen && (
              <div className="notification-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="notification-header">Уведомления</div>
                <div className="notifications-list">
                  <div className="notification-item">Фрилансер откликнулся на задачу</div>
                  <div className="notification-item read">Оставьте отзыв о работе фрилансера</div>
                  <div className="notification-item">Новое сообщение в чате</div>
                  <div className="notification-item read">Ваша задача выполнена</div>
                </div>
              </div>
            )}
          </div>

          <div className="categories-container">
            <button
              ref={categoriesButtonRef}
              className={`circle-button categories-button ${isCategoriesOpen ? "active" : ""}`}
              onClick={toggleCategories}
              onMouseDown={() => (categoriesButtonRef.current.style.transform = "scale(0.95)")}
              onMouseUp={() =>
                (categoriesButtonRef.current.style.transform = isCategoriesOpen ? "scale(0.95)" : "scale(1.05)")
              }
              onMouseLeave={() => {
                if (!isCategoriesOpen) categoriesButtonRef.current.style.transform = "scale(1)";
              }}
            >
              <img src="/категории.svg" width="30" height="45" alt="категории" />
            </button>

            {isCategoriesOpen && (
              <div className="categories-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="categories-header">Рубрики</div>
                <div className="categories-divider"></div>
                <div className="categories-grid">
                    <Link to="/category/design" className="category-item">Дизайн</Link>
                    <Link to="/category/social" className="category-item">Соцсети и маркетинг</Link>
                    <Link to="/category/development" className="category-item">Разработка и IT</Link>
                    <Link to="/category/media" className="category-item">Аудио, видео, съемка</Link>
                    <Link to="/category/business" className="category-item">Бизнес и жизнь</Link>
                    <Link to="/category/texts" className="category-item">Тексты и переводы</Link>
                </div>
              </div>
            )}
          </div>

            {isAuthenticated ? (
              <Link to={userRole === "moderator" ? "/moderator" : "/profile"}>
                <button className="circle-button">
                  <img src="/фейс-cropped.svg" width="35" height="50" alt="профиль" />
                </button>
              </Link>
            ) : (
              <div
                className="profile-container"
                onMouseEnter={() => setIsProfileMenuOpen(true)}
                onMouseLeave={() => setIsProfileMenuOpen(false)}
              >
                <div className="circle-button">
                  <img src="/фейс-cropped.svg" width="35" height="50" alt="профиль" />
                </div>

                {isProfileMenuOpen && (
                  <div className="auth-dropdown">
                    <button onClick={openLogin}>ВХОД</button>
                    <button onClick={openRegister}>РЕГИСТРАЦИЯ</button>
                  </div>
                )}
              </div>
            )}

            {activeModal === "login" && (
              <LoginModal onClose={closeModal} onSwitch={() => setActiveModal("register")} />
            )}
            {activeModal === "register" && (
              <RegisterModal onClose={closeModal} onSwitch={() => setActiveModal("login")} />
            )}
        </div>
      </header>
    </div>
  );
}

