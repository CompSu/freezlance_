import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Интерцептор для обработки ошибок
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // Если сервер вернул ошибку с статусом
            console.error('API Error:', error.response.data);
            
            // Если пользователь не авторизован, можно перенаправить на страницу входа
            if (error.response.status === 401) {
                // Можно добавить редирект или показать модальное окно входа
                console.log('Требуется авторизация');
            }
        }
        return Promise.reject(error);
    }
);

export default api; 