import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <header>
        <div className="logo">
          <img src="/logo.png" alt="Логотип" />
          <span>FREEZLANCE</span>
        </div>
        <div className="buttons">
          <button className="circle-button">
            <img src="/поиск.svg" width="30" height="40" alt="поиск" />
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

      <div className="square">
        <img src="/холодильник-cropped (1).svg" alt="Холодильник" />
        <div className="element">
          <span>СВЕЖЕЕ РЕШЕНИЕ ДЛЯ ВАШЕГО БИЗНЕСА</span>
        </div>
        <div className="content">
          <span>
            Холодильник пуст? У нас найдется свеженькое молоко идей от лучших
            фрилансеров страны!
          </span>
          <span>
            Свежий взгляд на каждый проект и ледяной профессионализм в работе.
          </span>
        </div>
      </div>
    </>
  )
}