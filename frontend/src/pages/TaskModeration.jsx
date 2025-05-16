import React, { useState, useEffect } from 'react';
import { Container, Card, Button, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import Header from "../components/header";
import "../assets/Moder.css";

const TaskModeration = () => {
    const [vacancies, setVacancies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        loadVacancies();
    }, []);

    const loadVacancies = async () => {
        try {
            const response = await api.get('/moderator/vacancies');
            setVacancies(response.data.pending_vacancies);
        } catch (err) {
            if (err.response?.status === 403) {
                navigate('/');
            } else {
                setError('Ошибка при загрузке вакансий');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleModerate = async (vacancyId, action, rejectionReason = '') => {
        try {
            await api.put(`/moderator/vacancies/${vacancyId}`, {
                action,
                rejection_reason: rejectionReason
            });
            
            // Обновляем список вакансий после модерации
            setVacancies(vacancies.filter(v => v.id !== vacancyId));
        } catch (err) {
            setError(err.response?.data?.error || 'Ошибка при модерации вакансии');
        }
    };

    if (loading) return <div>Загрузка...</div>;

    return (
        <>
            <Header />
            <Container className="py-4">
                <h2>Модерация вакансий</h2>
                
                {error && <Alert variant="danger">{error}</Alert>}
                
                {vacancies.length === 0 ? (
                    <Alert variant="info">Нет вакансий для модерации</Alert>
                ) : (
                    vacancies.map(vacancy => (
                        <Card key={vacancy.id} className="mb-3">
                            <Card.Body>
                                <Card.Title>{vacancy.title}</Card.Title>
                                <Card.Subtitle className="mb-2 text-muted">
                                    Автор: {vacancy.author.username}
                                </Card.Subtitle>
                                
                                <Card.Text>
                                    {vacancy.description}
                                </Card.Text>
                                
                                <div className="mb-3">
                                    <strong>Категория:</strong> {vacancy.subcategory.name}
                                </div>
                                
                                {vacancy.salary && (
                                    <div className="mb-3">
                                        <strong>Бюджет:</strong> {vacancy.salary}
                                    </div>
                                )}
                                
                                <div className="d-flex gap-2">
                                    <Button 
                                        variant="success"
                                        onClick={() => handleModerate(vacancy.id, 'approve')}
                                    >
                                        Одобрить
                                    </Button>
                                    
                                    <Form 
                                        className="d-flex gap-2"
                                        onSubmit={(e) => {
                                            e.preventDefault();
                                            const reason = e.target.elements.reason.value;
                                            handleModerate(vacancy.id, 'reject', reason);
                                        }}
                                    >
                                        <Form.Control
                                            type="text"
                                            name="reason"
                                            placeholder="Причина отклонения"
                                            required
                                        />
                                        <Button variant="danger" type="submit">
                                            Отклонить
                                        </Button>
                                    </Form>
                                </div>
                            </Card.Body>
                        </Card>
                    ))
                )}
            </Container>
        </>
    );
};

export default TaskModeration;
