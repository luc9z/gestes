import React, { useState, useEffect } from 'react';
import { adicionarAluno, excluirAluno } from '../../firebase';  // Funções importadas
import { getDocs, collection } from 'firebase/firestore';  // Para buscar turmas e alunos do Firestore
import { firestore } from '../../firebase';  // Importando a instância do Firestore
import { query, where } from 'firebase/firestore';  // Importando as funções query e where


const ManterAlunos = () => {
  const [nome, setNome] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [alunoIdExcluir, setAlunoIdExcluir] = useState('');
  const [turmas, setTurmas] = useState([]);  // Lista de turmas
  const [alunosNaTurma, setAlunosNaTurma] = useState([]);  // Alunos da turma selecionada

  useEffect(() => {
    // Função para carregar turmas do Firestore
    const carregarTurmas = async () => {
      const turmaSnapshot = await getDocs(collection(firestore, 'turmas'));
      const listaDeTurmas = turmaSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome
      }));
      setTurmas(listaDeTurmas);
    };

    carregarTurmas();
  }, []);

  useEffect(() => {
    // Função para carregar alunos da turma selecionada
    const carregarAlunos = async () => {
      if (!turmaId) return;  // Só carrega alunos se uma turma for selecionada

      const turmaRef = collection(firestore, 'turmas');
      const turmaSnapshot = await getDocs(turmaRef);
      const turma = turmaSnapshot.docs.find(doc => doc.id === turmaId);
      
      if (turma) {
        const alunos = turma.data().alunos || [];
        // Carregar os dados completos dos alunos (nome, id, etc.)
        const alunosComNome = await Promise.all(
          alunos.map(async (alunoId) => {
            const alunoRef = collection(firestore, 'alunos');
            const alunoSnapshot = await getDocs(query(alunoRef, where("id", "==", alunoId)));
            return alunoSnapshot.empty ? null : alunoSnapshot.docs[0].data();
          })
        );
        setAlunosNaTurma(alunosComNome.filter(aluno => aluno));  // Remove nulls
      }
    };

    carregarAlunos();
  }, [turmaId]);

  const handleCadastro = async (e) => {
    e.preventDefault();
    try {
      await adicionarAluno(nome, turmaId);
      alert("Aluno adicionado com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar aluno.");
    }
  };

  const handleExclusao = async (e) => {
    e.preventDefault();
    try {
      await excluirAluno(alunoIdExcluir, turmaId);
      alert("Aluno excluído com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao excluir aluno.");
    }
  };

  return (
    <div>
      <h2>Manter Alunos</h2>
      
      {/* Formulário de Cadastro de Aluno */}
      <form onSubmit={handleCadastro}>
        <h3>Cadastro de Aluno</h3>
        <input type="text" placeholder="Nome" value={nome} onChange={(e) => setNome(e.target.value)} />
        
        {/* Select para selecionar a turma */}
        <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
          <option value="">Selecione uma turma</option>
          {turmas.map(turma => (
            <option key={turma.id} value={turma.id}>{turma.nome}</option>
          ))}
        </select>

        <button type="submit">Cadastrar Aluno</button>
      </form>

      {/* Formulário de Exclusão de Aluno */}
      <form onSubmit={handleExclusao}>
        <h3>Excluir Aluno</h3>
        {/* Select para selecionar a turma */}
        <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
          <option value="">Selecione uma turma</option>
          {turmas.map(turma => (
            <option key={turma.id} value={turma.id}>{turma.nome}</option>
          ))}
        </select>
        
        {/* Select para selecionar o aluno dentro da turma */}
        {turmaId && alunosNaTurma.length > 0 && (
          <select value={alunoIdExcluir} onChange={(e) => setAlunoIdExcluir(e.target.value)}>
            <option value="">Selecione um aluno</option>
            {alunosNaTurma.map(aluno => (
              <option key={aluno.id} value={aluno.id}>{aluno.nome}</option> 
            ))}
          </select>
        )}
        
        <button type="submit">Excluir Aluno</button>
      </form>
    </div>
  );
};

export default ManterAlunos;
