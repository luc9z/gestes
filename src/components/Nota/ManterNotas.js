import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { getDocs, collection, query, where } from 'firebase/firestore';  // Importando os métodos necessários

const ManterNotas = () => {
    const [turmaId, setTurmaId] = useState('');
    const [disciplinaId, setDisciplinaId] = useState('');
    const [alunoId, setAlunoId] = useState('');
    const [nota, setNota] = useState('');
    const [turmas, setTurmas] = useState([]);
    const [disciplinas, setDisciplinas] = useState([]);
    const [alunos, setAlunos] = useState([]);
    const [erro, setErro] = useState('');

    // Função para buscar as turmas do Firestore
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

    // Função para buscar as disciplinas do Firestore
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

    // Função para carregar alunos da turma selecionada
    useEffect(() => {
        const carregarAlunos = async () => {
            if (!turmaId) return;  // Só carrega os alunos se uma turma for selecionada

            const turmaRef = collection(firestore, 'turmas');
            const turmaSnapshot = await getDocs(turmaRef);
            const turma = turmaSnapshot.docs.find(doc => doc.id === turmaId);

            if (turma) {
                const alunos = turma.data().alunos || [];
                console.log('Alunos associados a essa turma:', alunos); // Verificando se a lista de alunos existe

                // Carregar os dados completos dos alunos
                const alunosComNome = await Promise.all(
                    alunos.map(async (alunoId) => {
                        const alunoRef = collection(firestore, 'alunos');
                        const alunoSnapshot = await getDocs(query(alunoRef, where("id", "==", alunoId)));
                        return alunoSnapshot.empty ? null : alunoSnapshot.docs[0].data();
                    })
                );
                setAlunos(alunosComNome.filter(aluno => aluno));  // Remover nulls
            } else {
                console.log("Nenhuma turma encontrada para o ID fornecido.");
            }
        };

        carregarAlunos();
    }, [turmaId]); // Sempre que a turmaId mudar, carrega os alunos dessa turma

    // Função para salvar a nota
    const handleSalvarNota = async () => {
        if (!nota || !turmaId || !disciplinaId || !alunoId) {
            setErro("Todos os campos são obrigatórios.");
            return;
        }

        try {
            // Salvar a nota no Firestore aqui (exemplo)
            console.log("Nota salva:", { turmaId, disciplinaId, alunoId, nota });
            // Aqui, você pode adicionar a lógica de salvar no Firestore
            // Exemplo:
            // await adicionarNota({ turmaId, disciplinaId, alunoId, nota });

            setErro('');
            alert('Nota salva com sucesso!');
        } catch (error) {
            setErro('Erro ao salvar a nota.');
            console.error("Erro ao salvar a nota:", error);
        }
    };

    return (
        <div>
            <h2>Inserir Notas</h2>

            {erro && <p style={{ color: 'red' }}>{erro}</p>}

            <div>
                <label>Turma:</label>
                <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)}>
                    <option value="">Selecione uma turma</option>
                    {turmas.map(turma => (
                        <option key={turma.id} value={turma.id}>{turma.nome}</option>
                    ))}
                </select>
            </div>

            <div>
                <label>Disciplina:</label>
                <select value={disciplinaId} onChange={(e) => setDisciplinaId(e.target.value)}>
                    <option value="">Selecione uma disciplina</option>
                    {disciplinas.map(disciplina => (
                        <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>
                    ))}
                </select>
            </div>

            <div>
                <label>Aluno:</label>
                <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)}>
                    <option value="">Selecione um aluno</option>
                    {alunos.map(aluno => (
                        <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>
                    ))}
                </select>
            </div>

            <div>
                <label>Nota:</label>
                <input
                    type="number"
                    value={nota}
                    onChange={(e) => setNota(e.target.value)}
                    placeholder="Digite a nota"
                />
            </div>

            <button onClick={handleSalvarNota}>Salvar Nota</button>
        </div>
    );
};

export default ManterNotas;
