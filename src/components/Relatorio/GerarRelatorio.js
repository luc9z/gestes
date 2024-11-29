// GerarRelatorio.js
import React from 'react';
import { Link } from 'react-router-dom';

const GerarRelatorio = () => {
  return (
    <div>
      <h2>Escolha o Relatório para Gerar</h2>
      <div>
        <Link to="/relatorios/aluno">
          <button>Relatório de Notas do Aluno</button>
        </Link>
      </div>
      <div>
        <Link to="/relatorios/professor">
          <button>Relatório de Professores</button>
        </Link>
      </div>
      <div>
        <Link to="/relatorios/turma">
          <button>Relatório de Turma</button>
        </Link>
      </div>
    </div>
  );
};

export default GerarRelatorio;
