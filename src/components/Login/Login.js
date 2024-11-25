import React, { useState } from 'react';
import { loginWithEmailAndPassword } from '../../firebase';  // Importando a função de login

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const login = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await loginWithEmailAndPassword(email, password);  // Usando a função do Firebase
      setUser(userCredential.user);  // Atualizando o estado com o usuário logado
    } catch (error) {
      setError(error.message);  // Exibindo erro caso o login falhe
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}  {/* Exibe erros */}
      <form onSubmit={login}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
};

export default Login;
