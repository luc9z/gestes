import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf'; // Biblioteca para gerar PDF
import './GerarRelatorio.css';
import { firestore } from '../../firebase';  // Certifique-se de que está importando a configuração do Firestore corretamente
import { getDocs, collection, doc, getDoc } from 'firebase/firestore'; // Importando as funções corretas do Firestore

const GerarRelatorio = () => {
  const [tipoRelatorio, setTipoRelatorio] = useState(null); // Tipo de relatório (aluno, turma ou professor)
  const [turmaId, setTurmaId] = useState('');
  const [professores, setProfessores] = useState([]);
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState([]);
  const [erro, setErro] = useState('');

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

    const carregarDisciplinas = async () => {
      const disciplinaSnapshot = await getDocs(collection(firestore, 'disciplinas'));
      const listaDeDisciplinas = disciplinaSnapshot.docs.map(doc => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setDisciplinas(listaDeDisciplinas);
    };

    carregarTurmas();
    carregarProfessores();
    carregarDisciplinas();
  }, []);

  // Função para escolher o tipo de relatório
  const handleEscolherRelatorio = (tipo) => {
    setTipoRelatorio(tipo); // Atualiza o tipo de relatório escolhido
  };

  // Gerar relatório de professores
  const handleGerarRelatorioProfessor = async () => {
    try {
      if (!turmaId) {
        setErro('Selecione uma turma para gerar o relatório de professores');
        return;
      }

      // Filtrar os professores pela turma selecionada
      const professoresTurma = professores.filter(professor => professor.turmaId === turmaId);

      if (professoresTurma.length === 0) {
        setErro('Nenhum professor encontrado para a turma selecionada');
        return;
      }

      // Substituir o disciplinaId pelo nome da disciplina
      const professoresComDisciplinas = await Promise.all(professoresTurma.map(async (professor) => {
        const disciplina = disciplinas.find(disc => disc.id === professor.disciplinaId);
        return {
          ...professor,
          disciplinaNome: disciplina ? disciplina.nome : '[NÃO INFORMADO]',
        };
      }));

      gerarPDFRelatorioProfessor(professoresComDisciplinas);
    } catch (error) {
      setErro('Erro ao gerar o relatório de professores');
    }
  };

  // Gerar PDF de relatório de professores
  const gerarPDFRelatorioProfessor = (professores) => {
    const doc = new jsPDF();
    doc.text('Relatório de Professores', 10, 10);
    let yOffset = 20;

    // Cabeçalho da tabela
    doc.text('Professor', 10, yOffset);
    doc.text('Turma', 80, yOffset);
    doc.text('Disciplina', 150, yOffset);
    yOffset += 10;

    // Adiciona os dados dos professores na tabela
    professores.forEach((professor) => {
      const turma = turmas.find(t => t.id === professor.turmaId);
      doc.text(professor.nome, 10, yOffset);
      doc.text(turma ? turma.nome : '[NÃO INFORMADO]', 80, yOffset);
      doc.text(professor.disciplinaNome, 150, yOffset); // Aqui já usamos o nome da disciplina
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
            <h3>{tipoRelatorio === 'professor' ? 'Escolher Relatório de Professores' : 'Escolher Outro Relatório'}</h3>

            {/* Se for relatório de professores */}
            {tipoRelatorio === 'professor' && (
              <div>
                <label>Selecione a Turma:</label>
                <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
                  <option value="">Selecione uma turma</option>
                  {turmas.map(turma => (
                    <option key={turma.id} value={turma.id}>{turma.nome}</option>
                  ))}
                </select>

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