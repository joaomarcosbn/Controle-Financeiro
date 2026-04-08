import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children }) {
  // Verifica se existe um usuário logado no armazenamento do navegador
  const userId = localStorage.getItem('@PingouDindin:userId');

  // Se não tiver usuário, redireciona para a tela de Login ("/") imediatamente,
  // antes mesmo da tela protegida tentar carregar.
  if (!userId) {
    return <Navigate to="/" replace />;
  }

  // Se tiver usuário, renderiza a tela que ele pediu (children)
  return children;
}