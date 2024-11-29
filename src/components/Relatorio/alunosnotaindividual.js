import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf'; // Biblioteca para gerar PDF
import { firestore } from '../../firebase';  // Certifique-se de que está importando a configuração do Firestore corretamente
import { getDocs, collection, doc, getDoc, query, where } from 'firebase/firestore'; // Importando as funções corretas do Firestore

const GerarRelatorioAluno = () => {
  const [turmaId, setTurmaId] = useState('');
  const [alunoId, setAlunoId] = useState('');
  const [disciplinaId, setDisciplinaId] = useState('');
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [notas, setNotas] = useState([]);
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

  // Carregar alunos da turma selecionada
  useEffect(() => {
    const carregarAlunos = async () => {
      if (!turmaId) {
        setAlunos([]);
        return;
      }

      const turmaRef = doc(firestore, 'turmas', turmaId);
      const turmaSnapshot = await getDoc(turmaRef);

      if (turmaSnapshot.exists()) {
        const turma = turmaSnapshot.data();
        const alunosData = turma.alunos || {};

        // Converte o objeto de alunos em um array
        const alunosList = Object.keys(alunosData).map(alunoId => ({
          id: alunoId,
          nome: alunosData[alunoId].nome,
        }));

        setAlunos(alunosList);
      }
    };

    carregarAlunos();
  }, [turmaId]);

  // Carregar disciplinas relacionadas à turma selecionada
  useEffect(() => {
    const carregarDisciplinas = async () => {
      if (!turmaId) {
        setDisciplinas([]);
        return;
      }

      const disciplinaSnapshot = await getDocs(collection(firestore, 'disciplinas'));
      const listaDeDisciplinas = disciplinaSnapshot.docs
        .map(doc => ({
          id: doc.id,
          nome: doc.data().nome,
          turmaId: doc.data().turmaId,
        }))
        .filter(disciplina => disciplina.turmaId === turmaId); // Filtra disciplinas pela turma

      setDisciplinas(listaDeDisciplinas);
    };

    carregarDisciplinas();
  }, [turmaId]);

  // Carregar notas do aluno selecionado para a disciplina
  useEffect(() => {
    const carregarNotas = async () => {
      if (!alunoId || !disciplinaId) {
        setNotas([]);
        return;
      }

      try {
        const notasRef = collection(firestore, 'notas');
        const q = query(
          notasRef,
          where('alunoId', '==', alunoId),
          where('disciplinaId', '==', disciplinaId)
        );
        const notasSnapshot = await getDocs(q);

        const notasData = notasSnapshot.docs.map(doc => doc.data());
        setNotas(notasData);
      } catch (error) {
        setNotas([]);
      }
    };

    carregarNotas();
  }, [alunoId, disciplinaId]);

  // Gerar o relatório em PDF
const gerarRelatorio = () => {
  if (!alunoId || !disciplinaId || !notas.length) {
    setErro('Selecione uma turma, um aluno e uma disciplina válidos.');
    return;
  }

  const alunoSelecionado = alunos.find(a => a.id === alunoId);
  const disciplinaSelecionada = disciplinas.find(d => d.id === disciplinaId);

  const doc = new jsPDF();
  doc.text('Relatório de Notas do Aluno', 10, 10);
  doc.text(`Aluno: ${alunoSelecionado?.nome}`, 10, 20); // Corrigido com crase para interpolação
  doc.text(`Disciplina: ${disciplinaSelecionada?.nome}`, 10, 30); // Corrigido com crase para interpolação

  let yOffset = 40;
  doc.text('Notas:', 10, yOffset);
  yOffset += 10;

  // Remover o número de índice na frente das notas
  notas.forEach(nota => {
    doc.text(`Nota: ${nota.nota}`, 10, yOffset); // Corrigido com crase para interpolação
    yOffset += 10;
  });

  doc.save(`relatorio_${alunoSelecionado?.nome}.pdf`); // Corrigido com crase para interpolação
};

  return (
    <div>
      <h2>Gerar Relatório do Aluno</h2>

      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <div>
        <label>Selecione a Turma:</label>
        <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
          <option value="">Selecione uma turma</option>
          {turmas.map(turma => (
            <option key={turma.id} value={turma.id}>{turma.nome}</option>
          ))}
        </select>
      </div>

      {turmaId && (
        <div>
          <label>Selecione o Aluno:</label>
          <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)}>
            <option value="">Selecione um aluno</option>
            {alunos.map(aluno => (
              <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
            ))}
          </select>
        </div>
      )}

      {alunoId && (
        <div>
          <label>Selecione a Disciplina:</label>
          <select value={disciplinaId} onChange={(e) => setDisciplinaId(e.target.value)}>
            <option value="">Selecione uma disciplina</option>
            {disciplinas.map(disciplina => (
              <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>
            ))}
          </select>
        </div>
      )}

      {disciplinaId && alunoId && turmaId && (
        <button onClick={gerarRelatorio}>Gerar Relatório</button>
      )}
    </div>
  );
};

export default GerarRelatorioAluno;