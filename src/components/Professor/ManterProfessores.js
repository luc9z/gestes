import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc, onSnapshot } from 'firebase/firestore';
import './ManterProfessores.css';
import addIcon from '../../assets/add-icon.png';
import editIcon from '../../assets/edit-icon.png';
import deleteIcon from '../../assets/delete-icon.png';

const ManterProfessores = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [professorParaEditar, setProfessorParaEditar] = useState(null);
  const [formVisivel, setFormVisivel] = useState(false);
  const [filtroTurma, setFiltroTurma] = useState('');

  // Carregar turmas, disciplinas e professores
  useEffect(() => {
    const fetchData = async () => {
      // Carregar turmas
      const turmaSnapshot = await getDocs(collection(firestore, 'turmas'));
      setTurmas(turmaSnapshot.docs.map((doc) => ({ id: doc.id, nome: doc.data().nome })));

      // Carregar professores com o `onSnapshot` para atualizar em tempo real
      const unsubscribeProfessores = onSnapshot(collection(firestore, 'professores'), (snapshot) => {
        const professoresData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setProfessores(professoresData);
      });

      // Carregar disciplinas
      const disciplinaSnapshot = await getDocs(collection(firestore, 'disciplinas'));
      setDisciplinas(disciplinaSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));

      return () => {
        unsubscribeProfessores();
      };
    };

    fetchData();
  }, []);

  // Carregar disciplinas da turma selecionada
  useEffect(() => {
    const carregarDisciplinas = async () => {
      if (!turmaId) return;

      const disciplinaSnapshot = await getDocs(collection(firestore, 'disciplinas'));
      const disciplinasFiltradas = disciplinaSnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((disciplina) => disciplina.turmaId === turmaId); // Filtra as disciplinas pela turma selecionada

      setDisciplinas(disciplinasFiltradas);
    };

    carregarDisciplinas();
  }, [turmaId]);

  // Adicionar professor ao Firestore
  const handleAdicionarProfessor = async (e) => {
    e.preventDefault();
    if (!nome || !email || !turmaId || !professorId) {
      alert('Preencha todos os campos!');
      return;
    }

    try {
      // Adicionar ao Firestore
      const newProfessor = {
        nome,
        email,
        turmaId,
        disciplinaId: professorId,
      };
      await addDoc(collection(firestore, 'professores'), newProfessor);

      // Resetando os campos após adicionar
      setNome('');
      setEmail('');
      setProfessorId('');
      setTurmaId('');
      setFormVisivel(false);
    } catch (error) {
      alert('Erro ao adicionar professor.');
    }
  };

  // Excluir professor
  const handleExcluirProfessor = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'professores', id));
    } catch (error) {
      alert('Erro ao excluir professor.');
    }
  };

  // Editar professor
  const handleEditarProfessor = (professor) => {
    setProfessorParaEditar(professor);
    setNome(professor.nome);
    setEmail(professor.email);
    setTurmaId(professor.turmaId);
    setProfessorId(professor.disciplinaId);
    setFormVisivel(true);
  };

  // Salvar edições no professor
  const salvarEdicao = async () => {
    if (!professorParaEditar) return;

    try {
      const professorRef = doc(firestore, 'professores', professorParaEditar.id);
      await updateDoc(professorRef, {
        nome,
        email,
        turmaId,
        disciplinaId: professorId,
      });

      setProfessorParaEditar(null);
      setTurmaId('');
      setProfessorId('');
      setFormVisivel(false);
    } catch (error) {
      alert('Erro ao atualizar professor.');
    }
  };

  return (
      <div className="manter-professores-container">
        <h2>Manter Professores</h2>

        <div className="filtro-turma">
          <label htmlFor="turma">Selecione uma turma:</label>
          <select
              id="turma"
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
        </div>


        <h3>Professores na Turma</h3>
        <table className="professores-table">
          <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Disciplina</th>
            <th>Ações</th>
          </tr>
          </thead>
          <tbody>
          {professores
              .filter((professor) => professor.turmaId === turmaId)
              .map((professor) => (
                  <tr key={professor.id}>
                    <td>{professor.nome}</td>
                    <td>{professor.email}</td>
                    <td>
                      {disciplinas.find(
                          (disciplina) => disciplina.id === professor.disciplinaId
                      )?.nome || 'N/A'}
                    </td>
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
              <h3>{professorParaEditar ? 'Editar Professor' : 'Adicionar Professor'}</h3>
              <form onSubmit={professorParaEditar ? salvarEdicao : handleAdicionarProfessor}>
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
                <select
                    value={professorId}
                    onChange={(e) => setProfessorId(e.target.value)}
                >
                  <option value="">Selecione uma disciplina</option>
                  {disciplinas
                      .filter((disciplina) => disciplina.turmaId === turmaId)
                      .map((disciplina) => (
                          <option key={disciplina.id} value={disciplina.id}>
                            {disciplina.nome}
                          </option>
                      ))}
                </select>
                <button type="submit">
                  {professorParaEditar ? 'Salvar Alterações' : 'Adicionar'}
                </button>
                <button type="button" onClick={() => setFormVisivel(false)}>
                  Cancelar
                </button>
              </form>
            </div>
        )}
      </div>
  );
};

export default ManterProfessores;
