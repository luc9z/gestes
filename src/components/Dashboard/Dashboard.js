import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { firestore } from '../../firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import './Dashboard.css';

const Dashboard = () => {
  const [turmas, setTurmas] = useState([]);
  const [detalhesTurma, setDetalhesTurma] = useState(null);

  useEffect(() => {
    const carregarTurmas = async () => {
      const turmaSnapshot = await getDocs(collection(firestore, 'turmas'));
      const listaDeTurmas = turmaSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setTurmas(listaDeTurmas);
    };
    carregarTurmas();
  }, []);

  const exibirDetalhesTurma = async (turmaId) => {
    const turmaRef = doc(firestore, 'turmas', turmaId);
    const turmaSnapshot = await getDoc(turmaRef);
    if (turmaSnapshot.exists()) {
      setDetalhesTurma({ id: turmaId, ...turmaSnapshot.data() });
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Dashboard</h1>
      <nav className="dashboard-nav">
        <ul>
          <li><Link to="/manter-professores">Manter Professores</Link></li>
          <li><Link to="/manter-alunos">Manter Alunos</Link></li>
          <li><Link to="/manter-notas">Manter Notas</Link></li>
          <li><Link to="/manter-turmas">Manter Turmas</Link></li>
          <li><Link to="/manter-disciplinas">Manter Disciplinas</Link></li>
          <li><Link to="/gerar-relatorio">Gerar Relatório</Link></li>
        </ul>
      </nav>

      <div className="turmas-container">
        <h2>Turmas</h2>
        {turmas.map(turma => (
          <div key={turma.id} className="turma-card" onClick={() => exibirDetalhesTurma(turma.id)}>
            <h3>{turma.nome}</h3>
          </div>
        ))}
      </div>

      {detalhesTurma && (
        <div className="detalhes-turma">
          <h2>Detalhes da Turma: {detalhesTurma.nome}</h2>
          <h3>Alunos</h3>
          <ul>
            {detalhesTurma.alunos?.map(alunoId => (
              <li key={alunoId}>{alunoId}</li>
            ))}
          </ul>
          <h3>Disciplinas</h3>
          <ul>
            {detalhesTurma.disciplinas?.map(disciplinaId => (
              <li key={disciplinaId}>{disciplinaId}</li>
            ))}
          </ul>
          <h3>Professores</h3>
          <ul>
            {detalhesTurma.professores?.map(professorId => (
              <li key={professorId}>{professorId}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
