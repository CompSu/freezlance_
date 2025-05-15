import { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "../assets/Modal.css";

export default function LoginModal({ onClose, onSwitch  }) {
  const [selectedRole, setSelectedRole] = useState("client");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Форма входа отправлена:", formData, "роль:", selectedRole);
    onClose();
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
            <label htmlFor="username">Имя</label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="Укажите свое имя"
              value={formData.username}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="Укажите свой email"
              value={formData.email}
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
              placeholder="Укажите свой пароль"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
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
