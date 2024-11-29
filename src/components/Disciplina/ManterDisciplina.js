import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import './ManterDisciplina.css';
import addIcon from '../../assets/add-icon.png';
import editIcon from '../../assets/edit-icon.png';
import deleteIcon from '../../assets/delete-icon.png';

const ManterDisciplinas = () => {
  const [disciplinas, setDisciplinas] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nome, setNome] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [disciplinaParaEditar, setDisciplinaParaEditar] = useState(null);

  // Carregar dados do banco
  useEffect(() => {
    const fetchData = async () => {
      const turmaSnapshot = await getDocs(collection(firestore, 'turmas'));
      const disciplinaSnapshot = await getDocs(collection(firestore, 'disciplinas'));

      setTurmas(turmaSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
      setDisciplinas(disciplinaSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  // Adicionar disciplina
  const handleAdicionar = async (e) => {
    e.preventDefault();
    if (!nome || !turmaId) {
      alert('Preencha todos os campos!');
      return;
    }
    try {
      const newDisciplina = {
        nome,
        turmaId, // Agora apenas turmaId é necessário
      };

      // Adicionar ao Firestore
      const docRef = await addDoc(collection(firestore, 'disciplinas'), newDisciplina);

      // Atualizar a tabela localmente
      setDisciplinas((prevDisciplinas) => [
        ...prevDisciplinas,
        { id: docRef.id, ...newDisciplina },
      ]);

      // Resetando os campos
      setNome('');
      setTurmaId('');
      setMostrarFormulario(false); // Fechar o formulário
      alert('Disciplina adicionada com sucesso!');
    } catch (error) {
      alert('Erro ao adicionar disciplina.');
    }
  };

  // Excluir disciplina
  const handleExcluir = async (id) => {
    try {
      await deleteDoc(doc(firestore, 'disciplinas', id));
      alert('Disciplina excluída com sucesso!');
      setDisciplinas((prev) => prev.filter((disciplina) => disciplina.id !== id));
    } catch (error) {
      alert('Erro ao excluir disciplina.');
    }
  };

  // Iniciar edição da disciplina
  const handleEditar = (disciplina) => {
    setDisciplinaParaEditar(disciplina);
    setNome(disciplina.nome);
    setTurmaId(disciplina.turmaId);
    setMostrarFormulario(true);
  };

  // Salvar alterações na disciplina
  const handleSalvarEdicao = async (e) => {
    e.preventDefault();
    if (!nome || !turmaId) {
      alert('Preencha todos os campos!');
      return;
    }
    try {
      const disciplinaRef = doc(firestore, 'disciplinas', disciplinaParaEditar.id);
      await updateDoc(disciplinaRef, {
        nome,
        turmaId, // Atualiza apenas o nome e turmaId
      });

      // Atualizar tabela local
      setDisciplinas((prevDisciplinas) =>
          prevDisciplinas.map((disciplina) =>
              disciplina.id === disciplinaParaEditar.id
                  ? { ...disciplina, nome, turmaId }
                  : disciplina
          )
      );

      // Resetando os campos
      setNome('');
      setTurmaId('');
      setDisciplinaParaEditar(null);
      setMostrarFormulario(false); // Fechar o formulário
      alert('Disciplina atualizada com sucesso!');
    } catch (error) {
      alert('Erro ao atualizar disciplina.');
    }
  };

  return (
      <div className="manter-disciplina-container">
        <h2>Gerenciar Disciplinas</h2>

        <table className="disciplinas-table">
          <thead>
          <tr>
            <th>Nome</th>
            <th>Turma</th>
            <th>Ações</th>
          </tr>
          </thead>
          <tbody>
          {disciplinas.map((disciplina) => (
              <tr key={disciplina.id}>
                <td>{disciplina.nome}</td>
                <td>{turmas.find((t) => t.id === disciplina.turmaId)?.nome || 'N/A'}</td>
                <td>
                  <button onClick={() => handleEditar(disciplina)}>
                    <img src={editIcon} alt="Editar" />
                  </button>
                  <button onClick={() => handleExcluir(disciplina.id)}>
                    <img src={deleteIcon} alt="Excluir" />
                  </button>
                </td>
              </tr>
          ))}
          </tbody>
        </table>

        <div className="adicionar-disciplina">
          <button className="add-button" onClick={() => setMostrarFormulario(true)}>
            <img src={addIcon} alt="Adicionar" />
          </button>
        </div>

        {(mostrarFormulario || disciplinaParaEditar) && (
            <div className="modal">
              <div className="modal-content">
                <h3>{disciplinaParaEditar ? 'Editar Disciplina' : 'Cadastrar Disciplina'}</h3>
                <form onSubmit={disciplinaParaEditar ? handleSalvarEdicao : handleAdicionar}>
                  <input
                      type="text"
                      placeholder="Nome da Disciplina"
                      value={nome}
                      onChange={(e) => setNome(e.target.value)}
                  />
                  <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
                    <option value="">Selecione uma turma</option>
                    {turmas.map((turma) => (
                        <option key={turma.id} value={turma.id}>
                          {turma.nome}
                        </option>
                    ))}
                  </select>
                  <button type="submit">{disciplinaParaEditar ? 'Salvar Alterações' : 'Cadastrar'}</button>
                  <button
                      type="button"
                      className="cancel-button"
                      onClick={() => {
                        setMostrarFormulario(false);
                        setDisciplinaParaEditar(null);
                      }}
                  >
                    Cancelar
                  </button>
                </form>
              </div>
            </div>
        )}
      </div>
  );
};

export default ManterDisciplinas;
