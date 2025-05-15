import { useState } from 'react'
import './App.css'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Profile from './pages/Profile'
import CreateTaskForm from './pages/CreateTaskForm';
import RegisterModal from './components/RegisterModal';



function App()
 {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-task" element={<CreateTaskForm />} />
      </Routes>
    </div>
  )
}

export default App
