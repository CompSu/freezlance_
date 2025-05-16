import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Profile from './pages/Profile'
import ModeratorProfile from "./pages/ModeratorProfile";
import CreateTaskForm from './pages/CreateTaskForm';
import TaskModeration from './pages/TaskModeration';
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
        <Route path="/moderator" element={<ModeratorProfile />} />
        <Route path="/create-task" element={<CreateTaskForm />} />
        <Route path="/task/:id" element={<TaskDetails />} />
        <Route path="/moderation/:id" element={<TaskModeration />} />
        <Route path="/category/:name" element={<CategoryPage />} />
      </Routes>
    </div>
  )
}

export default App
