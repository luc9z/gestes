import React, { useState, useEffect } from 'react';
import { adicionarDisciplina, excluirDisciplina, atualizarDisciplina } from '../../firebase';
import { getDocs, collection } from 'firebase/firestore';
import { firestore } from '../../firebase'; // Importando o firestore

const ManterDisciplina = () => {
  const [nomeDisciplina, setNomeDisciplina] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [disciplinaId, setDisciplinaId] = useState('');
  const [novosDados, setNovosDados] = useState({ turmaId: '', professorId: '' });
  const [turmas, setTurmas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
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

  // Função para buscar disciplinas
  const fetchDisciplinas = async () => {
    const disciplinasSnapshot = await getDocs(collection(firestore, 'disciplinas'));
    const disciplinasData = disciplinasSnapshot.docs.map(doc => ({
      id: doc.id,
      nome: doc.data().nome,
    }));
    setDisciplinas(disciplinasData);
  };

  useEffect(() => {
    fetchTurmas();
    fetchProfessores();
    fetchDisciplinas();
  }, []);

  const handleCadastro = async () => {
    if (!nomeDisciplina || !turmaId || !professorId) {
      setErrorMessage('Todos os campos são obrigatórios.');
      return;
    }

    try {
      await adicionarDisciplina(nomeDisciplina, turmaId);
      setNomeDisciplina('');
      setTurmaId('');
      setProfessorId('');
      setErrorMessage('');
    } catch (e) {
      setErrorMessage('Erro ao cadastrar disciplina.');
    }
  };

  const handleExclusao = async () => {
    if (!disciplinaId) {
      setErrorMessage('Selecione uma disciplina.');
      return;
    }

    try {
      await excluirDisciplina(disciplinaId, turmaId);
      setDisciplinaId('');
      setErrorMessage('');
      fetchDisciplinas(); // Atualiza a lista de disciplinas
    } catch (e) {
      setErrorMessage('Erro ao excluir disciplina.');
    }
  };

  const handleAtualizacao = async () => {
    if (!disciplinaId || !novosDados.turmaId || !novosDados.professorId) {
      setErrorMessage('Todos os campos são obrigatórios.');
      return;
    }

    try {
      await atualizarDisciplina(disciplinaId, novosDados);
      setDisciplinaId('');
      setNovosDados({ turmaId: '', professorId: '' });
      setErrorMessage('');
      fetchDisciplinas(); // Atualiza a lista de disciplinas
    } catch (e) {
      setErrorMessage('Erro ao atualizar disciplina.');
    }
  };

  return (
    <div className="manter-disciplina-container">
    <h2>Cadastro de Disciplina</h2>
    <div className="form-group">
      <input
        type="text"
        placeholder="Nome da Disciplina"
        value={nomeDisciplina}
        onChange={(e) => setNomeDisciplina(e.target.value)}
      />
      <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
        <option value="">Selecione uma turma</option>
        {turmas.map(turma => (
          <option key={turma.id} value={turma.id}>
            {turma.nome}
          </option>
        ))}
      </select>
      <select value={professorId} onChange={(e) => setProfessorId(e.target.value)}>
        <option value="">Selecione um professor</option>
        {professores.map(professor => (
          <option key={professor.id} value={professor.id}>
            {professor.nome}
          </option>
        ))}
      </select>
      <button onClick={handleCadastro}>Cadastrar Disciplina</button>
    </div>
  
    <h2>Excluir Disciplina</h2>
    <div className="form-group">
      <select value={disciplinaId} onChange={(e) => setDisciplinaId(e.target.value)}>
        <option value="">Selecione uma disciplina</option>
        {disciplinas.map(disciplina => (
          <option key={disciplina.id} value={disciplina.id}>
            {disciplina.nome}
          </option>
        ))}
      </select>
      <button onClick={handleExclusao}>Excluir Disciplina</button>
    </div>
  
    <h2>Atualizar Disciplina</h2>
    <div className="form-group">
      <select value={disciplinaId} onChange={(e) => setDisciplinaId(e.target.value)}>
        <option value="">Selecione uma disciplina</option>
        {disciplinas.map(disciplina => (
          <option key={disciplina.id} value={disciplina.id}>
            {disciplina.nome}
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
      <select
        value={novosDados.professorId}
        onChange={(e) => setNovosDados({ ...novosDados, professorId: e.target.value })}
      >
        <option value="">Selecione o novo professor</option>
        {professores.map(professor => (
          <option key={professor.id} value={professor.id}>
            {professor.nome}
          </option>
        ))}
      </select>
      <button onClick={handleAtualizacao}>Atualizar Disciplina</button>
    </div>
  
    {errorMessage && <div className="error-message">{errorMessage}</div>}
  </div>  
  );
};

export default ManterDisciplina;
