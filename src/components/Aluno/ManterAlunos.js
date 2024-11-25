import React, { useState, useEffect } from 'react';
import { getDocs, collection, query, where } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { adicionarAluno, excluirAluno } from '../../firebase';


const ManterAlunos = () => {
  const [nome, setNome] = useState(''); // Nome do aluno
  const [email, setEmail] = useState(''); // Email do aluno
  const [turmaId, setTurmaId] = useState('');  // ID da turma
  const [alunoIdExcluir, setAlunoIdExcluir] = useState('');  // ID do aluno a ser excluído
  const [turmas, setTurmas] = useState([]);  // Lista de turmas
  const [alunosNaTurma, setAlunosNaTurma] = useState([]);  // Alunos da turma selecionada

  // Função para carregar turmas do Firestore
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

  // Função para carregar alunos da turma selecionada
  useEffect(() => {
    const carregarAlunos = async () => {
      if (!turmaId) return;  // Só carrega alunos se uma turma for selecionada

      console.log("Turma selecionada:", turmaId);  // Verifica se o ID da turma está sendo recebido corretamente

      // Query para filtrar os alunos que pertencem à turma selecionada
      const alunosRef = collection(firestore, 'alunos');
      const q = query(alunosRef, where("turmaId", "==", turmaId));
      const alunoSnapshot = await getDocs(q);

      if (!alunoSnapshot.empty) {
        const alunos = alunoSnapshot.docs.map(doc => doc.data());
        setAlunosNaTurma(alunos);  // Atualiza o estado com os alunos encontrados
        console.log("Alunos encontrados:", alunos);  // Verifica se os alunos estão sendo encontrados corretamente
      } else {
        console.log("Nenhum aluno encontrado para esta turma.");
        setAlunosNaTurma([]);  // Caso não haja alunos, limpa a lista
      }
    };

    carregarAlunos();
  }, [turmaId]);

  // Função de cadastro de aluno
  const handleCadastro = async (e) => {
    e.preventDefault();
    if (!nome || !email || !turmaId) {
      alert("Nome, email e turma são obrigatórios.");
      return;
    }
    try {
      // A função adicionarAluno precisa ser implementada corretamente no Firebase
      await adicionarAluno(nome, email, turmaId);
      alert("Aluno adicionado com sucesso!");
      setNome('');
      setEmail('');
      setTurmaId('');
    } catch (error) {
      console.error(error);
      alert("Erro ao adicionar aluno.");
    }
  };

  // Função de exclusão de aluno
  const handleExclusao = async (e) => {
    e.preventDefault();
    try {
      // Excluir o aluno selecionado
      await excluirAluno(alunoIdExcluir, turmaId);
      alert("Aluno excluído com sucesso!");
      setAlunoIdExcluir('');
      setTurmaId('');
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
          <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
          />

          <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
          />

          {/* Select para selecionar a turma */}
          <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
            <option value="">Selecione uma turma</option>
            {turmas.map((turma) => (
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
            {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>{turma.nome}</option>
            ))}
          </select>

          {/* Select para selecionar o aluno dentro da turma */}
          {turmaId && alunosNaTurma.length > 0 && (
              <select value={alunoIdExcluir} onChange={(e) => setAlunoIdExcluir(e.target.value)}>
                <option value="">Selecione um aluno</option>
                {alunosNaTurma.map((aluno) => (
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
