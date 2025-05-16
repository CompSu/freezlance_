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
            setApplication(response.data.application);
        } catch (err) {
            setError('Ошибка при загрузке предложения');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAccept = async () => {
        try {
            await api.post(`/applications/${applicationId}/accept`, {
                comment: comment
            });
            navigate('/profile');
        } catch (err) {
            setError('Ошибка при принятии предложения');
            console.error(err);
        }
    };

    if (loading) return <div>Загрузка...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!application) return <div>Предложение не найдено</div>;

    return (
        <>
            <Header />
            <div className="container mt-4">
                <h2>Принятие предложения</h2>
                <div className="card mb-4">
                    <div className="card-body">
                        <h5 className="card-title">{application.vacancy.title}</h5>
                        <p className="card-text">
                            <strong>Заказчик:</strong> {application.vacancy.author.username}
                        </p>
                        <p className="card-text">
                            <strong>Контактная информация:</strong> {application.contact_info}
                        </p>
                        <div className="form-group">
                            <label htmlFor="comment">Ваш комментарий:</label>
                            <textarea
                                id="comment"
                                className="form-control"
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                rows="3"
                                placeholder="Оставьте комментарий для заказчика..."
                            />
                        </div>
                        <div className="mt-3">
                            <button
                                className="btn btn-primary"
                                onClick={handleAccept}
                                disabled={!comment.trim()}
                            >
                                Принять предложение
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AcceptOffer; 