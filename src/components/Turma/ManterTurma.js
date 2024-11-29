import React, { useState, useEffect } from 'react';
import { firestore } from '../../firebase';
import { getDocs, collection, addDoc, deleteDoc, doc } from 'firebase/firestore';
import './ManterTurma.css';
import deleteIcon from '../../assets/delete-icon.png';


const ManterTurma = () => {
  const [nome, setNome] = useState('');
  const [turmas, setTurmas] = useState([]);

  // Carregar turmas
  useEffect(() => {
    const carregarTurmas = async () => {
      const turmaSnapshot = await getDocs(collection(firestore, 'turmas'));
      const listaDeTurmas = turmaSnapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setTurmas(listaDeTurmas);
    };
    carregarTurmas();
  }, []);  // Carregar turmas apenas uma vez ao montar o componente

  // Função para adicionar turma
  const adicionarTurma = async (e) => {
    e.preventDefault();
    if (nome.trim()) {
      // Adicionando nova turma no Firestore
      await addDoc(collection(firestore, 'turmas'), { nome });
      setNome('');  // Limpa o campo de nome após adicionar

      // Atualizar a lista de turmas sem precisar dar F5
      const turmaSnapshot = await getDocs(collection(firestore, 'turmas'));
      const listaDeTurmas = turmaSnapshot.docs.map((doc) => ({
        id: doc.id,
        nome: doc.data().nome,
      }));
      setTurmas(listaDeTurmas);  // Atualiza o estado
    }
  };

  // Função para excluir turma
  const excluirTurma = async (id) => {
    // Excluir a turma do Firestore
    await deleteDoc(doc(firestore, 'turmas', id));

    // Atualizar a lista de turmas removendo a excluída
    setTurmas(turmas.filter((turma) => turma.id !== id));  // Remove a turma excluída
  };

  return (
    <div className="container">
      <h2>Gerenciar Turmas</h2>
      
      {/* Formulário para adicionar nova turma */}
      <form className="form-container" onSubmit={adicionarTurma}>
        <input
          type="text"
          placeholder="Nome da Turma"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <button type="submit">Adicionar Turma</button>
      </form>

      {/* Tabela de turmas */}
      <table className="turma-table">
        <thead>
          <tr>
            <th>Nome da Turma</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {turmas.map((turma) => (
            <tr key={turma.id}>
              <td>{turma.nome}</td>
              <td className="actions">
                {/* Apenas botão de deletar */}
                <button onClick={() => excluirTurma(turma.id)}>
                  <img src={deleteIcon} alt="Excluir" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManterTurma;
