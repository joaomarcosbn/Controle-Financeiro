import { useNavigate } from 'react-router-dom';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../services/firebase'; // Nossa conexão com o Firebase

import './style.css';
import logoImg from '../../assets/logo.png';

export function Login() {
  // Hook do React Router para navegar entre as páginas
  const navigate = useNavigate();

  // Função que será chamada ao clicar no botão
  async function handleGoogleSignIn() {
    try {
      const provider = new GoogleAuthProvider();
      
      // 1. Abre o pop-up do Google
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // 2. Manda os dados do Google para o nosso Back-end (Node.js)
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.uid,
          name: user.displayName,
          email: user.email,
        }),
      });

      const data = await response.json();

      // 3. Salva o ID do grupo e do usuário no navegador (Local Storage)
      // Assim o Dashboard vai saber de qual grupo ele deve puxar as despesas!
      localStorage.setItem('@PingouDindin:userId', user.uid);
      localStorage.setItem('@PingouDindin:groupId', data.groupId);

      // 4. Redireciona para o Dashboard
      navigate('/dashboard');

    } catch (error) {
      console.error("Erro ao fazer login:", error);
      alert("Ocorreu um erro ao tentar fazer login. Tente novamente.");
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <img src={logoImg} alt="Logo Pingou Dindin" className="login-logo" />
        
        <h1>Pingou Dindin</h1>
        <p>O controle financeiro da família</p>
        
        {/* Adicionamos o evento onClick aqui! */}
        <button className="btn-google" onClick={handleGoogleSignIn}>
          Entrar com o Google
        </button>
      </div>
    </div>
  );
}