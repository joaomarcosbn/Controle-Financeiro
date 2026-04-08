import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../../services/firebase';
import logoImg from '../../assets/logo.png';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './style.css';

export function Dashboard() {
  const navigate = useNavigate();
  
  const [transactions, setTransactions] = useState([]);
  const [cards, setCards] = useState([]);
  
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('EXPENSE');
  const [category, setCategory] = useState('mercado');
  const [creditCardId, setCreditCardId] = useState('');

  const [isInstallment, setIsInstallment] = useState(false); // Checkbox de parcelamento
  const [installments, setInstallments] = useState(1);       // Número de parcelas

  const userId = localStorage.getItem('@PingouDindin:userId');
  const groupId = localStorage.getItem('@PingouDindin:groupId');

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/transactions/group/${groupId}`);
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
        const sortedData = data.sort((a, b) => {
          const tempoA = a.date._seconds ? a.date._seconds : new Date(a.date).getTime() / 1000;
          const tempoB = b.date._seconds ? b.date._seconds : new Date(b.date).getTime() / 1000;
          return tempoB - tempoA;
        });
        setTransactions(sortedData);
      } else {
        setTransactions([]);
      }
    } catch (error) {
      setTransactions([]);
    }
  }

  async function handleAddTransaction(e) {
    e.preventDefault();

    try {
      const parcelasTotal = isInstallment ? Number(installments) : 1;
      const valorBase = Number(amount);

      // Loop para salvar múltiplas parcelas se for o caso
      for (let i = 0; i < parcelasTotal; i++) {
        // Calcula a data jogando os meses para frente
        const dataCompra = new Date();
        dataCompra.setMonth(dataCompra.getMonth() + i);

        // Ajusta o título se for parcelado (Ex: "TV (01/12)")
        const titleFinal = isInstallment 
          ? `${title} (${String(i + 1).padStart(2, '0')}/${String(parcelasTotal).padStart(2, '0')})`
          : title;

        const newTransaction = {
          title: titleFinal,
          amount: isInstallment ? (valorBase / parcelasTotal) : valorBase, // Divide o valor nas parcelas
          type,
          category,
          userId,
          groupId,
          creditCardId: creditCardId || null,
          date: dataCompra.toISOString() // Manda a data calculada para o Back-end
        };

        await fetch('http://localhost:3333/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTransaction)
        });
      }

      // Limpa os campos após salvar
      setTitle('');
      setAmount('');
      setCreditCardId('');
      setIsInstallment(false);
      setInstallments(1);
      
      fetchTransactions();
    } catch (error) {
      alert("Erro ao salvar a transação!");
    }
  }

  function handleLogout() {
    auth.signOut();
    localStorage.clear();
    navigate('/');
  }

  // === CÁLCULOS DOS CARDS (FILTRADO PELO MÊS ATUAL) ===
  const today = new Date();
  const currentMonth = String(today.getMonth() + 1).padStart(2, '0');
  const currentYear = today.getFullYear();
  const currentMonthRef = `${currentMonth}/${currentYear}`; // Ex: "04/2026"

  // Filtra as transações para somar APENAS as que caem no mês atual
  const currentMonthTransactions = transactions.filter(t => t.referenceMonth === currentMonthRef);

  const totalIncome = currentMonthTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const totalExpense = currentMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, curr) => acc + curr.amount, 0);

  const balance = totalIncome - totalExpense;

  // === CÁLCULOS DO GRÁFICO (Agrupar despesas por categoria do mês atual) ===
  const expensesByCategory = currentMonthTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((acc, current) => {
      const cat = current.category;
      if (!acc[cat]) acc[cat] = 0;
      acc[cat] += current.amount;
      return acc;
    }, {});

  const dataForPieChart = Object.keys(expensesByCategory).map(key => ({
    name: key.toUpperCase(),
    value: expensesByCategory[key]
  }));

  const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8'];

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <img src={logoImg} alt="Logo Pingou Dindin" className="dashboard-logo" />
          <nav className="main-nav">
            <Link to="/dashboard" className="nav-link active">Visão Geral</Link>
            <Link to="/cartoes" className="nav-link">Cartões e Faturas</Link>
          </nav>
        </div>
        <button className="btn-logout" onClick={handleLogout}>Sair</button>
      </header>

      {/* Cards de Resumo */}
      <div className="summary-cards">
        <div className="summary-card">
          <span>Entradas</span>
          <strong className="income">R$ {totalIncome.toFixed(2)}</strong>
        </div>
        <div className="summary-card">
          <span>Saídas</span>
          <strong className="expense">R$ {totalExpense.toFixed(2)}</strong>
        </div>
        <div className="summary-card total">
          <span>Saldo Total</span>
          <strong className={balance >= 0 ? 'income' : 'expense'}>
            R$ {balance.toFixed(2)}
          </strong>
        </div>
      </div>

      {/* Gráfico de Pizza */}
      {dataForPieChart.length > 0 && (
        <div className="chart-container">
          <h2>Onde seu dinheiro está indo? (Este Mês)</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={dataForPieChart}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {dataForPieChart.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `R$ ${value.toFixed(2)}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Formulário */}
      <form className="transaction-form" onSubmit={handleAddTransaction}>
        <div className="form-group">
          <label>Descrição</label>
          <input type="text" placeholder="Ex: Assaí" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Valor Total (R$)</label>
          <input type="number" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
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

        {/* Checkbox e Input de Parcelamento */}
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center', marginBottom: '15px' }}>
          <label style={{ color: 'white', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
            <input 
              type="checkbox" 
              checked={isInstallment}
              onChange={(e) => setIsInstallment(e.target.checked)}
              style={{ width: '18px', height: '18px' }}
            />
            Compra Parcelada?
          </label>

          {isInstallment && (
            <div className="form-group" style={{ marginBottom: 0, flex: 1 }}>
              <input 
                type="number" 
                min="2"
                max="48"
                placeholder="Qtd. de Parcelas" 
                value={installments}
                onChange={(e) => setInstallments(e.target.value)}
                required
              />
            </div>
          )}
        </div>

        <button type="submit" className="btn-add">Adicionar</button>
      </form>

      {/* Extrato (Continuará mostrando o histórico completo por enquanto para você não perder de vista as antigas) */}
      <h2>Extrato do Casal (Geral)</h2>
      <ul className="transaction-list">
        {transactions.length === 0 ? (
          <p>Nenhuma transação registrada ainda.</p>
        ) : (
          transactions.map(transaction => (
            <li key={transaction.id} className={`transaction-item ${transaction.type}`}>
              <div className="transaction-info">
                <strong>{transaction.title}</strong>
                <span>
                  {transaction.category.toUpperCase()}
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