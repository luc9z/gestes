import React, { useState } from 'react';
import { adicionarTurma } from '../../firebase';

const ManterTurma = () => {
  const [nomeTurma, setNomeTurma] = useState("");

  const handleCadastrarTurma = async () => {
    if (!nomeTurma) {
      alert("Por favor, insira o nome da turma.");
      return;
    }

    try {
      await adicionarTurma(nomeTurma);
      alert("Turma cadastrada com sucesso!");
    } catch (e) {
      console.error("Erro ao cadastrar turma:", e);
      alert("Erro ao cadastrar turma.");
    }
  };

  return (
    <div>
      <h2>Cadastro de Turma</h2>
      <div>
        <label>Nome da Turma</label>
        <input
          type="text"
          value={nomeTurma}
          onChange={(e) => setNomeTurma(e.target.value)}
          placeholder="Digite o nome da turma"
        />
      </div>
      <button onClick={handleCadastrarTurma}>Cadastrar Turma</button>
    </div>
  );
};

export default ManterTurma;
