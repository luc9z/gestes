import React, { useState, useEffect } from 'react';
import { gerarRelatorioPresenca, gerarRelatorioAluno } from '../../firebase';  // Importando as funções
import jsPDF from 'jspdf'; // Biblioteca para gerar PDF
import './GerarRelatorio.css';
import { firestore } from '../../firebase';  // Certifique-se de que está importando a configuração do Firestore corretamente
import { getDocs, collection, doc, getDoc, query, where } from 'firebase/firestore'; // Importando as funções corretas do Firestore

const GerarRelatorio = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState(null); // Tipo de relatório (aluno, turma ou professor)
  const [turmaId, setTurmaId] = useState('');
  const [alunoId, setAlunoId] = useState('');
  const [disciplinaId, setDisciplinaId] = useState('');
  const [erro, setErro] = useState('');
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [professores, setProfessores] = useState([]);
  const [notas, setNotas] = useState([]); // Estado para armazenar as notas dos alunos

  // Carregar turmas, disciplinas e professores
  useEffect(() => {
    const carregarTurmas = async () => {
      const turmaSnapshot = await getDocs(collection(firestore, 'turmas'));
      const listaDeTurmas = turmaSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setTurmas(listaDeTurmas);
    };

    const carregarProfessores = async () => {
      const professoresSnapshot = await getDocs(collection(firestore, 'professores'));
      const listaDeProfessores = professoresSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
        disciplinaId: doc.data().disciplinaId,
        turmaId: doc.data().turmaId,
      }));
      setProfessores(listaDeProfessores);
    };

    carregarTurmas();
    carregarProfessores();
  }, []);

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
        .filter(disciplina => disciplina.turmaId === turmaId);  // Filtra disciplinas pela turma selecionada
      setDisciplinas(listaDeDisciplinas);
    };

    carregarDisciplinas();
  }, [turmaId]);

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
        }));

        setAlunos(alunosList);
      } catch (error) {
        setAlunos([]);
      }
    };

    carregarAlunos();
  }, [turmaId]);

  // Carregar notas dos alunos na turma e nas disciplinas selecionadas
  useEffect(() => {
    const carregarNotas = async () => {
      if (!turmaId || !disciplinaId) {
        setNotas([]); // Se não houver turma ou disciplina, não há notas
        return;
      }

      try {
        const notasRef = collection(firestore, 'notas');
        const q = query(
          notasRef,
          where('turmaId', '==', turmaId),
          where('disciplinaId', '==', disciplinaId)  // Filtra pelas notas relacionadas à turma e disciplina
        );
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
  }, [turmaId, disciplinaId]);  // As notas são carregadas com base na turma e na disciplina selecionada

  // Função para escolher o tipo de relatório
  const handleEscolherRelatorio = (tipo) => {
    setTipoRelatorio(tipo); // Atualiza o tipo de relatório escolhido
  };

  // Gerar relatório de turma
  const handleGerarRelatorioTurma = async () => {
    try {
      const dadosRelatorio = await gerarRelatorioPresenca(turmaId);
      gerarPDFRelatorioTurma(dadosRelatorio);
    } catch (error) {
      setErro('Erro ao gerar o relatório de turma');
    }
  };

  // Gerar relatório de aluno
  const handleGerarRelatorioAluno = async () => {
    try {
      let dadosRelatorio;

      if (!disciplinaId) {
        dadosRelatorio = await gerarRelatorioAluno(turmaId, alunoId);
      } else {
        dadosRelatorio = await gerarRelatorioAluno(turmaId, alunoId, disciplinaId);
      }

      gerarPDFRelatorioAluno(dadosRelatorio);
    } catch (error) {
      setErro('Erro ao gerar o relatório de aluno');
    }
  };

  // Gerar relatório de professores
  const handleGerarRelatorioProfessor = async () => {
    try {
      const dadosRelatorio = professores.map(professor => {
        const turma = turmas.find(t => t.id === professor.turmaId);
        const disciplina = disciplinas.find(d => d.id === professor.disciplinaId);
        return {
          nome: professor.nome,
          turma: turma ? turma.nome : '[NÃO INFORMADO]',
          disciplina: disciplina ? disciplina.nome : '[NÃO INFORMADO]',
        };
      });

      gerarPDFRelatorioProfessor(dadosRelatorio);
    } catch (error) {
      setErro('Erro ao gerar o relatório de professores');
    }
  };

  // Gerar PDF de relatório de turma
  const gerarPDFRelatorioTurma = async (dados) => {
    const doc = new jsPDF();
    doc.text('Relatório de Presença da Turma', 10, 10);
    let yOffset = 20;
  
    // Cabeçalho da tabela
    doc.text('Aluno', 10, yOffset);
    doc.text('Disciplina', 60, yOffset);
    doc.text('Nota', 130, yOffset);
    yOffset += 10;
  
    // Adiciona os dados da turma na tabela
    for (const aluno of dados) {
      doc.text(aluno.nome, 10, yOffset);
  
      for (const disciplina of disciplinas) {
        try {
          // Buscando as notas diretamente do Firestore
          const notasRef = collection(firestore, 'notas');
          const q = query(
            notasRef,
            where('alunoId', '==', aluno.id),
            where('disciplinaId', '==', disciplina.id),
            where('turmaId', '==', turmaId) // Certificando que o turmaId é considerado
          );
        
          const querySnapshot = await getDocs(q);
        
          // Verificando se encontramos algum documento
          if (!querySnapshot.empty) {
            // Supondo que existam várias notas, pegamos a primeira (se houver)
            const nota = querySnapshot.docs[0].data().nota; // Obtendo o valor da nota
            doc.text(disciplina.nome, 60, yOffset);
            doc.text(nota ? nota.toString() : '[NÃO INFORMADO]', 130, yOffset);
          } else {
            doc.text(disciplina.nome, 60, yOffset);
            doc.text('[NÃO INFORMADO]', 130, yOffset);
          }
        
          yOffset += 10;
        } catch (error) {
          console.error(`Erro ao buscar nota para aluno ${aluno.id} e disciplina ${disciplina.id}:`, error);
        }
      }
  
      yOffset += 5;  // Espaço entre os alunos
    }
  
    doc.save('relatorio_turma.pdf');
  };
  
  const gerarPDFRelatorioAluno = async (dados) => {
    const doc = new jsPDF();
    doc.text('Relatório do Aluno', 10, 10);
    doc.text(`Nome: ${dados.alunoNome}`, 10, 20); // Corrigido com crase
    doc.text(`Email: ${dados.alunoEmail}`, 10, 30); // Corrigido com crase
    let yOffset = 40;
  
    // Cabeçalho da tabela
    doc.text('Disciplina', 10, yOffset);
    doc.text('Nota', 60, yOffset);
    yOffset += 10;
  
    for (const disciplina of disciplinas) {
      const nota = dados.notas.find(nota => nota.disciplinaId === disciplina.id);
      const notaText = nota ? nota.nota : '[NÃO INFORMADO]';
      doc.text(disciplina.nome, 10, yOffset);
      doc.text(notaText, 60, yOffset);
      yOffset += 10;
    }
  
    doc.save('relatorio_aluno.pdf');
  };
  
  // Gerar PDF de relatório de professores
  const gerarPDFRelatorioProfessor = (dados) => {
    const doc = new jsPDF();
    doc.text('Relatório de Professores', 10, 10);
    let yOffset = 20;
  
    // Cabeçalho da tabela
    doc.text('Professor', 10, yOffset);
    doc.text('Disciplina', 60, yOffset);
    doc.text('Turma', 130, yOffset);
    yOffset += 10;
  
    // Adiciona os dados dos professores na tabela
    dados.forEach((professor) => {
      doc.text(professor.nome, 10, yOffset);
      doc.text(professor.disciplina, 60, yOffset);
      doc.text(professor.turma, 130, yOffset);
      yOffset += 10;
    });
  
    doc.save('relatorio_professores.pdf');
  };

  return (
    <div>
      <h2>Gerar Relatório</h2>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}

      <div className="relatorio-tipo">
        <button onClick={() => handleEscolherRelatorio('turma')}>Relatório de Turma</button>
        <button onClick={() => handleEscolherRelatorio('aluno')}>Relatório de Aluno</button>
        <button onClick={() => handleEscolherRelatorio('professor')}>Relatório de Professores</button>
      </div>

      {/* Modal para selecionar turma e gerar relatório */}
      {tipoRelatorio && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{tipoRelatorio === 'turma' ? 'Escolher Turma' : tipoRelatorio === 'aluno' ? 'Escolher Aluno e Disciplina' : 'Escolher Relatório de Professores'}</h3>

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

            {/* Se for relatório de professores */}
            {tipoRelatorio === 'professor' && (
              <div>
                <button onClick={handleGerarRelatorioProfessor}>Gerar Relatório de Professores</button>
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