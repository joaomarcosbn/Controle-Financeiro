import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import '../Dashboard/style.css'; // Usamos o estilo global do header

export function Invoice() {
  const { cardId } = useParams(); // Pega o ID do cartão que está na URL
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState([]);
  const [months, setMonths] = useState([]); // Guarda os meses que têm fatura
  const [selectedMonth, setSelectedMonth] = useState(''); // Mês que você está olhando

  useEffect(() => {
    fetchCardTransactions();
  }, [cardId]);

  async function fetchCardTransactions() {
    try {
      const response = await fetch(`http://localhost:3333/api/transactions/card/${cardId}`);
      const data = await response.json();
      
      if (response.ok && Array.isArray(data)) {
        setTransactions(data);
        
        // Extrai apenas os meses únicos que vieram do banco (ex: "04/2026", "05/2026")
        const uniqueMonths = [...new Set(data.map(t => t.referenceMonth))].filter(Boolean);
        
        // Ordena os meses (opcional, mas ajuda)
        uniqueMonths.sort();
        setMonths(uniqueMonths);
        
        // Seleciona o último mês automaticamente, se existir
        if (uniqueMonths.length > 0) {
          setSelectedMonth(uniqueMonths[uniqueMonths.length - 1]);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar fatura:", error);
    }
  }

  // Filtra as transações para mostrar só as do mês selecionado
  const currentInvoiceTransactions = transactions.filter(t => t.referenceMonth === selectedMonth);

  // Calcula o total da fatura (soma tudo)
  const invoiceTotal = currentInvoiceTransactions.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <img src={logoImg} alt="Logo" className="dashboard-logo" />
          <nav className="main-nav">
            <Link to="/dashboard" className="nav-link">Visão Geral</Link>
            <Link to="/cartoes" className="nav-link">Cartões e Faturas</Link>
          </nav>
        </div>
        <button className="btn-logout" onClick={() => navigate(-1)}>Voltar</button>
      </header>

      <div style={{ backgroundColor: '#2a2a2a', padding: '20px', borderRadius: '12px', color: 'white' }}>
        <h2 style={{ marginTop: 0 }}>Detalhes da Fatura</h2>
        
        {months.length === 0 ? (
          <p>Nenhuma compra registrada neste cartão ainda.</p>
        ) : (
          <>
            <div className="form-group" style={{ marginBottom: '20px', maxWidth: '300px' }}>
              <label style={{ color: '#ccc' }}>Mês de Referência</label>
              <select 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(e.target.value)}
                style={{ backgroundColor: '#333', color: 'white', border: '1px solid #555' }}
              >
                {months.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>

            <h3 style={{ borderBottom: '1px solid #555', paddingBottom: '10px' }}>
              Total a pagar: <span style={{ color: '#ff4d4f' }}>R$ {invoiceTotal.toFixed(2)}</span>
            </h3>

            <ul className="transaction-list">
              {currentInvoiceTransactions.length === 0 ? (
                <p>Nenhum gasto neste mês.</p>
              ) : (
                currentInvoiceTransactions.map(t => (
                  <li key={t.id} className={`transaction-item ${t.type}`}>
                    <div className="transaction-info">
                      <strong>{t.title}</strong>
                      <span>{t.category.toUpperCase()} - {new Date(t.date).toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className={`transaction-amount ${t.type}`}>
                      R$ {t.amount.toFixed(2)}
                    </div>
                  </li>
                ))
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}