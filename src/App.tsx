import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Pedidos from './pages/Pedidos';
import Clientes from './pages/Clientes';
import Financeiro from './pages/Financeiro';
import Produtos from './pages/Produtos';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="pedidos" element={<Pedidos />} />
          <Route path="clientes" element={<Clientes />} />
          <Route path="produtos" element={<Produtos />} />
          <Route path="financeiro" element={<Financeiro />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
