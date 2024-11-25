import React, { useState } from 'react';
import { gerarRelatorioPresenca } from '../../firebase';  // Importando a função

const GerarRelatorio = () => {
  const [relatorio, setRelatorio] = useState(null);
  const [erro, setErro] = useState('');

  const handleSolicitarRelatorio = async (turmaId) => {
    try {
      const dadosRelatorio = await gerarRelatorioPresenca(turmaId);
      setRelatorio(dadosRelatorio);
    } catch (error) {
      setErro(error.message);
    }
  };

  return (
    <div>
      <h2>Gerar Relatório de Presença</h2>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
      <button onClick={() => handleSolicitarRelatorio('turmaId')}>Gerar Relatório de Presença</button>

      {relatorio && <div><h3>Relatório:</h3><pre>{JSON.stringify(relatorio, null, 2)}</pre></div>}
    </div>
  );
};

export default GerarRelatorio;
