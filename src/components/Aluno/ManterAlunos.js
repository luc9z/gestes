import React, { useState, useEffect } from 'react';
import { getDocs, collection, query, where, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../firebase';
import { adicionarAluno, excluirAluno } from '../../firebase';
import './ManterAlunos.css';
import editIcon from '../../assets/edit-icon.png';
import deleteIcon from '../../assets/delete-icon.png';
import addIcon from '../../assets/add-icon.png';

const ManterAlunos = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [alunosNaTurma, setAlunosNaTurma] = useState([]);
  const [alunoParaEditar, setAlunoParaEditar] = useState(null);
  const [turmas, setTurmas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  // Carregar turmas
  useEffect(() => {
    const carregarTurmas = async () => {
      const turmaSnapshot = await getDocs(collection(firestore, 'turmas'));
      const listaDeTurmas = turmaSnapshot.docs.map((doc) => ({
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
      const alunos = alunoSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setAlunosNaTurma(alunos);
    };
    carregarAlunos();
  }, [turmaId]);

  // Cadastrar aluno
  const handleCadastro = async (e) => {
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
      setMostrarFormulario(false); // Oculta o formulário após cadastro
    } catch (error) {
      alert('Erro ao cadastrar aluno.');
    }
  };

  // Excluir aluno
  const handleExclusao = async (id) => {
    try {
      await excluirAluno(id, turmaId);
      alert('Aluno excluído com sucesso!');
      setAlunosNaTurma((prevAlunos) => prevAlunos.filter((aluno) => aluno.id !== id));
    } catch (error) {
      alert('Erro ao excluir aluno.');
    }
  };

  // Salvar edição do aluno
  const salvarEdicaoAluno = async () => {
    if (!alunoParaEditar) return;

    try {
      const alunoRef = doc(firestore, 'alunos', alunoParaEditar.id);
      await updateDoc(alunoRef, {
        nome: alunoParaEditar.nome,
        email: alunoParaEditar.email,
        turmaId: alunoParaEditar.turmaId,
      });

      alert('Aluno atualizado com sucesso!');
      setAlunoParaEditar(null);

      const alunosAtualizados = alunosNaTurma.map((aluno) =>
        aluno.id === alunoParaEditar.id ? alunoParaEditar : aluno
      );
      setAlunosNaTurma(alunosAtualizados);
    } catch (error) {
      alert('Erro ao atualizar o aluno.');
    }
  };

  return (
    <div className="manter-alunos-container">
      <h2>Gerenciar Alunos</h2>

      <div className="turma-selector">
        <label>Selecione a turma:</label>
        <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
          <option value="">Escolha uma turma</option>
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="alunos-table">
        <h3>Alunos na Turma</h3>
        <table>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {alunosNaTurma.map((aluno) => (
              <tr key={aluno.id}>
                <td>{aluno.nome}</td>
                <td>{aluno.email}</td>
                <td>
                  <button onClick={() => setAlunoParaEditar(aluno)}>
                    <img src={editIcon} alt="Editar" />
                  </button>
                  <button onClick={() => handleExclusao(aluno.id)}>
                    <img src={deleteIcon} alt="Excluir" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="add-aluno-button">
        <button onClick={() => setMostrarFormulario(!mostrarFormulario)}>
          <img src={addIcon} alt="Adicionar Aluno" />
        </button>
      </div>

      {mostrarFormulario && (
        <form onSubmit={handleCadastro} className="manter-alunos-form">
          <h3>Cadastrar Aluno</h3>
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
          <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
            <option value="">Selecione uma turma</option>
            {turmas.map((turma) => (
              <option key={turma.id} value={turma.id}>
                {turma.nome}
              </option>
            ))}
          </select>
          <button type="submit">Cadastrar</button>
        </form>
      )}

      {alunoParaEditar && (
        <div className="editar-aluno-container">
          <h3>Editar Aluno</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              salvarEdicaoAluno();
            }}
          >
            <label>
              Nome:
              <input
                type="text"
                value={alunoParaEditar.nome}
                onChange={(e) =>
                  setAlunoParaEditar({ ...alunoParaEditar, nome: e.target.value })
                }
              />
            </label>
            <label>
              Email:
              <input
                type="email"
                value={alunoParaEditar.email}
                onChange={(e) =>
                  setAlunoParaEditar({ ...alunoParaEditar, email: e.target.value })
                }
              />
            </label>
            <label>
              Turma:
              <select
                value={alunoParaEditar.turmaId}
                onChange={(e) =>
                  setAlunoParaEditar({ ...alunoParaEditar, turmaId: e.target.value })
                }
              >
                {turmas.map((turma) => (
                  <option key={turma.id} value={turma.id}>
                    {turma.nome}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">Salvar</button>
            <button type="button" onClick={() => setAlunoParaEditar(null)}>
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManterAlunos;
