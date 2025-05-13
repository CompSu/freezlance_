import { useState } from 'react'
import './App.css'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Profile from './pages/Profile'
import CreateTaskForm from './pages/CreateTaskForm';

function App() {
  return (
    <div>
      <nav>
        <Link to="/">Главная</Link> | <Link to="/profile">Профиль</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-task" element={<CreateTaskForm />} />
      </Routes>
    </div>
  )
}

export default App
