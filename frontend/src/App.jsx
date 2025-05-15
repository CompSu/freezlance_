import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Profile from './pages/Profile'
import CreateTaskForm from './pages/CreateTaskForm';
import TaskDetails from "./pages/TaskDetails";
import CategoryPage from "./pages/CategoryPage";
import './App.css'

function App()
 {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/create-task" element={<CreateTaskForm />} />
        <Route path="/task/:id" element={<TaskDetails />} />
        <Route path="/category/:name" element={<CategoryPage />} />
      </Routes>
    </div>
  )
}

export default App
