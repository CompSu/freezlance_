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
          <button className="circle-button">
            <img src="/фейс-cropped.svg" width="35" height="50" alt="профиль" />
          </button>
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

      <footer>
        <span>Мы в социальных сетях</span>
        <span>
          Сотрудничество:
          <br />
          Придумаем
        </span>
        <span>
          Юридическая информация:
          <br />
          Пользовательское соглашение
          <br />
          Политика конфидециальности
        </span>
        <span>
          Контакты:
          <br />
          8 (982) 517 12 59
          <br />
          8 (800) 555 35 35
        </span>
        <span>
          Местоположение:
          <br />
          г. Ханты-Мансийск
          <br />
          ул. Шевченко, 52
        </span>
      </footer>
    </>
  )
}