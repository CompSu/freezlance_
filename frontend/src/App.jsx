import { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Profile from './pages/Profile'
import ModeratorProfile from "./pages/ModeratorProfile";
import CreateTaskForm from './pages/CreateTaskForm';
import TaskModeration from './pages/TaskModeration';
import TaskDetails from "./pages/TaskDetails";
import CategoryPage from "./pages/CategoryPage";
import AcceptOffer from './pages/AcceptOffer';

import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Проверяем авторизацию при загрузке
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/profile', {
          credentials: 'include'
        });
        setIsAuthenticated(response.ok);
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  // Защищенный маршрут
  const ProtectedRoute = ({ children }) => {
    if (isLoading) return <div>Загрузка...</div>;
    if (!isAuthenticated) return <Navigate to="/" />;
    return children;
  };

  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } />
        <Route path="/users/:username" element={<Profile />} />
        <Route path="/moderator" element={
          <ProtectedRoute>
            <ModeratorProfile />
          </ProtectedRoute>
        } />
        <Route path="/create-task" element={
          <ProtectedRoute>
            <CreateTaskForm />
          </ProtectedRoute>
        } />
        <Route path="/vacancies/:id" element={<TaskDetails />} />
        <Route path="/moderation" element={
          <ProtectedRoute>
            <TaskModeration />
          </ProtectedRoute>
        } />
        <Route path="/category/:name" element={<CategoryPage />} />
        <Route path="/categories/:categoryId/subcategories/:subcategoryId" element={<CategoryPage />} />
        <Route path="/applications/:applicationId/accept" element={<AcceptOffer />} />
      </Routes>
    </div>
  )
}

export default App
