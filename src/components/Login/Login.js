import React, { useState } from 'react';
import { loginWithEmailAndPassword } from '../../firebase';  // Importando a função de login
import './Login.css';  // Supondo que o CSS esteja no mesmo diretório

const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async (e) => {
    e.preventDefault();
    setLoading(true);  // Inicia o carregamento
    setError('');  // Limpa erros anteriores

    // Validação simples de email e senha
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Por favor, insira um email válido');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres');
      setLoading(false);
      return;
    }

    try {
      const userCredential = await loginWithEmailAndPassword(email, password);
      setUser(userCredential.user);
    } catch (error) {
      setError('Erro ao fazer login. Verifique suas credenciais.');
    } finally {
      setLoading(false);  // Termina o carregamento
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      {error && <p>{error}</p>}
      <form onSubmit={login}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            aria-label="Email"
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-label="Senha"
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Carregando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
};

export default Login;
