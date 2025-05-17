import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/header';
import api from '../api/axios';

const AcceptOffer = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const [application, setApplication] = useState(null);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        loadApplication();
    }, [applicationId]);

    const loadApplication = async () => {
        try {
            const response = await api.get(`/applications/${applicationId}`);
            if (response.data && response.data.application) {
                setApplication(response.data.application);
            } else {
                setError('Предложение не найдено');
            }
        } catch (err) {
            console.error('Ошибка при загрузке предложения:', err);
            setError(err.response?.data?.error || 'Ошибка при загрузке предложения');
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        try {
            // Принимаем предложение
            await api.post(`/applications/${applicationId}/accept`, {
                comment: comment
            });
            
            // Закрываем вакансию
            if (application?.vacancy?.id) {
                await api.put(`/vacancies/${application.vacancy.id}/close`);
            }
            
            navigate('/profile');
        } catch (err) {
            console.error('Ошибка при принятии предложения:', err);
            setError(err.response?.data?.error || 'Ошибка при принятии предложения');
        }
    };

    const handleReject = async () => {
        try {
            await api.post(`/applications/${applicationId}/reject`, {
                comment: comment
            });
            navigate('/profile');
        } catch (err) {
            console.error('Ошибка при отклонении предложения:', err);
            setError(err.response?.data?.error || 'Ошибка при отклонении предложения');
        }
    };

    if (loading) {
        return (
            <>
                <Header />
                <div className="container mt-4">
                    <div className="text-center">
                        <h2>Загрузка...</h2>
                    </div>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="container mt-4">
                    <div className="alert alert-danger">
                        <h4>Ошибка</h4>
                        <p>{error}</p>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/profile')}
                        >
                            Вернуться в профиль
                        </button>
                    </div>
                </div>
            </>
        );
    }

    if (!application) {
        return (
            <>
                <Header />
                <div className="container mt-4">
                    <div className="alert alert-warning">
                        <h4>Предложение не найдено</h4>
                        <button 
                            className="btn btn-primary"
                            onClick={() => navigate('/profile')}
                        >
                            Вернуться в профиль
                        </button>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Header />
            <div className="container mt-4">
                <h2>Рассмотрение предложения</h2>
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">{application.vacancy.title}</h5>
                        <p className="card-text">
                            <strong>Исполнитель:</strong> {application.user.username}
                        </p>
                        <p className="card-text">
                            <strong>Описание вакансии:</strong> {application.vacancy.description}
                        </p>
                        {application.message && (
                            <p className="card-text">
                                <strong>Сообщение от исполнителя:</strong> {application.message}
                            </p>
                        )}
                        <div className="form-group">
                            <label htmlFor="comment">Ваш комментарий:</label>
                            <textarea
                                id="comment"
                                className="form-control"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows="3"
                                placeholder="Оставьте комментарий для исполнителя..."
                            />
                        </div>
                        <div className="mt-3 d-flex gap-2">
                            <button
                                className="btn btn-success"
                                onClick={handleAccept}
                                disabled={!comment.trim()}
                            >
                                Принять предложение
                            </button>
                            <button
                                className="btn btn-danger"
                                onClick={handleReject}
                                disabled={!comment.trim()}
                            >
                                Отклонить предложение
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AcceptOffer; 
