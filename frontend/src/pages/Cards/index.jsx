import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../services/firebase';
import logoImg from '../../assets/logo.png';
import './style.css';
import '../Dashboard/style.css'; // Aproveitando os estilos do cabeçalho!

export function Cards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [name, setName] = useState('');
  const [closingDay, setClosingDay] = useState('');
  const [dueDay, setDueDay] = useState('');

  const groupId = localStorage.getItem('@PingouDindin:groupId');

  useEffect(() => {
    if (!groupId) {
      navigate('/');
      return;
    }
    fetchCards();
  }, []);

  async function fetchCards() {
    try {
      const response = await fetch(`http://localhost:3333/api/cards/group/${groupId}`);
      const data = await response.json();
      if (response.ok && Array.isArray(data)) {
        setCards(data);
      }
    } catch (error) {
      console.error("Erro ao buscar cartões:", error);
    }
  }

  async function handleAddCard(e) {
    e.preventDefault();

    const newCard = { name, closingDay, dueDay, groupId };

    try {
      await fetch('http://localhost:3333/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard)
      });

      setName('');
      setClosingDay('');
      setDueDay('');
      fetchCards();
    } catch (error) {
      alert("Erro ao salvar o cartão!");
    }
  }

  function handleLogout() {
    auth.signOut();
    localStorage.clear();
    navigate('/');
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <img src={logoImg} alt="Logo" className="dashboard-logo" />
          <nav className="main-nav">
            <Link to="/dashboard" className="nav-link">Visão Geral</Link>
            <Link to="/cartoes" className="nav-link active">Cartões e Faturas</Link>
          </nav>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Sair</button>
      </header>

      <h2>Meus Cartões</h2>
      <form className="transaction-form" onSubmit={handleAddCard}>
        <div className="form-group">
          <label>Nome do Cartão</label>
          <input 
            type="text" 
            placeholder="Ex: Santander João" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Dia de Fechamento</label>
          <input 
            type="number" 
            placeholder="Ex: 25" 
            value={closingDay}
            onChange={(e) => setClosingDay(e.target.value)}
            required
            min="1" max="31"
          />
        </div>
        <div className="form-group">
          <label>Dia de Vencimento</label>
          <input 
            type="number" 
            placeholder="Ex: 5" 
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
            required
            min="1" max="31"
          />
        </div>
        <button type="submit" className="btn-add">Cadastrar Cartão</button>
      </form>

      <div className="cards-grid">
        {cards.length === 0 ? (
          <p>Nenhum cartão cadastrado.</p>
        ) : (
          cards.map(card => (
            <div key={card.id} className="card-item">
              <h3>{card.name}</h3>
              <p>Fecha dia: <strong>{card.closingDay}</strong></p>
              <p>Vence dia: <strong>{card.dueDay}</strong></p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}