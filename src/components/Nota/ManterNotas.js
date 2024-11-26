import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { getDocs, collection, query, where, doc, getDoc, setDoc } from 'firebase/firestore';

const ManterNotas = () => {
  const [turmaId, setTurmaId] = useState('');
  const [disciplinaId, setDisciplinaId] = useState('');
  const [alunoId, setAlunoId] = useState('');
  const [nota, setNota] = useState('');
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [erro, setErro] = useState('');

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
        // Busca a turma diretamente pelo ID
        const turmaRef = doc(firestore, 'turmas', turmaId);
        const turmaSnapshot = await getDoc(turmaRef);

        if (!turmaSnapshot.exists()) {
          console.error(`Nenhuma turma encontrada com o ID: ${turmaId}`);
          setAlunos([]);
          return;
        }

        const turma = turmaSnapshot.data();
        const alunoIds = turma.alunos || [];

        console.log('IDs dos alunos:', alunoIds);

        // Buscar os alunos associados
        const alunosCarregados = await Promise.all(
          alunoIds.map(async id => {
            const alunoRef = doc(firestore, 'alunos', id);
            const alunoSnapshot = await getDoc(alunoRef);
            if (!alunoSnapshot.exists()) {
              console.warn(`Aluno com ID ${id} não encontrado.`);
              return null;
            }
            return { id, ...alunoSnapshot.data() };
          })
        );

        const alunosValidos = alunosCarregados.filter(Boolean); // Remove entradas inválidas
        console.log('Dados dos alunos carregados:', alunosValidos);
        setAlunos(alunosValidos);
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        setAlunos([]);
      }
    };

    carregarAlunos();
  }, [turmaId]);

  // Salvar nota no Firestore
  const handleSalvarNota = async () => {
    if (!nota || !turmaId || !disciplinaId || !alunoId) {
      setErro('Todos os campos são obrigatórios.');
      return;
    }

    try {
      const notaRef = doc(collection(firestore, 'notas'));
      await setDoc(notaRef, {
        turmaId,
        disciplinaId,
        alunoId,
        nota: parseFloat(nota),
      });

      setErro('');
      alert('Nota salva com sucesso!');
      setNota('');
    } catch (error) {
      setErro('Erro ao salvar a nota.');
      console.error('Erro ao salvar a nota:', error);
    }
  };

  return (
    <div>
      <h2>Gerenciar Notas</h2>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <div>
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

      <div>
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

      <div>
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

      <div>
        <label>Nota:</label>
        <input
          type="number"
          value={nota}
          onChange={e => setNota(e.target.value)}
          placeholder="Digite a nota"
        />
      </div>

      <button onClick={handleSalvarNota}>Salvar Nota</button>
    </div>
  );
};

export default ManterNotas;
