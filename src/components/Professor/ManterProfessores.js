import React, { useState, useEffect } from 'react';
import { adicionarProfessor, excluirProfessor, atualizarProfessor } from '../../firebase';
import { firestore } from '../../firebase'; // Importando o firestore para buscar as turmas e professores
import { collection, onSnapshot } from 'firebase/firestore';

const ManterProfessores = () => {
  const [nome, setNome] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [novosDados, setNovosDados] = useState({ nome: '', turmaId: '' });
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Função para buscar turmas em tempo real
  useEffect(() => {
    const turmasRef = collection(firestore, 'turmas');
    const unsubscribeTurmas = onSnapshot(turmasRef, (snapshot) => {
      const turmasData = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setTurmas(turmasData);
    });

    // Função para buscar professores em tempo real
    const professoresRef = collection(firestore, 'professores');
    const unsubscribeProfessores = onSnapshot(professoresRef, (snapshot) => {
      const professoresData = snapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setProfessores(professoresData);
    });

    // Limpar os listeners quando o componente for desmontado
    return () => {
      unsubscribeTurmas();
      unsubscribeProfessores();
    };
  }, []);

  const handleCadastro = async () => {
    if (!nome || !turmaId) {
      setErrorMessage("Nome do professor e turma são obrigatórios.");
      return;
    }

    try {
      await adicionarProfessor(nome, turmaId);
      setNome('');
      setTurmaId('');
      setErrorMessage('');
    } catch (e) {
      setErrorMessage("Erro ao adicionar professor.");
    }
  };

  const handleExclusao = async () => {
    if (!professorId || !turmaId) {
      setErrorMessage("Selecione o professor e a turma.");
      return;
    }

    try {
      await excluirProfessor(professorId, turmaId);
      setProfessorId('');
      setTurmaId('');
      setErrorMessage('');
    } catch (e) {
      setErrorMessage("Erro ao excluir professor.");
    }
  };

  const handleAtualizacao = async () => {
    if (!professorId || !novosDados.turmaId) {
      setErrorMessage("Selecione o professor e a nova turma.");
      return;
    }

    try {
      await atualizarProfessor(professorId, novosDados);
      setProfessorId('');
      setNovosDados({ nome: '', turmaId: '' });
      setErrorMessage('');
    } catch (e) {
      setErrorMessage("Erro ao atualizar professor.");
    }
  };

  return (
    <div>
      <h2>Cadastro de Professor</h2>
      <div>
        <input 
          type="text" 
          placeholder="Nome do Professor" 
          value={nome} 
          onChange={(e) => setNome(e.target.value)} 
        />
        <select 
          value={turmaId} 
          onChange={(e) => setTurmaId(e.target.value)} 
        >
          <option value="">Selecione uma turma</option>
          {turmas.map(turma => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>
        <button onClick={handleCadastro}>Cadastrar Professor</button>
      </div>

      <h2>Excluir Professor</h2>
      <div>
        <select 
          value={professorId} 
          onChange={(e) => setProfessorId(e.target.value)} 
        >
          <option value="">Selecione um professor</option>
          {professores.map(professor => (
            <option key={professor.id} value={professor.id}>
              {professor.nome}
            </option>
          ))}
        </select>
        <select 
          value={turmaId} 
          onChange={(e) => setTurmaId(e.target.value)} 
        >
          <option value="">Selecione uma turma</option>
          {turmas.map(turma => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>
        <button onClick={handleExclusao}>Excluir Professor</button>
      </div>

      <h2>Atualizar Professor</h2>
      <div>
        <select 
          value={professorId} 
          onChange={(e) => setProfessorId(e.target.value)} 
        >
          <option value="">Selecione um professor</option>
          {professores.map(professor => (
            <option key={professor.id} value={professor.id}>
              {professor.nome}
            </option>
          ))}
        </select>
        <select 
          value={novosDados.turmaId} 
          onChange={(e) => setNovosDados({ ...novosDados, turmaId: e.target.value })} 
        >
          <option value="">Selecione a nova turma</option>
          {turmas.map(turma => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>
        <button onClick={handleAtualizacao}>Atualizar Professor</button>
      </div>

      {/* Exibindo a mensagem de erro */}
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
    </div>
  );
};

export default ManterProfessores;
