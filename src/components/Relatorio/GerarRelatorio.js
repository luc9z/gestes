import React, { useState, useEffect } from 'react';
import { gerarRelatorioPresenca, gerarRelatorioAluno } from '../../firebase';  // Importando as funções
import jsPDF from 'jspdf'; // Biblioteca para gerar PDF
import './GerarRelatorio.css';
import { firestore } from '../../firebase';  // Certifique-se de que está importando a configuração do Firestore corretamente
import { getDocs, collection, doc, getDoc, query, where } from 'firebase/firestore'; // Importando as funções corretas do Firestore

const GerarRelatorio = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState(null); // Tipo de relatório (aluno ou turma)
  const [turmaId, setTurmaId] = useState('');
  const [alunoId, setAlunoId] = useState('');
  const [disciplinaId, setDisciplinaId] = useState('');
  const [erro, setErro] = useState('');
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);

  // Carregar turmas e disciplinas
  useEffect(() => {
    const carregarTurmas = async () => {
      const turmaSnapshot = await getDocs(collection(firestore, 'turmas'));
      const listaDeTurmas = turmaSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setTurmas(listaDeTurmas);
    };

    const carregarDisciplinas = async () => {
      const disciplinaSnapshot = await getDocs(collection(firestore, 'disciplinas'));
      const listaDeDisciplinas = disciplinaSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setDisciplinas(listaDeDisciplinas);
    };

    carregarTurmas();
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

        const alunosList = Object.keys(alunosData).map(alunoId => ({
          id: alunoId,
          nome: alunosData[alunoId].nome,
        }));

        setAlunos(alunosList);
      } catch (error) {
        setAlunos([]);
      }
    };

    carregarAlunos();
  }, [turmaId]);

  const handleEscolherRelatorio = (tipo) => {
    setTipoRelatorio(tipo);
  };

  const handleGerarRelatorioTurma = async () => {
    try {
      const dadosRelatorio = await gerarRelatorioPresenca(turmaId);
      gerarPDFRelatorioTurma(dadosRelatorio);
    } catch (error) {
      setErro('Erro ao gerar o relatório de turma');
    }
  };

  const handleGerarRelatorioAluno = async () => {
    try {
      let dadosRelatorio;
      
      // Se não houver disciplina selecionada, pegar todas as disciplinas
      if (!disciplinaId) {
        dadosRelatorio = await gerarRelatorioAluno(turmaId, alunoId);
      } else {
        dadosRelatorio = await gerarRelatorioAluno(turmaId, alunoId, disciplinaId);
      }

      // Gerar o PDF para o aluno
      gerarPDFRelatorioAluno(dadosRelatorio);
    } catch (error) {
      setErro('Erro ao gerar o relatório de aluno');
    }
  };

  const gerarPDFRelatorioTurma = (dados) => {
    const doc = new jsPDF();
    doc.text('Relatório de Presença da Turma', 10, 10);
    let yOffset = 20;

    dados.forEach((aluno) => {
      doc.text(`Aluno: ${aluno.nome}`, 10, yOffset);
      yOffset += 10;
      
      // Adiciona as disciplinas e notas do aluno
      disciplinas.forEach(disciplina => {
        const nota = aluno.notas[disciplina.id] || '[NÃO INFORMADO]';
        doc.text(`Disciplina: ${disciplina.nome} - Nota: ${nota}`, 10, yOffset);
        yOffset += 10;
      });
      
      yOffset += 5;  // Espaço entre os alunos
    });

    doc.save('relatorio_turma.pdf');
  };

  const gerarPDFRelatorioAluno = (dados) => {
    const doc = new jsPDF();
    doc.text('Relatório do Aluno', 10, 10);
    doc.text(`Nome: ${dados.alunoNome}`, 10, 20);
    doc.text(`Email: ${dados.alunoEmail}`, 10, 30);
    let yOffset = 40;

    // Adiciona as disciplinas e notas do aluno
    disciplinas.forEach(disciplina => {
      const nota = dados.notas[disciplina.id] || '[NÃO INFORMADO]';
      doc.text(`Disciplina: ${disciplina.nome} - Nota: ${nota}`, 10, yOffset);
      yOffset += 10;
    });

    doc.save('relatorio_aluno.pdf');
  };

  return (
    <div>
      <h2>Gerar Relatório</h2>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <div className="relatorio-tipo">
        <button onClick={() => handleEscolherRelatorio('turma')}>Relatório de Turma</button>
        <button onClick={() => handleEscolherRelatorio('aluno')}>Relatório de Aluno</button>
      </div>

      {/* Modal para selecionar turma e gerar relatório */}
      {tipoRelatorio && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{tipoRelatorio === 'turma' ? 'Escolher Turma' : 'Escolher Aluno e Disciplina'}</h3>

            {/* Se for relatório de turma */}
            {tipoRelatorio === 'turma' && (
              <div>
                <label>Selecione a Turma:</label>
                <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
                  <option value="">Selecione uma turma</option>
                  {turmas.map(turma => (
                    <option key={turma.id} value={turma.id}>{turma.nome}</option>
                  ))}
                </select>

                <button onClick={handleGerarRelatorioTurma}>Gerar Relatório</button>
              </div>
            )}

            {/* Se for relatório de aluno */}
            {tipoRelatorio === 'aluno' && (
              <div>
                <label>Selecione a Turma:</label>
                <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
                  <option value="">Selecione uma turma</option>
                  {turmas.map(turma => (
                    <option key={turma.id} value={turma.id}>{turma.nome}</option>
                  ))}
                </select>

                <label>Selecione o Aluno:</label>
                <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)}>
                  <option value="">Selecione um aluno</option>
                  {alunos.map(aluno => (
                    <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                  ))}
                </select>

                <label>Selecione a Disciplina (ou todas):</label>
                <select value={disciplinaId} onChange={(e) => setDisciplinaId(e.target.value)}>
                  <option value="">Todas as Disciplinas</option>
                  {disciplinas.map(disciplina => (
                    <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>
                  ))}
                </select>

                <button onClick={handleGerarRelatorioAluno}>Gerar Relatório</button>
              </div>
            )}

            <button onClick={() => setTipoRelatorio(null)}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GerarRelatorio;
