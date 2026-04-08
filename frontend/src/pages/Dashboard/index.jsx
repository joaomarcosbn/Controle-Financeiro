import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../services/firebase';
import logoImg from '../../assets/logo.png';
import './style.css';

export function Dashboard() {
  const navigate = useNavigate();
  
  // Estados para guardar nossos dados
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  
  // Estados do formulário
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [category, setCategory] = useState('mercado');
  const [creditCardId, setCreditCardId] = useState('');

  // Pegamos os IDs que salvamos no Login
  const userId = localStorage.getItem('@PingouDindin:userId');
  const groupId = localStorage.getItem('@PingouDindin:groupId');

  // Essa função busca os dados no Back-end assim que a página carrega
  useEffect(() => {
    if (!userId || !groupId) {
      navigate('/');
      return;
    }
    fetchTransactions();
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

  async function fetchTransactions() {
    try {
      const response = await fetch(`http://localhost:3333/api/transactions/group/${groupId}`);
      const data = await response.json();
      
      if (response.ok && Array.isArray(data)) {
        // Ordena no front-end do mais novo para o mais antigo
        const sortedData = data.sort((a, b) => {
          const tempoA = a.date._seconds ? a.date._seconds : new Date(a.date).getTime() / 1000;
          const tempoB = b.date._seconds ? b.date._seconds : new Date(b.date).getTime() / 1000;
          return tempoB - tempoA;
        });
        
        setTransactions(sortedData);
      } else {
        console.error("Erro retornado pelo back-end:", data);
        setTransactions([]); // Se deu erro, salva uma lista vazia para não quebrar a tela
      }
    } catch (error) {
      console.error("Erro de conexão:", error);
      setTransactions([]); // Salva lista vazia se a API estiver fora do ar
    }
  }

  // Função para adicionar uma nova despesa/receita
  async function handleAddTransaction(e) {
    e.preventDefault(); // Evita que a página recarregue ao enviar o form

    const newTransaction = {
      title,
      amount: Number(amount),
      type,
      category,
      userId,
      groupId,
      creditCardId: creditCardId || null // Usa o ID do cartão ou null se for débito
    };

    try {
      await fetch('http://localhost:3333/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransaction)
      });

      // Limpa os campos após salvar
      setTitle('');
      setAmount('');
      setCreditCardId(''); // <-- Limpa a seleção do cartão para a próxima despesa!
      
      // Busca a lista atualizada do banco
      fetchTransactions();
    } catch (error) {
      alert("Erro ao salvar a transação!");
    }
  }

  // Função de Sair (Logout)
  function handleLogout() {
    auth.signOut();
    localStorage.clear();
    navigate('/');
  }

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <img src={logoImg} alt="Logo Pingou Dindin" className="dashboard-logo" />
          
          {/* Menu de Navegação */}
          <nav className="main-nav">
            <Link to="/dashboard" className="nav-link active">Visão Geral</Link>
            <Link to="/cartoes" className="nav-link">Cartões e Faturas</Link>
          </nav>
        </div>

        <button className="btn-logout" onClick={handleLogout}>Sair</button>
      </header>

      {/* Formulário para adicionar gastos ou receitas */}
      <form className="transaction-form" onSubmit={handleAddTransaction}>
        <div className="form-group">
          <label>Descrição</label>
          <input 
            type="text" 
            placeholder="Ex: Assaí" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Valor (R$)</label>
          <input 
            type="number" 
            step="0.01" 
            placeholder="0.00" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Tipo</label>
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="EXPENSE">Saída (Despesa)</option>
            <option value="INCOME">Entrada (Receita)</option>
          </select>
        </div>

        <div className="form-group">
          <label>Categoria</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="mercado">Mercado</option>
            <option value="lazer">Lazer</option>
            <option value="alimentacao">Alimentação</option>
            <option value="salario">Salário</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <div className="form-group">
          <label>Forma de Pagamento</label>
          <select value={creditCardId} onChange={(e) => setCreditCardId(e.target.value)}>
            <option value="">Débito / Dinheiro / Pix</option>
            {cards.map(card => (
              <option key={card.id} value={card.id}>{card.name}</option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-add">Adicionar</button>
      </form>

      {/* Lista das transações */}
      <h2>Extrato do Casal</h2>
      <ul className="transaction-list">
        {transactions.length === 0 ? (
          <p>Nenhuma transação registrada ainda. Comece a controlar!</p>
        ) : (
          transactions.map(transaction => (
            <li key={transaction.id} className={`transaction-item ${transaction.type}`}>
              <div className="transaction-info">
                <strong>{transaction.title}</strong>
                <span>
                  {transaction.category.toUpperCase()}
                  {/* Se a compra tiver ID de cartão, exibe o aviso visual */}
                  {transaction.creditCardId && ' 💳 (Crédito)'}
                </span>
              </div>
              <div className={`transaction-amount ${transaction.type}`}>
                {transaction.type === 'INCOME' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}