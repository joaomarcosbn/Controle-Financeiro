import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Cards } from "./pages/Cards";
import { Invoice } from "./pages/Invoice";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/cartoes" element={<Cards />} />
        <Route path="/fatura/:cardId" element={<Invoice />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;