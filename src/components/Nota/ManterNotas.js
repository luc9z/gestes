import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { getDocs, collection, query, where, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import './ManterNotas.css';
import editIcon from '../../assets/edit-icon.png'; // Ícone de editar
import deleteIcon from '../../assets/delete-icon.png'; // Ícone de deletar

const ManterNotas = () => {
  const [turmaId, setTurmaId] = useState('');
  const [disciplinaId, setDisciplinaId] = useState('');
  const [alunoId, setAlunoId] = useState('');
  const [nota, setNota] = useState('');
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [erro, setErro] = useState('');
  const [notas, setNotas] = useState([]);
  const [notaEditando, setNotaEditando] = useState(null); // Para editar uma nota específica
  const [showModal, setShowModal] = useState(false); // Estado do modal

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

  // Carregar disciplinas
  useEffect(() => {
    const carregarDisciplinas = async () => {
      const disciplinaSnapshot = await getDocs(collection(firestore, 'disciplinas'));
      const listaDeDisciplinas = disciplinaSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setDisciplinas(listaDeDisciplinas);
    };
    carregarDisciplinas();
  }, []);

  // Carregar alunos da turma selecionada
  useEffect(() => {
    const carregarAlunos = async () => {
      if (!turmaId) {
        setAlunos([]);
        return;
      }

      try {
        const turmaRef = doc(firestore, 'turmas', turmaId);
        const turmaSnapshot = await getDoc(turmaRef);

        if (!turmaSnapshot.exists()) {
          setAlunos([]);
          return;
        }

        const turma = turmaSnapshot.data();
        const alunosData = turma.alunos || {};  // Aqui os alunos estão no formato de objeto

        // Converte o objeto de alunos em um array de alunos para exibição
        const alunosList = Object.keys(alunosData).map(alunoId => ({
          id: alunoId,
          nome: alunosData[alunoId].nome,
          email: alunosData[alunoId].email
        }));

        setAlunos(alunosList);
      } catch (error) {
        setAlunos([]);
      }
    };

    carregarAlunos();
  }, [turmaId]);

  // Carregar notas da turma selecionada
  useEffect(() => {
    const carregarNotas = async () => {
      if (!turmaId) {
        setNotas([]);
        return;
      }

      try {
        const notasRef = collection(firestore, 'notas');
        const q = query(notasRef, where('turmaId', '==', turmaId));
        const notasSnapshot = await getDocs(q);

        const notasData = await Promise.all(
          notasSnapshot.docs.map(async (docSnapshot) => {
            const notaData = docSnapshot.data();
            const alunoRef = doc(firestore, 'alunos', notaData.alunoId);
            const alunoSnapshot = await getDoc(alunoRef);
            const alunoNome = alunoSnapshot.exists() ? alunoSnapshot.data().nome : 'Aluno não encontrado';
            return { id: docSnapshot.id, alunoNome, ...notaData };
          })
        );

        setNotas(notasData);
      } catch (error) {
        setNotas([]);
      }
    };

    carregarNotas();
  }, [turmaId]);  // As notas são carregadas sem filtro de disciplina

  // Salvar ou atualizar nota no Firestore
  const handleSalvarNota = async () => {
    if (!nota || !turmaId || !alunoId) {
      setErro('Todos os campos são obrigatórios.');
      return;
    }

    try {
      let notaRef;
      if (notaEditando) {
        // Atualizando a nota existente
        notaRef = doc(firestore, 'notas', notaEditando.id);
        await setDoc(notaRef, {
          turmaId,
          disciplinaId,
          alunoId,
          nota: parseFloat(nota),
        });
        setNotas(prevNotas =>
          prevNotas.map(n => n.id === notaEditando.id ? { ...n, nota: parseFloat(nota) } : n)
        );
        setNotaEditando(null);
        setShowModal(false); // Fechar o modal
      } else {
        // Salvando uma nova nota
        notaRef = doc(collection(firestore, 'notas'));
        await setDoc(notaRef, {
          turmaId,
          disciplinaId,
          alunoId,
          nota: parseFloat(nota),
        });
        setNotas(prevNotas => [
          ...prevNotas,
          { alunoNome: alunos.find(a => a.id === alunoId).nome, nota: parseFloat(nota) }
        ]);
      }

      setErro('');
      alert('Nota salva com sucesso!');
      setNota('');
    } catch (error) {
      setErro('Erro ao salvar a nota.');
    }
  };

  // Excluir nota
  const handleDeletarNota = async (notaId) => {
    try {
      await deleteDoc(doc(firestore, 'notas', notaId));
      setNotas(prevNotas => prevNotas.filter(nota => nota.id !== notaId));
      alert('Nota deletada com sucesso!');
    } catch (error) {
      alert('Erro ao deletar a nota.');
    }
  };

  // Ativar edição de nota
  const handleEditarNota = (nota) => {
    setNota(nota.nota);
    setAlunoId(nota.alunoId);
    setNotaEditando(nota);
    setShowModal(true); // Abre o modal para edição
  };

  // Fechar modal
  const handleFecharModal = () => {
    setShowModal(false);
    setNotaEditando(null); // Limpa os dados de edição
    setNota('');
  };

  return (
    <div className="manter-notas-container">
      <h2>Gerenciar Notas</h2>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      {/* Seletor de Turma */}
      <div className="filtro-turma">
        <label>Turma:</label>
        <select value={turmaId} onChange={e => setTurmaId(e.target.value)}>
          <option value="">Selecione uma turma</option>
          {turmas.map(turma => (
            <option key={turma.id} value={turma.id}>
              {turma.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Seletor de Disciplina */}
      <div className="filtro-disciplina">
        <label>Disciplina:</label>
        <select value={disciplinaId} onChange={e => setDisciplinaId(e.target.value)}>
          <option value="">Selecione uma disciplina</option>
          {disciplinas.map(disciplina => (
            <option key={disciplina.id} value={disciplina.id}>
              {disciplina.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Seletor de Aluno */}
      <div className="filtro-aluno">
        <label>Aluno:</label>
        <select value={alunoId} onChange={e => setAlunoId(e.target.value)}>
          <option value="">Selecione um aluno</option>
          {alunos.map(aluno => (
            <option key={aluno.id} value={aluno.id}>
              {aluno.nome}
            </option>
          ))}
        </select>
      </div>

      {/* Campo de Nota */}
      <div className="campo-nota">
        <label>Nota:</label>
        <input
          type="number"
          value={nota}
          onChange={e => setNota(e.target.value)}
          placeholder="Digite a nota"
        />
      </div>

      {/* Botão para Salvar ou Atualizar Nota */}
      <button onClick={handleSalvarNota}>
        {notaEditando ? 'Atualizar Nota' : 'Salvar Nota'}
      </button>

      {/* Exibir Notas Existentes */}
      <div className="notas-existentes">
        <h3>Notas Existentes</h3>
        <table>
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Nota</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {notas.length > 0 ? (
              notas.map(nota => (
                <tr key={nota.id}>
                  <td>{nota.alunoNome}</td>
                  <td>{nota.nota}</td>
                  <td>
                    <button onClick={() => handleEditarNota(nota)}>
                      <img src={editIcon} alt="Editar" />
                    </button>
                    <button onClick={() => handleDeletarNota(nota.id)}>
                      <img src={deleteIcon} alt="Deletar" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">Nenhuma nota encontrada.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para Editar Nota */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Editar Nota</h3>
            <div>
              <label>Nota:</label>
              <input
                type="number"
                value={nota}
                onChange={e => setNota(e.target.value)}
                placeholder="Digite a nota"
              />
            </div>
            <button onClick={handleSalvarNota}>Salvar Alterações</button>
            <button onClick={handleFecharModal}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManterNotas;
