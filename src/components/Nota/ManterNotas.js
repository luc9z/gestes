import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { getDocs, collection, query, where, doc, getDoc, setDoc } from 'firebase/firestore';
import './ManterNotas.css';

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

  // Carregar turmas
  useEffect(() => {
    const carregarTurmas = async () => {
      console.log('Carregando turmas...');  // Log para depuração
      const turmaSnapshot = await getDocs(collection(firestore, 'turmas'));
      const listaDeTurmas = turmaSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setTurmas(listaDeTurmas);
      console.log('Turmas carregadas:', listaDeTurmas);  // Log para depuração
    };
    carregarTurmas();
  }, []);

  // Carregar disciplinas
  useEffect(() => {
    const carregarDisciplinas = async () => {
      console.log('Carregando disciplinas...');  // Log para depuração
      const disciplinaSnapshot = await getDocs(collection(firestore, 'disciplinas'));
      const listaDeDisciplinas = disciplinaSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setDisciplinas(listaDeDisciplinas);
      console.log('Disciplinas carregadas:', listaDeDisciplinas);  // Log para depuração
    };
    carregarDisciplinas();
  }, []);

  // Carregar alunos da turma selecionada
  useEffect(() => {
    const carregarAlunos = async () => {
      console.log('Carregando alunos para a turma ID:', turmaId);  // Log para depuração

      if (!turmaId) {
        setAlunos([]);
        return;
      }

      try {
        const turmaRef = doc(firestore, 'turmas', turmaId);
        const turmaSnapshot = await getDoc(turmaRef);

        if (!turmaSnapshot.exists()) {
          console.error(`Nenhuma turma encontrada com o ID: ${turmaId}`);
          setAlunos([]);
          return;
        }

        const turma = turmaSnapshot.data();
        const alunosData = turma.alunos || {};  // Aqui os alunos estão no formato de objeto

        // Converte o objeto de alunos em um array de alunos para exibição
        const alunosList = Object.keys(alunosData).map(alunoId => ({
          id: alunoId,
          nome: alunosData[alunoId].nome, // Nome do aluno
          email: alunosData[alunoId].email // Email do aluno
        }));

        console.log('Alunos carregados:', alunosList);  // Log para depuração
        setAlunos(alunosList);
      } catch (error) {
        console.error('Erro ao carregar alunos:', error);
        setAlunos([]);
      }
    };

    carregarAlunos();
  }, [turmaId]);

  // Carregar notas da turma e disciplina selecionada
  useEffect(() => {
    const carregarNotas = async () => {
      console.log('Carregando notas para turma:', turmaId, 'disciplina:', disciplinaId);  // Log para depuração

      if (!turmaId || !disciplinaId) {
        setNotas([]);
        return;
      }

      try {
        const notasRef = collection(firestore, 'notas');
        const q = query(notasRef, where('turmaId', '==', turmaId), where('disciplinaId', '==', disciplinaId));
        const notasSnapshot = await getDocs(q);

        const notasData = await Promise.all(
            notasSnapshot.docs.map(async doc => {
              const notaData = doc.data();
              const alunoRef = doc(firestore, 'alunos', notaData.alunoId);
              const alunoSnapshot = await getDoc(alunoRef);
              const alunoNome = alunoSnapshot.exists() ? alunoSnapshot.data().nome : 'Aluno não encontrado';
              return { id: doc.id, alunoNome, ...notaData };
            })
        );
        setNotas(notasData);
      } catch (error) {
        console.error('Erro ao carregar notas:', error);
        setNotas([]);
      }
    };

    carregarNotas();
  }, [turmaId, disciplinaId]);

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
    }
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

        {/* Botão para Salvar Nota */}
        <button onClick={handleSalvarNota}>Salvar Nota</button>

        {/* Exibir Notas Existentes */}
        <div className="notas-existentes">
          <h3>Notas Existentes</h3>
          <table>
            <thead>
            <tr>
              <th>Aluno</th>
              <th>Nota</th>
            </tr>
            </thead>
            <tbody>
            {notas.map(nota => (
                <tr key={nota.id}>
                  <td>{nota.alunoNome}</td>
                  <td>{nota.nota}</td>
                </tr>
            ))}
            </tbody>
          </table>
        </div>
      </div>
  );
};

export default ManterNotas;
