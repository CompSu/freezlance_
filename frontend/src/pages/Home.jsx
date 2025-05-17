import { useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/Header";

export default function Home() {
  const [query, setQuery] = useState("");

  const handleSearch = () => {
    console.log("Ищем:", query);
  };

  return (
    <>
      <Header />
      <div className="square">
      <div className="IN-profile-container">
        <img src="/холодильник-cropped (1).svg" style={{right: 200}} alt="Холодильник" />
        <div className="element">
          <span>СВЕЖЕЕ РЕШЕНИЕ ДЛЯ ВАШЕГО БИЗНЕСА</span>
        </div>
        <div className="HomeText">
          <span>
            Холодильник пуст?
            Мы поможем вам наполнить его свежими решениями, у которых не истечёт срок годности!
          </span>
          <span>
            Найти фрилансера или вакансию так же легко, как открыть холодильник и достать молоко!
          </span>
        </div>
      </div>
      </div>
    </>
  );
}
