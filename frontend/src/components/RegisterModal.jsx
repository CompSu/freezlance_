import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "../assets/Modal.css";
import api from '../api/axios';

export default function RegisterModal({ onClose, onSwitch, onRegisterSuccess }) {
  const [selectedRole, setSelectedRole] = useState("client");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: ""
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirm_password) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      const response = await api.post('/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirm_password: formData.confirm_password
      });

      if (response.data.user) {
        onRegisterSuccess(response.data.user);
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Ошибка при регистрации");
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const modalRoot = document.getElementById("modal-root");
  if (!modalRoot) return null;

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={onClose}>
      <div className="register-container" onClick={(e) => e.stopPropagation()}>
        <h2 className="register-title">РЕГИСТРАЦИЯ</h2>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Имя пользователя</label>
            <input type="text" id="username" name="username" value={formData.username} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="confirm_password">Повторите пароль</label>
            <input type="password" id="confirm_password" name="confirm_password" value={formData.confirm_password} onChange={handleInputChange} required />
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

          <button type="submit" className="register-btn">
            <span>ЗАРЕГИСТРИРОВАТЬСЯ</span>
          </button>
        </form>

        <p className="login-link">
            Уже есть аккаунт? <span className="link-like" onClick={onSwitch}>Войдите</span>
        </p>

      </div>
    </div>,
    modalRoot
  );
}

