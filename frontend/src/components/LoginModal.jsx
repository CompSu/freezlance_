import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "../assets/Modal.css";
import api from '../api/axios';

export default function LoginModal({ onClose, onSwitch, onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState("client");
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Очищаем ошибку при изменении данных
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', formData);
      if (response.data.user) {
        onLoginSuccess(response.data.user);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Ошибка при входе");
    }
  };

  const modalRoot = document.getElementById("modal-root");

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="container" onClick={(e) => e.stopPropagation()}>
        <h2 className="auth-title">ВХОД</h2>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Введите имя пользователя"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="Введите пароль"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="role-selection">
            <div
              className={`role-btn signup1 ${selectedRole === "client" ? "active" : ""}`}
              onClick={() => setSelectedRole("client")}
            >
              Я заказчик
            </div>
            <div
              className={`role-btn signup2 ${selectedRole === "freelancer" ? "active" : ""}`}
              onClick={() => setSelectedRole("freelancer")}
            >
              Я фрилансер
            </div>
          </div>

          <button type="submit" className="submit-btn">
            <span>войти</span>
          </button>
        </form>

        <p className="register-link">
            Еще нет аккаунта? <span className="link-like" onClick={onSwitch}>Зарегистрируйтесь</span>
        </p>

      </div>
    </div>,
    modalRoot
  );
}