import React from 'react';
import { Link } from 'react-router-dom';  // Usando React Router para navegação

const Dashboard = () => {
  return (
    <div>
      <h2>Dashboard</h2>
      <nav>
        <ul>
          <li><Link to="/manter-professores">Manter Professores</Link></li>
          <li><Link to="/manter-alunos">Manter Alunos</Link></li>
          <li><Link to="/manter-notas">Manter Notas</Link></li>
          <li><Link to="/manter-turmas">Manter Turmas</Link></li>
          <li><Link to="/manter-disciplinas">Manter Disciplinas</Link></li>
          <li><Link to="/gerar-relatorio">Gerar Relatório</Link></li>
        </ul>
      </nav>
    </div>
  );
};

export default Dashboard;
