import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { collection, addDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import './ManterTurma.css';

const ManterTurma = () => {
  const [nomeTurma, setNomeTurma] = useState('');
  const [turmas, setTurmas] = useState([]);

  // Carregar lista de turmas ao iniciar
  useEffect(() => {
    const carregarTurmas = async () => {
      const turmaSnapshot = await getDocs(collection(firestore, 'turmas'));
      const listaDeTurmas = turmaSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTurmas(listaDeTurmas);
    };

    carregarTurmas();
  }, []);

  // Cadastrar uma nova turma
  const handleCadastrarTurma = async () => {
    if (!nomeTurma) {
      alert('Por favor, insira o nome da turma.');
      return;
    }

    try {
      const docRef = await addDoc(collection(firestore, 'turmas'), {
        nome: nomeTurma,
        disciplinas: [], // Inicializa sem disciplinas
        alunos: [],      // Inicializa sem alunos
        professores: []  // Inicializa sem professores
      });
      setTurmas(prev => [...prev, { id: docRef.id, nome: nomeTurma }]);
      setNomeTurma('');
      alert('Turma cadastrada com sucesso!');
    } catch (e) {
      console.error('Erro ao cadastrar turma:', e);
      alert('Erro ao cadastrar turma.');
    }
  };

  // Excluir turma
  const handleExcluirTurma = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'turmas', id));
      setTurmas(prev => prev.filter(turma => turma.id !== id));
      alert('Turma excluída com sucesso!');
    } catch (e) {
      console.error('Erro ao excluir turma:', e);
      alert('Erro ao excluir turma.');
    }
  };

  return (
    <div className="manter-turma-container">
      <h2>Cadastro de Turma</h2>
      <div className="form-cadastro">
        <label>Nome da Turma</label>
        <input
          type="text"
          value={nomeTurma}
          onChange={(e) => setNomeTurma(e.target.value)}
          placeholder="Digite o nome da turma"
        />
        <button onClick={handleCadastrarTurma}>Cadastrar Turma</button>
      </div>

      <h2>Turmas Cadastradas</h2>
      <div className="lista-turmas">
        {turmas.length > 0 ? (
          turmas.map((turma) => (
            <div key={turma.id} className="turma-item">
              <span>{turma.nome}</span>
              <button onClick={() => handleExcluirTurma(turma.id)}>Excluir</button>
            </div>
          ))
        ) : (
          <p>Nenhuma turma cadastrada.</p>
        )}
      </div>
    </div>
  );
};

export default ManterTurma;
