import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { auth } from './firebase';  // Importando a autenticação do Firebase
import RoutesComponent from './RoutesComponent';  // Importando o arquivo de rotas

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(setUser);  // Atualizando o estado do usuário no login
    return () => unsubscribe();  // Limpeza do listener
  }, []);

  return (
    <Router>
      <RoutesComponent user={user} setUser={setUser} />
    </Router>
  );
};

export default App;
