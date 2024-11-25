import React, { useState, useEffect } from 'react';
import { adicionarProfessor, excluirProfessor, atualizarProfessor } from '../../firebase';
import { getDocs, collection } from 'firebase/firestore';
import { firestore } from '../../firebase'; // Importando o firestore para buscar as turmas e professores

const ManterProfessores = () => {
  const [nome, setNome] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [novosDados, setNovosDados] = useState({ nome: '', turmaId: '' });
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  // Função para buscar turmas
  const fetchTurmas = async () => {
    const turmasSnapshot = await getDocs(collection(firestore, 'turmas'));
    const turmasData = turmasSnapshot.docs.map(doc => ({
      id: doc.id,
      nome: doc.data().nome,
    }));
    setTurmas(turmasData);
  };

  // Função para buscar professores
  const fetchProfessores = async () => {
    const professoresSnapshot = await getDocs(collection(firestore, 'professores'));
    const professoresData = professoresSnapshot.docs.map(doc => ({
      id: doc.id,
      nome: doc.data().nome,
    }));
    setProfessores(professoresData);
  };

  useEffect(() => {
    fetchTurmas();
    fetchProfessores();
  }, []);

  const handleCadastro = async () => {
    if (!nome || !turmaId) {
      setErrorMessage("Nome do professor e turma são obrigatórios.");
      return;
    }

    await adicionarProfessor(nome, turmaId);
    setNome('');
    setTurmaId('');
    setErrorMessage('');
  };

  const handleExclusao = async () => {
    if (!professorId || !turmaId) {
      setErrorMessage("Selecione o professor e a turma.");
      return;
    }

    await excluirProfessor(professorId, turmaId);
    setProfessorId('');
    setTurmaId('');
    setErrorMessage('');
  };

  const handleAtualizacao = async () => {
    if (!professorId || !novosDados.turmaId) {
      setErrorMessage("Selecione o professor e a nova turma.");
      return;
    }

    await atualizarProfessor(professorId, novosDados);
    setProfessorId('');
    setNovosDados({ nome: '', turmaId: '' });
    setErrorMessage('');
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
