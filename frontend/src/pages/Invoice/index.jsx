import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import logoImg from '../../assets/logo.png';
import '../Dashboard/style.css'; 

export function Invoice() {
  const { cardId } = useParams(); 
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState([]);
  const [months, setMonths] = useState([]); 
  const [selectedMonth, setSelectedMonth] = useState(''); 

  useEffect(() => {
    fetchCardTransactions();
  }, [cardId]);

  async function fetchCardTransactions() {
    try {
      const response = await fetch(`http://localhost:3333/api/transactions/card/${cardId}`);
      const data = await response.json();
      
      if (response.ok && Array.isArray(data)) {
        setTransactions(data);
        
        const uniqueMonths = [...new Set(data.map(t => t.referenceMonth))].filter(Boolean);
        uniqueMonths.sort();
        setMonths(uniqueMonths);
        
        if (uniqueMonths.length > 0) {
          setSelectedMonth(uniqueMonths[uniqueMonths.length - 1]);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar fatura:", error);
    }
  }

  // NOVA FUNÇÃO: Traduz a data do Firebase para o formato brasileiro
  function formatarData(dataBanco) {
    if (!dataBanco) return '';
    
    // Se for o objeto Timestamp do Firebase (tem _seconds)
    if (dataBanco._seconds) {
      // O JS precisa da data em milissegundos, então multiplicamos por 1000
      return new Date(dataBanco._seconds * 1000).toLocaleDateString('pt-BR');
    }
    
    // Se já for uma data normal
    return new Date(dataBanco).toLocaleDateString('pt-BR');
  }

  const currentInvoiceTransactions = transactions.filter(t => t.referenceMonth === selectedMonth);
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
        
        {/* CORREÇÃO DO BOTÃO: Adicionado o marginLeft: 'auto' */}
        <button 
          className="btn-logout" 
          onClick={() => navigate(-1)}
          style={{ marginLeft: 'auto' }}
        >
          Voltar
        </button>
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
                      {/* CORREÇÃO DA DATA: Usando a função formatarData */}
                      <span>{t.category.toUpperCase()} - {formatarData(t.date)}</span>
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