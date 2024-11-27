import React, { useState, useEffect } from 'react';
import { adicionarProfessor, excluirProfessor, atualizarProfessor } from '../../firebase';
import { firestore } from '../../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import './ManterProfessores.css';
import addIcon from '../../assets/add-icon.png';
import editIcon from '../../assets/edit-icon.png';
import deleteIcon from '../../assets/delete-icon.png';

const ManterProfessores = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [turmaId, setTurmaId] = useState(''); // Controlando a turma
  const [professores, setProfessores] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [professorParaEditar, setProfessorParaEditar] = useState(null);
  const [formVisivel, setFormVisivel] = useState(false);
  const [filtroTurma, setFiltroTurma] = useState('');

  // Carrega turmas e professores
  useEffect(() => {
    const unsubscribeTurmas = onSnapshot(collection(firestore, 'turmas'), (snapshot) => {
      const turmasData = snapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setTurmas(turmasData);
    });

    const unsubscribeProfessores = onSnapshot(collection(firestore, 'professores'), (snapshot) => {
      const professoresData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProfessores(professoresData);
    });

    return () => {
      unsubscribeTurmas();
      unsubscribeProfessores();
    };
  }, []);

  // Adicionar professor ao Firestore
  const handleAdicionarProfessor = async (e) => {
    e.preventDefault();
    if (!nome || !email || !turmaId) {
      alert('Preencha todos os campos!');
      return;
    }

    try {
      await adicionarProfessor(nome, email, turmaId);  // Incluindo turmaId ao adicionar
      setNome('');
      setEmail('');
      setTurmaId(''); // Resetando turmaId após o cadastro
      setFormVisivel(false);
    } catch (error) {
      alert('Erro ao adicionar professor.');
    }
  };

  // Excluir professor
  const handleExcluirProfessor = async (id) => {
    try {
      await excluirProfessor(id);
    } catch (error) {
      alert('Erro ao excluir professor.');
    }
  };

  // Editar professor
  const handleEditarProfessor = (professor) => {
    setProfessorParaEditar(professor);
    setTurmaId(professor.turmaId); // Setando a turma do professor ao editar
  };

  // Salvar edições no professor
  const salvarEdicao = async () => {
    if (!professorParaEditar) return;

    // Atualizando a turma do professor para a turmaId selecionada
    const dadosAtualizados = {
      nome: professorParaEditar.nome,
      email: professorParaEditar.email,
      turmaId: turmaId,  // Incluindo a turmaId no objeto de atualização
    };

    try {
      await atualizarProfessor(professorParaEditar.id, dadosAtualizados);
      setProfessorParaEditar(null);
      setTurmaId(''); // Resetando a turma após editar
    } catch (error) {
      alert('Erro ao atualizar professor.');
    }
  };

  // Filtra os professores conforme a turma selecionada
  const professoresFiltrados = filtroTurma
    ? professores.filter((professor) => professor.turmaId === filtroTurma)
    : professores;

  return (
    <div className="manter-professores-container">
      <h2>Manter Professores</h2>
      <div className="filtro-turma">
        <label htmlFor="turma">Selecione uma turma:</label>
        <select
          id="turma"
          value={filtroTurma}
          onChange={(e) => setFiltroTurma(e.target.value)}
        >
          <option value="">Todas as turmas</option>
          {turmas.map((turma) => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>
      </div>

      <h3>Professores na Turma</h3>
      <table className="professores-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {professoresFiltrados.map((professor) => (
            <tr key={professor.id}>
              <td>{professor.nome}</td>
              <td>{professor.email}</td>
              <td>
                <button onClick={() => handleEditarProfessor(professor)}>
                  <img src={editIcon} alt="Editar" />
                </button>
                <button onClick={() => handleExcluirProfessor(professor.id)}>
                  <img src={deleteIcon} alt="Excluir" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="adicionar-professor">
        <button className="add-button" onClick={() => setFormVisivel(!formVisivel)}>
          <img src={addIcon} alt="Adicionar" />
        </button>
      </div>

      {formVisivel && (
        <div className="form-adicionar">
          <h3>Adicionar Professor</h3>
          <form onSubmit={handleAdicionarProfessor}>
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
            <select
              value={turmaId}
              onChange={(e) => setTurmaId(e.target.value)}
            >
              <option value="">Selecione uma turma</option>
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome}
                </option>
              ))}
            </select>
            <button type="submit">Adicionar</button>
          </form>
        </div>
      )}

      {professorParaEditar && (
        <div className="editar-professor">
          <h3>Editar Professor</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              salvarEdicao();
            }}
          >
            <input
              type="text"
              value={professorParaEditar.nome}
              onChange={(e) =>
                setProfessorParaEditar({ ...professorParaEditar, nome: e.target.value })
              }
            />
            <input
              type="email"
              value={professorParaEditar.email}
              onChange={(e) =>
                setProfessorParaEditar({ ...professorParaEditar, email: e.target.value })
              }
            />
            <select
              value={turmaId} // Mudando para o valor atual de turmaId ao editar
              onChange={(e) => {
                setTurmaId(e.target.value); // Atualizando o estado de turmaId
                setProfessorParaEditar({
                  ...professorParaEditar,
                  turmaId: e.target.value,  // Atualizando também o turmaId no estado do professor
                });
              }}
            >
              {turmas.map((turma) => (
                <option key={turma.id} value={turma.id}>
                  {turma.nome}
                </option>
              ))}
            </select>
            <button type="submit">Salvar</button>
            <button type="button" onClick={() => setProfessorParaEditar(null)}>
              Cancelar
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManterProfessores;
