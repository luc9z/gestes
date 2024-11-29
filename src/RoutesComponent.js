import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login/Login';
import Dashboard from './components/Dashboard/Dashboard';
import ManterProfessores from './components/Professor/ManterProfessores';  // Componente Manter Professores
import ManterAlunos from './components/Aluno/ManterAlunos';  // Componente Manter Alunos
import ManterNotas from './components/Nota/ManterNotas';  // Componente Manter Notas
import ManterTurmas from './components/Turma/ManterTurma';  // Componente Manter Turmas
import ManterDisciplinas from './components/Disciplina/ManterDisciplina.js';  // Componente Manter Disciplinas
import GerarRelatorio from './components/Relatorio/GerarRelatorio';  // Componente Gerar Relatório
import AlunosNotaIndividual from './components/Relatorio/alunosnotaindividual.js';
import Professores from './components/Relatorio/professores.js';
import Turmas from './components/Relatorio/turmas.js';

const RoutesComponent = ({ user, setUser }) => {
  return (
    <Routes>
      {!user ? (
        <Route path="/" element={<Login setUser={setUser} />} />
      ) : (
        <>
          <Route path="/" element={<Dashboard />} />
          <Route path="/manter-professores" element={<ManterProfessores />} />
          <Route path="/manter-alunos" element={<ManterAlunos />} />
          <Route path="/manter-notas" element={<ManterNotas />} />
          <Route path="/manter-turmas" element={<ManterTurmas />} />
          <Route path="/manter-disciplinas" element={<ManterDisciplinas />} />

          {/* Rotas para relatórios */}
          <Route path="/relatorios" element={<GerarRelatorio />} />
          <Route path="/relatorios/aluno" element={<AlunosNotaIndividual />} />
          <Route path="/relatorios/professor" element={<Professores />} />
          <Route path="/relatorios/turma" element={<Turmas />} />
        </>
      )}

      {/* Redireciona qualquer rota desconhecida para o login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default RoutesComponent;
