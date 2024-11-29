import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { firestore } from '../../firebase';
import { collection, getDocs } from 'firebase/firestore';
import './Dashboard.css';

const Dashboard = () => {
  const [turmas, setTurmas] = useState([]);
  const [selectedTurma, setSelectedTurma] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const carregarTurmas = async () => {
      const turmaSnapshot = await getDocs(collection(firestore, 'turmas'));
      const listaDeTurmas = turmaSnapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setTurmas(listaDeTurmas);
    };
    carregarTurmas();
  }, []);

  const voltarParaSelecao = () => {
    setSelectedTurma(null);
  };

  return (
    <div className="dashboard-container">
      {/* Barra lateral */}
      <nav className={`sidebar-menu ${menuOpen ? 'open' : ''}`}>
        <button
          className="menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menu"
        >
          ☰
        </button>
        {menuOpen && (
          <div className="menu-content">
            <ul>
              {/* Links para as páginas principais */}
              <li>
                <Link to="/manter-professores">Manter Professores</Link>
              </li>
              <li>
                <Link to="/manter-alunos">Manter Alunos</Link>
              </li>
              <li>
                <Link to="/manter-notas">Manter Notas</Link>
              </li>
              <li>
                <Link to="/manter-turmas">Manter Turmas</Link>
              </li>
              <li>
                <Link to="/manter-disciplinas">Manter Disciplinas</Link>
              </li>
              {/* Links para os relatórios */}
              <li>
                <Link to="/relatorios">Relatórios</Link>
              </li>
            </ul>
          </div>
        )}
      </nav>

      {/* Conteúdo principal */}
      <main className={menuOpen ? 'shrink' : ''}>
        {/* Seleção da turma fora da barra lateral */}
        <div className="turma-selection">
          <h2>Selecione a turma</h2>
          <select
            onChange={(e) =>
              setSelectedTurma(turmas.find((turma) => turma.id === e.target.value))
            }
            className="turma-dropdown"
            value={selectedTurma ? selectedTurma.id : ''}
          >
            <option value="">Escolha uma turma</option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Conteúdo para quando a turma é selecionada */}
        {!selectedTurma ? (
          <div className="turma-selector">
            <h2>Selecione uma turma no menu acima</h2>
          </div>
        ) : (
          <div className="turma-dashboard">
            <h2>{selectedTurma.nome}</h2>
            <div className="options-container">
              {/* Links para as páginas de alunos, professores, etc. */}
              <Link to="/manter-alunos">
                <button>Alunos</button>
              </Link>
              <Link to="/manter-professores">
                <button>Professores</button>
              </Link>
              <Link to="/manter-disciplinas">
                <button>Disciplinas</button>
              </Link>
              <Link to="/manter-notas">
                <button>Notas</button>
              </Link>
            </div>

            {/* Links para os relatórios */}
            <div className="relatorios-container">
              <h3>Relatórios:</h3>
              <Link to="/relatorios/aluno">
                <button>Relatório de Alunos</button>
              </Link>
              <Link to="/relatorios/professor">
                <button>Relatório de Professores</button>
              </Link>
              <Link to="/relatorios/turma">
                <button>Relatório de Turmas</button>
              </Link>
            </div>

            <button className="back-btn" onClick={voltarParaSelecao}>
              Voltar
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
