import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Cards } from "./pages/Cards";
import { Invoice } from "./pages/Invoice";

// Importando o nosso Guarda!
import { ProtectedRoute } from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota Pública (Qualquer um acessa) */}
        <Route path="/" element={<Login />} />

        {/* Rotas Protegidas (Só passa quem está logado) */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/cartoes" 
          element={
            <ProtectedRoute>
              <Cards />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/fatura/:cardId" 
          element={
            <ProtectedRoute>
              <Invoice />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;