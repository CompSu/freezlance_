import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "../assets/Modal.css";

export default function RegisterModal({ onClose, onSwitch }) {
  const [selectedRole, setSelectedRole] = useState("client");
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    nick: "",
    email: "",
    number: "",
    date: "",
    password: "",
    repeatPassword: ""
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Регистрация отправлена:", formData, "роль:", selectedRole);
    onClose();
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
        <form method="POST" className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Имя</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="surname">Фамилия</label>
            <input type="text" id="surname" name="surname" value={formData.surname} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="nick">Ник</label>
            <input type="text" id="nick" name="nick" value={formData.nick} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input type="email" id="email" name="email" value={formData.email} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="number">Телефон</label>
            <input type="tel" id="number" name="number" value={formData.number} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="date">Дата рождения</label>
            <input type="date" id="date" name="date" value={formData.date} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Пароль</label>
            <input type="password" id="password" name="password" value={formData.password} onChange={handleInputChange} required />
          </div>
          <div className="form-group">
            <label htmlFor="repeatPassword">Повторите пароль</label>
            <input type="password" id="repeatPassword" name="repeatPassword" value={formData.repeatPassword} onChange={handleInputChange} required />
          </div>

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
