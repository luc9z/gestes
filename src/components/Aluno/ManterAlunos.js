import React, { useState, useEffect } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { adicionarAluno, excluirAluno } from '../../firebase';
import './ManterAlunos.css';

const ManterAlunos = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [alunoIdExcluir, setAlunoIdExcluir] = useState('');
  const [turmas, setTurmas] = useState([]);
  const [alunosNaTurma, setAlunosNaTurma] = useState([]);

  // Carregar turmas
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

  // Carregar alunos na turma selecionada
  useEffect(() => {
    const carregarAlunos = async () => {
      if (!turmaId) {
        setAlunosNaTurma([]);
        return;
      }

      const alunosRef = collection(firestore, 'alunos');
      const q = query(alunosRef, where('turmaId', '==', turmaId));
      const alunoSnapshot = await getDocs(q);
      const alunos = alunoSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAlunosNaTurma(alunos);
    };
    carregarAlunos();
  }, [turmaId]);

  // Cadastrar aluno
  const handleCadastro = async e => {
    e.preventDefault();
    if (!nome || !email || !turmaId) {
      alert('Todos os campos são obrigatórios.');
      return;
    }
    try {
      await adicionarAluno(nome, email, turmaId);
      alert('Aluno cadastrado com sucesso!');
      setNome('');
      setEmail('');
      setTurmaId('');
    } catch (error) {
      alert('Erro ao cadastrar aluno.');
    }
  };

  // Excluir aluno
  const handleExclusao = async e => {
    e.preventDefault();
    if (!alunoIdExcluir || !turmaId) {
      alert('Selecione um aluno e uma turma.');
      return;
    }
    try {
      await excluirAluno(alunoIdExcluir, turmaId);
      alert('Aluno excluído com sucesso!');
      setAlunoIdExcluir('');
      // Atualizar a lista de alunos após exclusão
      setAlunosNaTurma(prevAlunos => prevAlunos.filter(aluno => aluno.id !== alunoIdExcluir));
    } catch (error) {
      alert('Erro ao excluir aluno.');
    }
  };

  return (
    <div className="manter-alunos-container">
      <h2>Manter Alunos</h2>

      <form onSubmit={handleCadastro} className="manter-alunos-form">
        <h3>Cadastrar Aluno</h3>
        <input
          type="text"
          placeholder="Nome"
          value={nome}
          onChange={e => setNome(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <select value={turmaId} onChange={e => setTurmaId(e.target.value)}>
          <option value="">Selecione uma turma</option>
          {turmas.map(turma => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>
        <button type="submit">Cadastrar</button>
      </form>

      <form onSubmit={handleExclusao} className="manter-alunos-form">
        <h3>Excluir Aluno</h3>
        <select value={turmaId} onChange={e => setTurmaId(e.target.value)}>
          <option value="">Selecione uma turma</option>
          {turmas.map(turma => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>
        {turmaId && (
          <select value={alunoIdExcluir} onChange={e => setAlunoIdExcluir(e.target.value)}>
            <option value="">Selecione um aluno</option>
            {alunosNaTurma.map(aluno => (
              <option key={aluno.id} value={aluno.id}>
                {aluno.nome}
              </option>
            ))}
          </select>
        )}
        <button type="submit">Excluir</button>
      </form>
    </div>
  );
};

export default ManterAlunos;
