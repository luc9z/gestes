// Importando as funções necessárias do Firebase
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';  
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc, getDoc } from 'firebase/firestore';  

// Sua configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCGqOwOBQPvZtoBh36p7JXckmyYf84K1EQ",
  authDomain: "gestao-e1e2d.firebaseapp.com",
  projectId: "gestao-e1e2d",
  storageBucket: "gestao-e1e2d.firebasestorage.app",
  messagingSenderId: "853077794175",
  appId: "1:853077794175:web:1eec240d2b040fdb4a4e4a",
  measurementId: "G-Q6T28XKPXF"
};

// Inicializando o Firebase
const app = initializeApp(firebaseConfig);

// Inicializando o Auth e Firestore
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// Função para adicionar nota ao aluno
export const adicionarNota = async (alunoId, disciplinaId, nota) => {
  try {
    const alunoRef = doc(firestore, 'alunos', alunoId);
    await updateDoc(alunoRef, { [`notas.${disciplinaId}`]: nota });  // Adiciona a nota para a disciplina
    console.log("Nota adicionada com sucesso.");
  } catch (e) {
    console.error("Erro ao adicionar nota:", e);
    throw e;
  }
};

// Função para login com email e senha
export const loginWithEmailAndPassword = (email, password) => {
  return signInWithEmailAndPassword(auth, email, password);  
};
// Função para adicionar aluno
export const adicionarAluno = async (nome, email, turmaId) => {
  try {
    // Adiciona o aluno na coleção 'alunos'
    const alunoRef = await addDoc(collection(firestore, "alunos"), {
      nome: nome,
      email: email,
      turmaId: turmaId,  // Associando o aluno à turma
    });
    console.log("Aluno adicionado com ID:", alunoRef.id);
    return alunoRef.id;
  } catch (e) {
    console.error("Erro ao adicionar aluno:", e);
    throw new Error("Erro ao adicionar aluno.");
  }
};

// Função para adicionar o aluno à turma
export const adicionarAlunoNaTurma = async (alunoId, turmaId) => {
  try {
    const turmaRef = doc(firestore, 'turmas', turmaId);
    const turmaSnapshot = await getDoc(turmaRef);
    if (turmaSnapshot.exists()) {
      const turmaData = turmaSnapshot.data();
      const alunosAtualizados = [...turmaData.alunos, alunoId];
      await updateDoc(turmaRef, { alunos: alunosAtualizados });
      console.log("Aluno inserido na turma com sucesso.");
    }
  } catch (e) {
    console.error("Erro ao inserir aluno na turma:", e);
    throw e;
  }
};


export const excluirAluno = async (alunoId, turmaId) => {
  try {
    if (!alunoId || !turmaId) {
      console.error("ID do aluno ou da turma não foi fornecido.");
      throw new Error("ID do aluno ou da turma não fornecido.");
    }

    // Exclui o aluno da coleção 'alunos'
    const alunoRef = doc(firestore, 'alunos', alunoId);
    await deleteDoc(alunoRef);
    console.log("Aluno excluído com sucesso.");

    // Atualiza a turma, removendo o aluno
    const turmaRef = doc(firestore, 'turmas', turmaId);
    const turmaSnapshot = await getDoc(turmaRef);

    if (turmaSnapshot.exists()) {
      const turmaData = turmaSnapshot.data();
      // Filtra a lista de alunos, removendo o aluno excluído
      const alunosAtualizados = turmaData.alunos.filter(id => id !== alunoId);

      // Atualiza a lista de alunos na turma
      await updateDoc(turmaRef, { alunos: alunosAtualizados });
      console.log("Aluno removido da turma com sucesso.");
    } else {
      throw new Error("Turma não encontrada.");
    }
  } catch (e) {
    console.error("Erro ao excluir aluno:", e);
    throw e;
  }
};


// Função para atualizar aluno
export const atualizarAluno = async (alunoId, novosDados) => {
  try {
    const alunoRef = doc(firestore, 'alunos', alunoId);

    // Atualiza os dados do aluno na coleção 'alunos'
    await updateDoc(alunoRef, novosDados);

    console.log("Aluno atualizado com sucesso.");

    // Verificar se a turma do aluno foi alterada e atualizar na turma
    if (novosDados.turmaId) {
      // Atualizar aluno na turma
      await atualizarAlunoNaTurma(alunoId, novosDados.turmaId);
    }

  } catch (e) {
    console.error("Erro ao atualizar aluno:", e);
  }
};

// Função para atualizar o aluno na turma, se necessário
export const atualizarAlunoNaTurma = async (alunoId, novaTurmaId) => {
  try {
    // Referência para a nova turma
    const novaTurmaRef = doc(firestore, 'turmas', novaTurmaId);
    const novaTurmaSnapshot = await getDoc(novaTurmaRef);

    if (novaTurmaSnapshot.exists()) {
      const novaTurmaData = novaTurmaSnapshot.data();

      // Se a turma já tiver alunos, adiciona o aluno na nova lista
      const alunosAtualizados = novaTurmaData.alunos ? [...novaTurmaData.alunos, alunoId] : [alunoId];

      // Atualiza a nova turma com a lista de alunos
      await updateDoc(novaTurmaRef, { alunos: alunosAtualizados });

      console.log("Aluno atualizado na nova turma com sucesso.");
    } else {
      console.log("A nova turma não foi encontrada.");
    }
  } catch (e) {
    console.error("Erro ao atualizar aluno na nova turma:", e);
  }
};

// Função para gerar relatório de presença
export const gerarRelatorioPresenca = async (turmaId) => {
  const turmaRef = collection(firestore, 'turmas');
  const q = query(turmaRef, where("id", "==", turmaId));
  const turmaSnapshot = await getDocs(q);

  if (turmaSnapshot.empty) {
    console.log("Turma não encontrada.");
    return;
  }

  const turmaData = turmaSnapshot.docs[0].data();
  const alunos = turmaData.alunos;  // Lista de alunos

  const presencas = await Promise.all(
    alunos.map(async (alunoId) => {
      const alunoRef = collection(firestore, 'alunos');
      const alunoSnapshot = await getDocs(query(alunoRef, where("id", "==", alunoId)));
      return alunoSnapshot.empty ? null : alunoSnapshot.docs[0].data().presenca;
    })
  );

  return presencas;  // Retorna o relatório de presença
};

// Função para adicionar professor
export const adicionarProfessor = async (nome, email, turmaId) => {
  try {
    const docRef = await addDoc(collection(firestore, "professores"), {
      nome: nome,
      email: email,
    });
    console.log("Professor adicionado com ID:", docRef.id);
    // Após adicionar, associa o professor à turma
    await inserirProfessorNaTurma(docRef.id, turmaId);
  } catch (e) {
    console.error("Erro ao adicionar professor:", e);
  }
};

// Função para inserir professor na turma
export const inserirProfessorNaTurma = async (professorId, turmaId) => {
  try {
    if (!professorId || !turmaId) {
      throw new Error('ID do professor ou da turma não fornecido');
    }

    const turmaRef = doc(firestore, 'turmas', turmaId);
    const turmaSnapshot = await getDoc(turmaRef);

    // Verificar se a turma existe
    if (!turmaSnapshot.exists()) {
      console.log("A turma com esse ID não existe.");
      return;
    }

    const turmaData = turmaSnapshot.data();

    // Verificar se a chave 'professores' existe na turma, se não, inicialize-a
    const professoresAtualizados = turmaData.professores || [];
    professoresAtualizados.push(professorId);

    await updateDoc(turmaRef, { professores: professoresAtualizados });
    console.log("Professor inserido na turma com sucesso.");
  } catch (e) {
    console.error("Erro ao inserir professor na turma:", e);
  }
};


export const excluirProfessor = async (professorId, turmaId) => {
  try {
    // Exclui o professor da coleção 'professores'
    const professorRef = doc(firestore, 'professores', professorId);
    await deleteDoc(professorRef);
    console.log("Professor excluído com sucesso.");

    // Atualiza a turma removendo o professor
    const turmaRef = doc(firestore, 'turmas', turmaId);
    const turmaSnapshot = await getDoc(turmaRef);

    if (turmaSnapshot.exists()) {
      const turmaData = turmaSnapshot.data();

      // Verifica se o campo 'professores' existe e é um array
      const professoresAtualizados = Array.isArray(turmaData.professores)
        ? turmaData.professores.filter(id => id !== professorId)
        : [];

      await updateDoc(turmaRef, { professores: professoresAtualizados });
      console.log("Professor removido da turma com sucesso.");
    } else {
      console.log("Turma não encontrada.");
    }
  } catch (e) {
    console.error("Erro ao excluir professor:", e);
  }
};

// Função para atualizar professor
export const atualizarProfessor = async (professorId, novosDados) => {
  try {
    const professorRef = doc(firestore, 'professores', professorId);
    await updateDoc(professorRef, novosDados); // Atualiza os dados do professor
    console.log("Professor atualizado com sucesso.");
  } catch (e) {
    console.error("Erro ao atualizar professor:", e);
  }
};
// Função para adicionar disciplina
export const adicionarDisciplina = async (nome, turmaId) => {
  try {
    // Criando um novo documento para a disciplina
    const docRef = await addDoc(collection(firestore, "disciplinas"), {
      nome: nome,
      turmaId: turmaId, // Associa a disciplina à turma
    });
    console.log("Disciplina adicionada com ID:", docRef.id);

    // Após adicionar, também associa a disciplina à turma
    await inserirDisciplinaNaTurma(docRef.id, turmaId);
  } catch (e) {
    console.error("Erro ao adicionar disciplina:", e);
  }
};

// Função para associar a disciplina à turma
export const inserirDisciplinaNaTurma = async (disciplinaId, turmaId) => {
  try {
    const turmaRef = doc(firestore, 'turmas', turmaId);
    const turmaSnapshot = await getDoc(turmaRef);
    if (turmaSnapshot.exists()) {
      const turmaData = turmaSnapshot.data();
      const disciplinasAtualizadas = turmaData.disciplinas || [];
      disciplinasAtualizadas.push(disciplinaId);  // Adiciona a disciplina à lista de disciplinas da turma
      await updateDoc(turmaRef, { disciplinas: disciplinasAtualizadas });
      console.log("Disciplina inserida na turma com sucesso.");
    }
  } catch (e) {
    console.error("Erro ao inserir disciplina na turma:", e);
  }
};

export const excluirDisciplina = async (disciplinaId, turmaId) => {
  // Verifica se os IDs foram fornecidos corretamente
  if (!disciplinaId || !turmaId) {
    console.error("ID da disciplina ou da turma não foi fornecido.");
    return;
  }

  try {
    const disciplinaRef = doc(firestore, 'disciplinas', disciplinaId);
    await deleteDoc(disciplinaRef);
    console.log("Disciplina excluída com sucesso.");

    // Atualiza a turma removendo a disciplina
    const turmaRef = doc(firestore, 'turmas', turmaId);
    const turmaSnapshot = await getDoc(turmaRef);
    if (turmaSnapshot.exists()) {
      const turmaData = turmaSnapshot.data();
      const disciplinasAtualizadas = turmaData.disciplinas.filter(id => id !== disciplinaId);  // Remove a disciplina da lista
      await updateDoc(turmaRef, { disciplinas: disciplinasAtualizadas });
      console.log("Disciplina removida da turma com sucesso.");
    }
  } catch (e) {
    console.error("Erro ao excluir disciplina:", e);
  }
};


// Função para atualizar disciplina
export const atualizarDisciplina = async (disciplinaId, novosDados) => {
  try {
    const disciplinaRef = doc(firestore, 'disciplinas', disciplinaId);
    await updateDoc(disciplinaRef, novosDados);  // Atualiza os dados da disciplina
    console.log("Disciplina atualizada com sucesso.");
  } catch (e) {
    console.error("Erro ao atualizar disciplina:", e);
  }
};

// Função para gerar boletim escolar
export const gerarBoletimEscolar = async (alunoId) => {
  const alunoRef = collection(firestore, 'alunos');
  const alunoSnapshot = await getDocs(query(alunoRef, where("id", "==", alunoId)));

  if (alunoSnapshot.empty) {
    console.log("Aluno não encontrado.");
    return;
  }

  const alunoData = alunoSnapshot.docs[0].data();
  return alunoData.boletim;  // Retorna o boletim do aluno
};



// Função para gerar relatório de professores
export const gerarRelatorioProfessor = async (turmaId) => {
  const turmaRef = collection(firestore, 'turmas');
  const q = query(turmaRef, where("id", "==", turmaId));
  const turmaSnapshot = await getDocs(q);

  if (turmaSnapshot.empty) {
    console.log("Turma não encontrada.");
    return;
  }

  const turmaData = turmaSnapshot.docs[0].data();
  const professores = turmaData.professores;  // Lista de professores

  const relatorioProfessores = await Promise.all(
    professores.map(async (professorId) => {
      const professorRef = collection(firestore, 'professores');
      const professorSnapshot = await getDocs(query(professorRef, where("id", "==", professorId)));
      return professorSnapshot.empty ? null : professorSnapshot.docs[0].data();
    })
  );

  return relatorioProfessores;  // Retorna o relatório de professores
};

// Função para gerar relatório de desempenho
export const gerarRelatorioDesempenho = async (alunoId) => {
  const alunoRef = collection(firestore, 'alunos');
  const alunoSnapshot = await getDocs(query(alunoRef, where("id", "==", alunoId)));

  if (alunoSnapshot.empty) {
    console.log("Aluno não encontrado.");
    return;
  }

  const alunoData = alunoSnapshot.docs[0].data();
  return alunoData.desempenho;  // Retorna o desempenho do aluno
};

// Função para adicionar uma nova turma
export const adicionarTurma = async (nome) => {
  try {
    const docRef = await addDoc(collection(firestore, "turmas"), {
      nome: nome,
      disciplinas: []  // Inicializa com um array vazio para disciplinas
    });
    console.log("Turma adicionada com ID:", docRef.id);
    return docRef.id;  // Retorna o ID gerado para a turma
  } catch (e) {
    console.error("Erro ao adicionar turma:", e);
  }
};

