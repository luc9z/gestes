import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase'; // Assumindo que você já tenha configurado o Firestore
import { getDocs, collection, query, where } from 'firebase/firestore';

const ManterDisciplina = () => {
  const [nomeDisciplina, setNomeDisciplina] = useState('');
  const [turmaId, setTurmaId] = useState('');
  const [professorId, setProfessorId] = useState('');
  const [alunos, setAlunos] = useState([]); // Estado para armazenar os alunos
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

  // Função para buscar alunos da turma selecionada
  const fetchAlunos = async (turmaId) => {
    if (turmaId) {
      // Consulta para buscar alunos com o turmaId correspondente
      const alunosQuery = query(collection(firestore, 'alunos'), where('turmaId', '==', turmaId));
      const alunosSnapshot = await getDocs(alunosQuery);
      const alunosData = alunosSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setAlunos(alunosData);
    }
  };

  useEffect(() => {
    fetchTurmas();
    fetchProfessores();
    fetchDisciplinas();
  }, []);

  // Effect para atualizar a lista de alunos quando a turma for alterada
  useEffect(() => {
    if (turmaId) {
      fetchAlunos(turmaId);
    } else {
      setAlunos([]); // Limpa a lista de alunos se nenhuma turma for selecionada
    }
  }, [turmaId]);

  const handleCadastro = async () => {
    if (!nomeDisciplina || !turmaId || !professorId) {
      setErrorMessage('Todos os campos são obrigatórios.');
      return;
    }

    try {
      // Lógica para adicionar a disciplina
      setNomeDisciplina('');
      setTurmaId('');
      setProfessorId('');
      setErrorMessage('');
    } catch (e) {
      setErrorMessage('Erro ao cadastrar disciplina.');
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

      {/* Exibição dos alunos */}
      {alunos.length > 0 && (
        <div>
          <h3>Alunos da Turma Selecionada:</h3>
          <table className="alunos-tabela">
            <thead>
              <tr>
                <th>Nome do Aluno</th>
              </tr>
            </thead>
            <tbody>
              {alunos.map(aluno => (
                <tr key={aluno.id}>
                  <td>{aluno.nome}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {errorMessage && <div className="error-message">{errorMessage}</div>}
    </div>
  );
};

export default ManterDisciplina;
